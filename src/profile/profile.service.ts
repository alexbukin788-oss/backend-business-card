import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository.js';
import { PROFILE_ID } from './profile-data.js';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}
  getProfile() {
    return this.repository.findProfile(PROFILE_ID);
  }
}
