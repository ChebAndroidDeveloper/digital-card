import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response, NextFunction } from 'express';

export class RequestLimiter {
  private readonly records = new Map<string, { count: number; expires: number }>();
  private nextCleanup = 0;

  constructor(
    private readonly limit = 100,
    private readonly windowMs = 60_000,
    private readonly maxClients = 10_000,
  ) {}

  consume(ip: string, now = Date.now()): number {
    if (now >= this.nextCleanup) {
      for (const [key, value] of this.records) {
        if (value.expires <= now) this.records.delete(key);
      }
      this.nextCleanup = now + 1000;
    }
    let record = this.records.get(ip);
    if (record && record.expires <= now) {
      this.records.delete(ip);
      record = undefined;
    }
    if (!record) {
      // Fail closed at capacity instead of evicting active clients' counters.
      if (this.records.size >= this.maxClients) return 1;
      record = { count: 0, expires: now + this.windowMs };
      this.records.set(ip, record);
    }
    if (record.count >= this.limit) {
      return Math.max(1, Math.ceil((record.expires - now) / 1000));
    }
    record.count++;
    return 0;
  }
}

export function configureHttpSecurity(app: NestExpressApplication) {
  // Explicit IPs/CIDRs only: never trust arbitrary forwarded headers by default.
  const proxies = process.env.TRUSTED_PROXIES?.split(',').map((s) => s.trim()).filter(Boolean);
  app.set('trust proxy', proxies?.length ? proxies : false);
  const limiter = new RequestLimiter();
  app.use('/graphql', (req: Request, res: Response, next: NextFunction) => {
    const retryAfter = limiter.consume(req.ip ?? req.socket.remoteAddress ?? 'unknown');
    if (!retryAfter) return next();
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      errors: [{ message: 'Too many requests, please try again later.', extensions: { code: 'TOO_MANY_REQUESTS' } }],
    });
  });
}
