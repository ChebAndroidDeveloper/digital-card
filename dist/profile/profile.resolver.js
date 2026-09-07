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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const profile_service_1 = require("./profile.service");
const profile_model_1 = require("./models/profile.model");
let ProfileResolver = class ProfileResolver {
    profileService;
    constructor(profileService) {
        this.profileService = profileService;
    }
    async getProfile(locale) {
        return this.profileService.findByLocale(locale);
    }
    async skills(profile) {
        return this.profileService.getSkills(profile.id);
    }
    async experience(profile) {
        return this.profileService.getExperience(profile.id);
    }
    async projects(profile) {
        return this.profileService.getProjects(profile.id);
    }
    async education(profile) {
        return this.profileService.getEducation(profile.id);
    }
};
exports.ProfileResolver = ProfileResolver;
__decorate([
    (0, graphql_1.Query)(() => profile_model_1.Profile, {
        name: 'profile',
        nullable: true,
        description: 'Get developer profile by locale (default: "en", supported: "en", "ru")',
    }),
    __param(0, (0, graphql_1.Args)('locale', { type: () => String, nullable: true, defaultValue: 'en' })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfileResolver.prototype, "getProfile", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [profile_model_1.Skill], { description: 'Skills related to this profile' }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [profile_model_1.Profile]),
    __metadata("design:returntype", Promise)
], ProfileResolver.prototype, "skills", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [profile_model_1.Experience], {
        description: 'Work history related to this profile',
    }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [profile_model_1.Profile]),
    __metadata("design:returntype", Promise)
], ProfileResolver.prototype, "experience", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [profile_model_1.Project], {
        description: 'Projects related to this profile',
    }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [profile_model_1.Profile]),
    __metadata("design:returntype", Promise)
], ProfileResolver.prototype, "projects", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [profile_model_1.Education], {
        description: 'Education history related to this profile',
    }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [profile_model_1.Profile]),
    __metadata("design:returntype", Promise)
], ProfileResolver.prototype, "education", null);
exports.ProfileResolver = ProfileResolver = __decorate([
    (0, graphql_1.Resolver)(() => profile_model_1.Profile),
    __metadata("design:paramtypes", [profile_service_1.ProfileService])
], ProfileResolver);
//# sourceMappingURL=profile.resolver.js.map