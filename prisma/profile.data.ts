import type { ProfileData } from '../src/profile/profile-data.js';

// Данные из резюме HeadHunter и подтверждённых проектов.
export const profileData: ProfileData = {
  name: 'Алексей Бурый',
  description:
    'TypeScript-разработчик. Работаю над платформой веб-приложений: сайт, серверный API и CRM. Использую TypeScript, JavaScript, Node.js, NestJS, PostgreSQL, Prisma и Docker; работаю с S3, генерацией PDF и инструментами ИИ.',
  links: [{ label: 'GitHub', url: 'https://github.com/alexbukin788-oss' }],
  skills: [
    'TypeScript',
    'JavaScript',
    'Node.js',
    'NestJS',
    'PostgreSQL',
    'Prisma',
    'Docker',
    'S3',
    'Генерация PDF',
    'ComfyUI',
    'Codex',
  ].map((name) => ({ name })),
  // Компании, периоды и достижения в резюме не заполнены; ожидают уточнения.
  experience: [],
  projects: [
    { name: 'Сказка про тебя — платформа приложений', url: 'https://skazka-pro-tebya.ru' },
    {
      name: 'Backend-визитка: NestJS, Prisma и GraphQL',
      url: 'https://github.com/alexbukin788-oss/backend-business-card',
    },
  ],
};
