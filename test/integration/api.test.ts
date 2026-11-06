import 'reflect-metadata';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module.js';
import { DatabaseService } from '../../src/database/database.module.js';
import { testDatabase } from './database.js';
import { seedProfile, PROFILE_ID } from '../../src/profile/seed-profile.js';
import { profileData } from '../../prisma/profile.data.js';

const db = testDatabase();
let app: INestApplication;
let base: string;
let selects = 0;
const query = async (query: string) => {
  const response = await fetch(`${base}/graphql`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return response.json() as Promise<any>;
};
before(async () => {
  await seedProfile(db, profileData);
  const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = module.createNestApplication();
  app.get(DatabaseService).client.$on('query', (event) => {
    if (/^SELECT/i.test(event.query)) selects++;
  });
  await app.listen(0, '127.0.0.1');
  base = await app.getUrl();
});
after(async () => {
  await app?.close();
  await db.$disconnect();
});

test('employer query returns profile and nested data', async () => {
  const result = await query(
    '{ profile { name description skills { name } experience { company position } projects { name } } }',
  );
  assert.equal(result.errors, undefined);
  assert.equal(result.data.profile?.name, profileData.name);
  assert.deepEqual(result.data.profile.skills, profileData.skills);
});
test('all requested fields preserve order and current employment has null endDate', async () => {
  const result = await query(
    '{ profile { links { label url } experience { startDate endDate achievements } projects { name url } } }',
  );
  assert.deepEqual(result.data.profile?.links, profileData.links);
  assert.equal(result.data.profile.experience[0].startDate, '2024-01-01T00:00:00.000Z');
  assert.equal(result.data.profile.experience[0].endDate, null);
  assert.deepEqual(
    result.data.profile.experience[0].achievements,
    profileData.experience[0]!.achievements,
  );
  assert.deepEqual(result.data.profile.projects, profileData.projects);
});
test('number of SELECTs stays bounded as nested collections grow', async () => {
  const document =
    '{ profile { skills { name } experience { company } projects { name } links { url } } }';
  selects = 0;
  await query(document);
  const small = selects;
  assert.ok(small > 0 && small <= 5, `Expected 1–5 SELECTs, got ${small}`);
  await seedProfile(db, {
    ...profileData,
    skills: Array.from({ length: 40 }, (_, i) => ({ name: `Skill ${i}` })),
  });
  selects = 0;
  const large = await query(document);
  assert.equal(large.data.profile.skills.length, 40);
  assert.equal(selects, small);
  await seedProfile(db, profileData);
});
test('empty relations and missing profile have explicit results', async () => {
  await seedProfile(db, { ...profileData, skills: [], experience: [], projects: [], links: [] });
  const empty = await query('{ profile { skills { name } projects { name } } }');
  assert.deepEqual(empty.data.profile, { skills: [], projects: [] });
  await db.profile.delete({ where: { id: PROFILE_ID } });
  assert.deepEqual((await query('{ profile { name } }')).data, { profile: null });
  await seedProfile(db, profileData);
});
test('Sandbox, readiness, and introspection are available; mutations are absent', async () => {
  assert.equal((await fetch(`${base}/health`)).status, 200);
  const sandbox = await fetch(`${base}/graphql`, { headers: { accept: 'text/html' } });
  assert.equal(sandbox.status, 200);
  assert.match(await sandbox.text(), /apollo/i);
  const schema = await query('{ __schema { mutationType { name } queryType { name } } }');
  assert.equal(schema.data.__schema.mutationType, null);
  assert.equal(schema.data.__schema.queryType.name, 'Query');
});
