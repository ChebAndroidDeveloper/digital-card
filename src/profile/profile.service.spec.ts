jest.mock('@nestjs/common', () => ({
  Injectable: () => (target: any) => target,
}));

import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let mockPrismaService: any;

  beforeEach(() => {
    mockPrismaService = {
      profile: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'test-uuid',
          locale: 'en',
          name: 'Konstantin Chumbakov',
          title: 'Software Engineer / Fullstack Developer',
        }),
      },
      skill: {
        findMany: jest.fn().mockResolvedValue([
          { id: '1', name: 'TypeScript', category: 'Backend' },
        ]),
      },
    };

    service = new ProfileService(mockPrismaService as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return profile by locale', async () => {
    const profile = await service.findByLocale('en');
    expect(profile).toBeDefined();
    expect(profile?.name).toBe('Konstantin Chumbakov');
    expect(mockPrismaService.profile.findFirst).toHaveBeenCalledWith({
      where: { locale: 'en' },
    });
  });

  it('should return skills for profile', async () => {
    const skills = await service.getSkills('test-uuid');
    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('TypeScript');
  });
});