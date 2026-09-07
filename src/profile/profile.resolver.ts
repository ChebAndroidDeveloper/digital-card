import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { ProfileService } from './profile.service';
import {
  Profile,
  Skill,
  Experience,
  Project,
  Education,
} from './models/profile.model';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile, {
    name: 'profile',
    nullable: true,
    description:
      'Get developer profile by locale (default: "en", supported: "en", "ru")',
  })
  async getProfile(
    @Args('locale', { type: () => String, nullable: true, defaultValue: 'en' })
    locale: string,
  ) {
    return this.profileService.findByLocale(locale);
  }

  @ResolveField(() => [Skill], { description: 'Skills related to this profile' })
  async skills(@Parent() profile: Profile) {
    return this.profileService.getSkills(profile.id);
  }

  @ResolveField(() => [Experience], {
    description: 'Work history related to this profile',
  })
  async experience(@Parent() profile: Profile) {
    return this.profileService.getExperience(profile.id);
  }

  @ResolveField(() => [Project], {
    description: 'Projects related to this profile',
  })
  async projects(@Parent() profile: Profile) {
    return this.profileService.getProjects(profile.id);
  }

  @ResolveField(() => [Education], {
    description: 'Education history related to this profile',
  })
  async education(@Parent() profile: Profile) {
    return this.profileService.getEducation(profile.id);
  }
}
