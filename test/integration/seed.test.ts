import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { testDatabase } from './database.js';
import { profileData } from '../../prisma/profile.data.js';
import { PROFILE_ID, seedProfile } from '../../src/profile/seed-profile.js';

const db = testDatabase();
after(() => db.$disconnect());
const snapshot = () =>
  db.profile.findUnique({
    where: { id: PROFILE_ID },
    include: { skills: true, links: true, experience: true, projects: true },
  });

test('seed creates a full profile and repeats without duplicates', async () => {
  await db.profile.deleteMany();
  await seedProfile(db, profileData);
  assert.equal((await snapshot())?.name, profileData.name);
  await seedProfile(db, profileData);
  assert.equal(await db.profile.count(), 1);
  assert.equal(await db.skill.count(), profileData.skills.length);
  assert.equal(await db.experience.count(), profileData.experience.length);
});
test('seed updates own collections and preserves unrelated profiles', async () => {
  await db.profile.upsert({
    where: { id: 'unrelated' },
    create: { id: 'unrelated', name: 'Untouched', description: 'Other profile' },
    update: {},
  });
  await seedProfile(db, {
    ...profileData,
    name: 'Updated demo',
    skills: [{ name: 'Only one' }],
    experience: [],
    projects: [],
  });
  const data = await snapshot();
  assert.equal(data?.name, 'Updated demo');
  assert.equal(data?.skills.length, 1);
  assert.equal(data?.experience.length, 0);
  assert.equal((await db.profile.findUnique({ where: { id: 'unrelated' } }))?.name, 'Untouched');
});
test('database failure rolls back profile and collections together', async () => {
  await seedProfile(db, profileData);
  const before = await snapshot();
  // PostgreSQL TEXT cannot contain a NUL. Failure occurs in the DB after the profile update.
  await assert.rejects(
    seedProfile(db, {
      ...profileData,
      name: 'Must roll back',
      projects: [{ name: 'invalid\u0000text', url: 'https://example.com' }],
    }),
  );
  assert.deepEqual(await snapshot(), before);
});
