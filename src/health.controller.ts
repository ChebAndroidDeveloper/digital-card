import {
  Controller,
  Get,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { withTimeout } from './common/with-timeout';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private pending?: Promise<unknown>;

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // Пока БД отвечает на прошлую проверку, новую не запускаем.
      this.pending ??= Promise.resolve(this.prisma.$queryRaw`SELECT 1`).finally(
        () => {
          this.pending = undefined;
        },
      );
      await withTimeout(this.pending, 2000);
      return { status: 'ok', uptime: process.uptime() };
    } catch (error: unknown) {
      this.logger.error(
        'Database health check failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw new ServiceUnavailableException({ status: 'unhealthy' });
    }
  }
}
