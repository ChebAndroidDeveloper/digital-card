import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  private readonly cache = new Map<string, { value: Promise<unknown>; expiresAt: number }>();
  private readonly ttlMs = 60_000;
  private readonly queryTimeoutMs = 5_000;

  constructor(private readonly prisma: PrismaService) {}

  private cached<T>(key: string, load: () => PromiseLike<T>): Promise<T> {
    const now = Date.now();
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > now) return entry.value as Promise<T>;
    for (const [oldKey, oldEntry] of this.cache) {
      if (oldEntry.expiresAt <= now) this.cache.delete(oldKey);
    }

    // Ограничиваем время обращения к БД таймаутом, чтобы предотвратить зависание
    const loadWithTimeout = Promise.race([
      Promise.resolve().then(load),
      new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Database query timed out after ${this.queryTimeoutMs}ms`));
        }, this.queryTimeoutMs);
        if (typeof timer.unref === 'function') timer.unref();
      }),
    ]);

    // Вместо Infinity даём запросу ограниченный срок жизни (5 сек)
    const next = { value: loadWithTimeout, expiresAt: now + this.queryTimeoutMs };
    if (this.cache.size >= 256) return next.value;
    this.cache.set(key, next);

    void next.value.then(
      () => { next.expiresAt = Date.now() + this.ttlMs; },
      () => { if (this.cache.get(key) === next) this.cache.delete(key); },
    );
    return next.value;
  }

  async findByLocale(locale: string = 'en') {
    if (locale !== 'en' && locale !== 'ru') return null;
    return this.cached(`profile:${locale}`, () => this.prisma.profile.findFirst({ where: { locale } }));
  }

  getSkills(profileId: string) {
    return this.cached(`skills:${profileId}`, () => this.prisma.skill.findMany({
      where: { profileId }, orderBy: [{ category: 'asc' }, { name: 'asc' }],
    }));
  }

  getExperience(profileId: string) {
    return this.cached(`experience:${profileId}`, () => this.prisma.experience.findMany({
      where: { profileId }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    }));
  }

  getProjects(profileId: string) {
    return this.cached(`projects:${profileId}`, () => this.prisma.project.findMany({
      where: { profileId }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    }));
  }

  getEducation(profileId: string) {
    return this.cached(`education:${profileId}`, () => this.prisma.education.findMany({
      where: { profileId }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    }));
  }
}