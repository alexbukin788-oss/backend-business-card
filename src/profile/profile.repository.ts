import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.module.js';
import type { Prisma } from '../generated/prisma/client.js';

export type ProfileRecord = Prisma.ProfileGetPayload<{
  include: { links: true; skills: true; experience: true; projects: true };
}>;

@Injectable()
export class ProfileRepository {
  constructor(private readonly db: DatabaseService) {}
  findProfile(profileId: string): Promise<ProfileRecord | null> {
    return this.db.client.profile.findUnique({
      where: { id: profileId },
      include: {
        links: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
        experience: { orderBy: { order: 'asc' } },
        projects: { orderBy: { order: 'asc' } },
      },
    });
  }
}
