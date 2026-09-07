import { PrismaService } from '../prisma/prisma.service';
export declare class ProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByLocale(locale?: string): Promise<{
        id: string;
        locale: string;
        name: string;
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
        id: string;
        name: string;
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
    }[]>;
    getProjects(profileId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        profileId: string;
        url: string | null;
    }[]>;
    getEducation(profileId: string): Promise<{
        id: string;
        createdAt: Date;
        profileId: string;
        institution: string;
        year: string;
        faculty: string;
    }[]>;
}
