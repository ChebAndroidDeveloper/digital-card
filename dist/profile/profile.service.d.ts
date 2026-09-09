import { PrismaService } from '../prisma/prisma.service';
export declare class ProfileService {
    private readonly prisma;
    private readonly cache;
    private readonly ttlMs;
    constructor(prisma: PrismaService);
    private cached;
    findByLocale(locale?: string): Promise<{
        name: string;
        id: string;
        locale: string;
        title: string;
        description: string;
        location: string | null;
        phone: string | null;
        telegram: string | null;
        githubUrl: string | null;
        linkedinUrl: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getSkills(profileId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        category: string | null;
        profileId: string;
    }[]>;
    getExperience(profileId: string): Promise<{
        id: string;
        createdAt: Date;
        profileId: string;
        company: string;
        position: string;
        period: string;
        achievements: string[];
        sortOrder: number;
    }[]>;
    getProjects(profileId: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        profileId: string;
        sortOrder: number;
        url: string | null;
    }[]>;
    getEducation(profileId: string): Promise<{
        id: string;
        createdAt: Date;
        profileId: string;
        sortOrder: number;
        institution: string;
        year: string;
        faculty: string;
    }[]>;
}
