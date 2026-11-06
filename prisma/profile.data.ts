import type { ProfileData } from '../src/profile/profile-data.js';

// Все значения — демонстрационные. Заменить своими перед отправкой работодателю.
export const profileData: ProfileData = {
  name: 'Демонстрационный профиль',
  description:
    'Шаблон backend-визитки. Имя, опыт и проекты ниже не являются реальной биографией кандидата.',
  links: [
    { label: 'Пример профессиональной ссылки — заменить', url: 'https://example.com/profile' },
  ],
  skills: [{ name: 'TypeScript' }, { name: 'NestJS' }, { name: 'PostgreSQL' }, { name: 'GraphQL' }],
  experience: [
    {
      company: 'Демонстрационная компания — заменить',
      position: 'Пример: backend-разработчик',
      startDate: '2024-01-01',
      endDate: null,
      achievements: [
        'Демонстрационное достижение — заменить подтверждённым результатом своей работы.',
      ],
    },
  ],
  projects: [{ name: 'Демонстрационный проект — заменить', url: 'https://example.com/project' }],
};
