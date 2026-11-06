import assert from 'node:assert/strict';

const base = process.env.SMOKE_URL ?? 'http://127.0.0.1:3000';
const response = await fetch(`${base}/graphql`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    query:
      '{ profile { name description links { label url } skills { name } experience { company position startDate endDate achievements } projects { name url } } }',
  }),
});
assert.equal(response.status, 200);
const result = await response.json();
assert.equal(result.errors, undefined);
assert.ok(result.data.profile.name);
assert.ok(Array.isArray(result.data.profile.skills));
assert.equal((await fetch(`${base}/health`)).status, 200);
const page = await fetch(`${base}/graphql`, { headers: { accept: 'text/html' } });
assert.equal(page.status, 200);
assert.match(await page.text(), /apollo/i);
console.log(
  JSON.stringify({
    status: 'PASS',
    profile: result.data.profile.name,
    skills: result.data.profile.skills.length,
    experience: result.data.profile.experience.length,
    projects: result.data.profile.projects.length,
    sandbox: 'HTML served',
  }),
);
