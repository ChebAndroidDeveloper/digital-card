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
let ProfileService = class ProfileService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByLocale(locale = 'en') {
        return this.prisma.profile.findFirst({
            where: { locale },
        });
    }
    async getSkills(profileId) {
        return this.prisma.skill.findMany({
            where: { profileId },
            orderBy: { category: 'asc' },
        });
    }
    async getExperience(profileId) {
        return this.prisma.experience.findMany({
            where: { profileId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getProjects(profileId) {
        return this.prisma.project.findMany({
            where: { profileId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getEducation(profileId) {
        return this.prisma.education.findMany({
            where: { profileId },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map