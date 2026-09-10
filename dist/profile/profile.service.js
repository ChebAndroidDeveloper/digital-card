"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const with_timeout_1 = require("../common/with-timeout");
let ProfileService = class ProfileService {
    prisma;
    cache = new Map();
    ttlMs = 60_000;
    queryTimeoutMs = 8_000;
    constructor(prisma) {
        this.prisma = prisma;
    }
    cached(key, load) {
        const now = Date.now();
        const entry = this.cache.get(key);
        if (entry && entry.expiresAt > now)
            return entry.value;
        for (const [oldKey, oldEntry] of this.cache) {
            if (oldEntry.expiresAt <= now)
                this.cache.delete(oldKey);
        }
        const loadWithTimeout = (0, with_timeout_1.withTimeout)(Promise.resolve().then(load), this.queryTimeoutMs);
        const next = {
            value: loadWithTimeout,
            expiresAt: now + this.queryTimeoutMs,
        };
        if (this.cache.size >= 256)
            return next.value;
        this.cache.set(key, next);
        void next.value.then(() => {
            next.expiresAt = Date.now() + this.ttlMs;
        }, () => {
            if (this.cache.get(key) === next)
                this.cache.delete(key);
        });
        return next.value;
    }
    async findByLocale(locale = 'en') {
        if (locale !== 'en' && locale !== 'ru')
            return null;
        return this.cached(`profile:${locale}`, () => this.prisma.profile.findUnique({ where: { locale } }));
    }
    getSkills(profileId) {
        return this.cached(`skills:${profileId}`, () => this.prisma.skill.findMany({
            where: { profileId },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        }));
    }
    getExperience(profileId) {
        return this.cached(`experience:${profileId}`, () => this.prisma.experience.findMany({
            where: { profileId },
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        }));
    }
    getProjects(profileId) {
        return this.cached(`projects:${profileId}`, () => this.prisma.project.findMany({
            where: { profileId },
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        }));
    }
    getEducation(profileId) {
        return this.cached(`education:${profileId}`, () => this.prisma.education.findMany({
            where: { profileId },
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        }));
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map