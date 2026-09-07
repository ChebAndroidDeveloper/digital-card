import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  private readonly cache = new Map<string, { value: Promise<unknown>; expiresAt: number }>();
  private readonly ttlMs = 60_000;

  constructor(private readonly prisma: PrismaService) {}

  private cached<T>(key: string, load: () => PromiseLike<T>): Promise<T> {
    const now = Date.now();
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > now) return entry.value as Promise<T>;
    for (const [oldKey, oldEntry] of this.cache) {
      if (oldEntry.expiresAt <= now) this.cache.delete(oldKey);
    }
    // Pending requests are cached immediately; failures can be retried.
    const next = { value: Promise.resolve().then(load), expiresAt: Infinity };
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
      where: { profileId }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    }));
  }

  getProjects(profileId: string) {
    return this.cached(`projects:${profileId}`, () => this.prisma.project.findMany({
      where: { profileId }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    }));
  }

  getEducation(profileId: string) {
    return this.cached(`education:${profileId}`, () => this.prisma.education.findMany({
      where: { profileId }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    }));
  }
}
