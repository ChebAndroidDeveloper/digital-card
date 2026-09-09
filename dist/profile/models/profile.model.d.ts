export declare class Skill {
    id: string;
    name: string;
    category?: string;
}
export declare class Experience {
    sortOrder?: number;
    id: string;
    company: string;
    position: string;
    period: string;
    achievements: string[];
}
export declare class Project {
    sortOrder?: number;
    id: string;
    name: string;
    description?: string;
    url?: string;
}
export declare class Education {
    sortOrder?: number;
    id: string;
    institution: string;
    year: string;
    faculty: string;
}
export declare class Profile {
    id: string;
    locale: string;
    name: string;
    title: string;
    description: string;
    location?: string;
    phone?: string;
    telegram?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    email?: string;
    skills: Skill[];
    experience: Experience[];
    projects: Project[];
    education: Education[];
}
