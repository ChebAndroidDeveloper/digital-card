import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType({ description: 'Professional skill' })
export class Skill {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  category?: string;
}

@ObjectType({ description: 'Work experience entry' })
export class Experience {

  @Field(() => Int, { nullable: true, description: 'Display sort order' })
  sortOrder?: number;

  @Field(() => ID)
  id: string;

  @Field(() => String)
  company: string;

  @Field(() => String)
  position: string;

  @Field(() => String)
  period: string;

  @Field(() => [String], { description: 'List of key achievements' })
  achievements: string[];
}

@ObjectType({ description: 'Portfolio project' })
export class Project {

  @Field(() => Int, { nullable: true, description: 'Display sort order' })
  sortOrder?: number;

  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  url?: string;
}

@ObjectType({ description: 'Education entry' })
export class Education {

  @Field(() => Int, { nullable: true, description: 'Display sort order' })
  sortOrder?: number;

  @Field(() => ID)
  id: string;

  @Field(() => String)
  institution: string;

  @Field(() => String)
  year: string;

  @Field(() => String)
  faculty: string;
}

@ObjectType({ description: 'Developer business card profile' })
export class Profile {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  locale: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  telegram?: string;

  @Field(() => String, { nullable: true })
  githubUrl?: string;

  @Field(() => String, { nullable: true })
  linkedinUrl?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => [Skill], { description: 'Skills list' })
  skills: Skill[];

  @Field(() => [Experience], { description: 'Work experience history' })
  experience: Experience[];

  @Field(() => [Project], { description: 'Projects list' })
  projects: Project[];

  @Field(() => [Education], { description: 'Education history' })
  education: Education[];
}