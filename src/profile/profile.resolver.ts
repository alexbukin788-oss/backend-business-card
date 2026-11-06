import { Query, Resolver } from '@nestjs/graphql';
import { Profile } from './profile.model.js';
import { ProfileService } from './profile.service.js';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly service: ProfileService) {}
  @Query(() => Profile, {
    nullable: true,
    description: 'Профиль специалиста и связанные сведения.',
  })
  profile() {
    return this.service.getProfile();
  }
}
