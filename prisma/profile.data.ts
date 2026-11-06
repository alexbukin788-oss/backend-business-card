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
  experience: [
    {
      company: 'Собственный проект «Сказка про тебя»',
      position: 'Автор платформы и разработчик с использованием Codex',
      startDate: '2026-10-02',
      endDate: null,
      achievements: [
        'Самостоятельно, без привлечения других разработчиков, создаю платформу веб-приложений с помощью Codex: сайт, серверный API, PostgreSQL, S3 и CRM.',
        'Подключил оплату через Т-Банк и цепочку изготовления и доставки книг: подтверждена реальная покупка с получением PDF по электронной почте.',
        'Развиваю каталог из 15 сказок, подготовку PDF для телефона и печати, а также модуль открыток.',
        'После сбоя Beget восстановил платформу на Selectel; настроены резервное копирование, проверка восстановления и автоматическая очистка файлов.',
      ],
    },
  ],
  projects: [
    { name: 'Сказка про тебя — платформа приложений', url: 'https://skazka-pro-tebya.ru' },
    {
      name: 'Backend-визитка: NestJS, Prisma и GraphQL',
      url: 'https://github.com/alexbukin788-oss/backend-business-card',
    },
  ],
};
