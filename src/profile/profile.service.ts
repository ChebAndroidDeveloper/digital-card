import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findByLocale(locale: string = 'en') {
    return this.prisma.profile.findFirst({
      where: { locale },
    });
  }

  async getSkills(profileId: string) {
    return this.prisma.skill.findMany({
      where: { profileId },
      orderBy: { category: 'asc' },
    });
  }

  async getExperience(profileId: string) {
    return this.prisma.experience.findMany({
      where: { profileId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getProjects(profileId: string) {
    return this.prisma.project.findMany({
      where: { profileId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getEducation(profileId: string) {
    return this.prisma.education.findMany({
      where: { profileId },
      orderBy: { createdAt: 'asc' },
    });
  }
}