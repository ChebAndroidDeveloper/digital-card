import { ProfileService } from './profile.service';
import { Profile } from './models/profile.model';
export declare class ProfileResolver {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getProfile(locale: string): Promise<{
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
    skills(profile: Profile): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        category: string | null;
        profileId: string;
    }[]>;
    experience(profile: Profile): Promise<{
        id: string;
        createdAt: Date;
        profileId: string;
        company: string;
        position: string;
        period: string;
        achievements: string[];
    }[]>;
    projects(profile: Profile): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        profileId: string;
        url: string | null;
    }[]>;
    education(profile: Profile): Promise<{
        id: string;
        createdAt: Date;
        profileId: string;
        institution: string;
        year: string;
        faculty: string;
    }[]>;
}
