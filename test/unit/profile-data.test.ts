import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateProfileData, type ProfileData } from '../../src/profile/profile-data.js';

const valid = (): ProfileData => ({
  name: 'Демонстрационный профиль',
  description: 'Шаблон, не реальное резюме.',
  links: [{ label: 'Пример', url: 'https://example.com' }],
  skills: [{ name: 'TypeScript' }],
  experience: [
    {
      company: 'Учебный пример',
      position: 'Разработчик',
      startDate: '2024-01-01',
      endDate: null,
      achievements: ['Пример достижения'],
    },
  ],
  projects: [{ name: 'Пример проекта', url: 'https://example.com/project' }],
});

test('valid profile and empty collections are accepted', () => {
  assert.doesNotThrow(() => validateProfileData(valid()));
  assert.doesNotThrow(() =>
    validateProfileData({ ...valid(), links: [], skills: [], experience: [], projects: [] }),
  );
});
test('blank names and descriptions are rejected', () => {
  assert.throws(() => validateProfileData({ ...valid(), name: '  ' }), /name/);
  assert.throws(() => validateProfileData({ ...valid(), description: '' }), /description/);
});
test('only HTTP(S) links without credentials are accepted', () => {
  for (const url of ['javascript:alert(1)', 'not-a-url', 'https://user:secret@example.com']) {
    assert.throws(
      () => validateProfileData({ ...valid(), links: [{ label: 'link', url }] }),
      /url/,
    );
  }
});
test('invalid calendar dates and reversed periods are rejected', () => {
  for (const startDate of ['2024-02-30', 'not-a-date', '2024-1-1']) {
    const data = valid();
    data.experience[0]!.startDate = startDate;
    assert.throws(() => validateProfileData(data), /Date/);
  }
  const data = valid();
  data.experience[0]!.endDate = '2023-12-01';
  assert.throws(() => validateProfileData(data), /period/);
});
