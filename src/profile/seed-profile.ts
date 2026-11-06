import type { DatabaseClient } from '../database/client.js';
import { PROFILE_ID, validateProfileData, type ProfileData } from './profile-data.js';
export { PROFILE_ID } from './profile-data.js';
export async function seedProfile(client: DatabaseClient, data: ProfileData): Promise<void> {
  validateProfileData(data);
  const ordered = <T extends object>(items: T[]) =>
    items.map((item, order) => ({ ...item, order }));
  const collections = {
    links: ordered(data.links),
    skills: ordered(data.skills),
    projects: ordered(data.projects),
    experience: ordered(
      data.experience.map((job) => ({
        ...job,
        startDate: new Date(job.startDate),
        endDate: job.endDate ? new Date(job.endDate) : null,
      })),
    ),
  };
  await client.$transaction(
    async (tx) => {
      // Serialize concurrent initializations of this singleton only.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(612704031)`;
      await tx.profile.upsert({
        where: { id: PROFILE_ID },
        create: {
          id: PROFILE_ID,
          name: data.name,
          description: data.description,
          links: { create: collections.links },
          skills: { create: collections.skills },
          experience: { create: collections.experience },
          projects: { create: collections.projects },
        },
        update: {
          name: data.name,
          description: data.description,
          links: { deleteMany: {}, create: collections.links },
          skills: { deleteMany: {}, create: collections.skills },
          experience: { deleteMany: {}, create: collections.experience },
          projects: { deleteMany: {}, create: collections.projects },
        },
      });
    },
    { timeout: 15000 },
  );
}
