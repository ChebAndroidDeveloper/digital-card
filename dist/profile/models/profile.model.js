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
exports.Profile = exports.Education = exports.Project = exports.Experience = exports.Skill = void 0;
const graphql_1 = require("@nestjs/graphql");
let Skill = class Skill {
    id;
    name;
    category;
};
exports.Skill = Skill;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Skill.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Skill.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "category", void 0);
exports.Skill = Skill = __decorate([
    (0, graphql_1.ObjectType)({ description: 'Professional skill' })
], Skill);
let Experience = class Experience {
    id;
    company;
    position;
    period;
    achievements;
};
exports.Experience = Experience;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Experience.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Experience.prototype, "company", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Experience.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Experience.prototype, "period", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { description: 'List of key achievements' }),
    __metadata("design:type", Array)
], Experience.prototype, "achievements", void 0);
exports.Experience = Experience = __decorate([
    (0, graphql_1.ObjectType)({ description: 'Work experience entry' })
], Experience);
let Project = class Project {
    id;
    name;
    description;
    url;
};
exports.Project = Project;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Project.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "url", void 0);
exports.Project = Project = __decorate([
    (0, graphql_1.ObjectType)({ description: 'Portfolio project' })
], Project);
let Education = class Education {
    id;
    institution;
    year;
    faculty;
};
exports.Education = Education;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Education.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Education.prototype, "institution", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Education.prototype, "year", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Education.prototype, "faculty", void 0);
exports.Education = Education = __decorate([
    (0, graphql_1.ObjectType)({ description: 'Education entry' })
], Education);
let Profile = class Profile {
    id;
    locale;
    name;
    title;
    description;
    location;
    phone;
    telegram;
    githubUrl;
    linkedinUrl;
    email;
    skills;
    experience;
    projects;
    education;
};
exports.Profile = Profile;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Profile.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Profile.prototype, "locale", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Profile.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Profile.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Profile.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "telegram", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "githubUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "linkedinUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Skill], { description: 'Skills list' }),
    __metadata("design:type", Array)
], Profile.prototype, "skills", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Experience], { description: 'Work experience history' }),
    __metadata("design:type", Array)
], Profile.prototype, "experience", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Project], { description: 'Projects list' }),
    __metadata("design:type", Array)
], Profile.prototype, "projects", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Education], { description: 'Education history' }),
    __metadata("design:type", Array)
], Profile.prototype, "education", void 0);
exports.Profile = Profile = __decorate([
    (0, graphql_1.ObjectType)({ description: 'Developer business card profile' })
], Profile);
//# sourceMappingURL=profile.model.js.map