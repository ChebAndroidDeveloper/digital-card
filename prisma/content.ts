import type { Prisma } from '@prisma/client';

export type ProfileContent = Omit<
  Prisma.ProfileCreateInput,
  'skills' | 'experience' | 'projects' | 'education'
> & {
  skills: Prisma.SkillCreateWithoutProfileInput[];
  experience: Prisma.ExperienceCreateWithoutProfileInput[];
  projects: Prisma.ProjectCreateWithoutProfileInput[];
  education: Prisma.EducationCreateWithoutProfileInput[];
};

export const profiles = [
  {
    locale: 'en',
    name: 'Konstantin Chumbakov',
    title: 'Software Engineer / Fullstack Developer',
    description:
      'Software Engineer and Fullstack Developer with strong expertise in server-side architectures, business process automation (BPM, EDI, digital signatures), media streaming infrastructure (WebRTC/LiveKit), Android mobile development, and Linux systems administration.',
    location: 'Feodosia (Open to Remote)',
    phone: '+7 (917) 0788878',
    telegram: 'https://t.me/kostyachu',
    githubUrl: 'https://github.com/ChebAndroidDeveloper',
    email: 'chebandroiddeveloper@example.com',
    skills: [
      {
        key: 'typescript',
        name: 'TypeScript / JavaScript',
        category: 'Backend',
      },
      {
        key: 'nestjs',
        name: 'Node.js / NestJS',
        category: 'Backend',
      },
      {
        key: 'python',
        name: 'Python',
        category: 'Backend',
      },
      {
        key: 'php',
        name: 'PHP',
        category: 'Backend',
      },
      {
        key: 'api',
        name: 'REST API & GraphQL',
        category: 'Backend',
      },
      {
        key: 'postgresql',
        name: 'PostgreSQL & Prisma ORM',
        category: 'Databases',
      },
      {
        key: 'mysql',
        name: 'MariaDB / MySQL',
        category: 'Databases',
      },
      {
        key: 'docker',
        name: 'Docker & Docker Compose',
        category: 'DevOps & Infra',
      },
      {
        key: 'linux',
        name: 'Linux (Debian, Ubuntu Server)',
        category: 'DevOps & Infra',
      },
      {
        key: 'proxy',
        name: 'Nginx / Caddy (Reverse Proxy)',
        category: 'DevOps & Infra',
      },
      {
        key: 'proxmox',
        name: 'Proxmox VE & Virtualization',
        category: 'DevOps & Infra',
      },
      {
        key: 'webrtc',
        name: 'WebRTC / LiveKit',
        category: 'Media & Streaming',
      },
      {
        key: 'ffmpeg',
        name: 'FFmpeg & HLS',
        category: 'Media & Streaming',
      },
      {
        key: 'android',
        name: 'Android (Kotlin / Java)',
        category: 'Mobile',
      },
      {
        key: 'gradle',
        name: 'Gradle Product Flavors',
        category: 'Mobile',
      },
      {
        key: 'edi',
        name: 'EDI & Digital Signatures (EDS)',
        category: 'Enterprise Systems',
      },
      {
        key: 'bpm',
        name: 'Doc-V BPM',
        category: 'Enterprise Systems',
      },
      {
        key: 'whisper',
        name: 'Whisper AI',
        category: 'AI & Speech',
      },
      {
        key: 'git',
        name: 'Git & GitHub',
        category: 'Tools',
      },
    ],
    experience: [
      {
        key: 'bronnikov-fullstack',
        company: 'Vyacheslav Bronnikov Foundation',
        position: 'Fullstack Developer',
        period: 'April 2025 — Present',
        sortOrder: 1,
        achievements: [
          'Architected server and client systems using Python, PHP, JS, REST API, and Webhooks.',
          'Implemented enterprise Doc-V BPM: workflow routing, approval chains, and business logic automation.',
          'Deployed secure real-time video conferencing based on LiveKit Meet with recording (LiveKit Egress).',
          'Integrated OnlyOffice enterprise document suite and digital signature workflows (including SMS OTP verification).',
          'Maintained server infrastructure on Linux (Debian, Ubuntu, systemd, Proxmox VE, ZFS).',
          'Deployed Whisper AI speech recognition models on private servers for automated transcription.',
        ],
      },
      {
        key: 'edkids-fullstack',
        company: 'EdKids LLC',
        position: 'Fullstack / Android Developer',
        period: 'May 2024 — Present',
        sortOrder: 2,
        achievements: [
          'Architected EdKids Android application using Gradle product flavors to support dedicated builds for Google Play and RuStore.',
          'Integrated Google Play Billing for the Google Play flavor and RuStore Pay SDK for the domestic market flavor.',
          'Designed offline caching architecture for media assets, ensuring uninterrupted playback without network connection.',
          'Optimized telemetry and subscription status sync with backend API (improved analytical accuracy by 30%).',
          'Implemented custom Thread.UncaughtExceptionHandler and WorkManager background telemetry delivery to handle crashes gracefully.',
        ],
      },
      {
        key: 'vodokanal-engineer',
        company: 'Vodokanal JSC',
        position: 'Software Engineer',
        period: 'July 2023 — March 2025',
        sortOrder: 3,
        achievements: [
          'Automated customer technical conditions request and issuance workflows.',
          'Developed and deployed internal electronic document management system (EDMS).',
          'Integrated legally binding digital signature (EDS) signing pipeline for enterprise documents.',
        ],
      },
    ],
    projects: [
      {
        key: 'digital-card',
        name: 'Digital Business Card API',
        description:
          'Interactive GraphQL resume backend built with NestJS, Prisma ORM, PostgreSQL, and Docker with Apollo Sandbox.',
        url: 'https://github.com/ChebAndroidDeveloper/digital-card',
        sortOrder: 1,
      },
      {
        key: 'edkids-google-play',
        name: 'EdKids (Google Play Edition)',
        description:
          'Interactive educational multimedia platform for children. Features Google Play Billing integration and offline media caching.',
        url: 'https://play.google.com/store/apps/details?id=ru.edkids',
        sortOrder: 2,
      },
      {
        key: 'edkids-rustore',
        name: 'EdKids (RuStore Edition)',
        description:
          'RuStore product flavor of EdKids platform featuring native RuStore Pay integration and custom session timer.',
        url: 'https://www.rustore.ru/catalog/app/ru.edkids.rustore',
        sortOrder: 3,
      },
      {
        key: 'bronnikov-ecosystem',
        name: 'VM Bronnikov Foundation Ecosystem',
        description:
          'Enterprise digital workspace integrating Doc-V BPM, LiveKit WebRTC video conferencing, and EDMS.',
        url: 'https://www.fundvmbronnikov.ru/',
        sortOrder: 4,
      },
    ],
    education: [
      {
        key: 'skillbox-android',
        institution: 'SkillBox',
        year: '2023',
        faculty: 'Computer Science, Android Development',
        sortOrder: 1,
      },
    ],
  },
  {
    locale: 'ru',
    name: 'Константин Чумбаков',
    title: 'Инженер-программист / Fullstack-разработчик',
    description:
      'Инженер-программист и Fullstack-разработчик с глубоким опытом в построении серверных архитектур, систем автоматизации (BPM, ЭДО, ЭЦП), медиасерверов (WebRTC/LiveKit), мобильной разработки (Android) и администрировании Linux-инфраструктуры.',
    location: 'Феодосия, Россия (Готов к удаленной работе)',
    phone: '+7 (917) 0788878',
    telegram: 'https://t.me/kostyachu',
    githubUrl: 'https://github.com/ChebAndroidDeveloper',
    email: 'chebandroiddeveloper@example.com',
    skills: [
      {
        key: 'typescript',
        name: 'TypeScript / JavaScript',
        category: 'Backend',
      },
      {
        key: 'nestjs',
        name: 'Node.js / NestJS',
        category: 'Backend',
      },
      {
        key: 'python',
        name: 'Python',
        category: 'Backend',
      },
      {
        key: 'php',
        name: 'PHP',
        category: 'Backend',
      },
      {
        key: 'api',
        name: 'REST API & GraphQL',
        category: 'Backend',
      },
      {
        key: 'postgresql',
        name: 'PostgreSQL & Prisma ORM',
        category: 'Базы данных',
      },
      {
        key: 'mysql',
        name: 'MariaDB / MySQL',
        category: 'Базы данных',
      },
      {
        key: 'docker',
        name: 'Docker & Docker Compose',
        category: 'DevOps & Инфраструктура',
      },
      {
        key: 'linux',
        name: 'Linux (Debian, Ubuntu Server)',
        category: 'DevOps & Инфраструктура',
      },
      {
        key: 'proxy',
        name: 'Nginx / Caddy (Reverse Proxy)',
        category: 'DevOps & Инфраструктура',
      },
      {
        key: 'proxmox',
        name: 'Proxmox VE & Виртуализация',
        category: 'DevOps & Инфраструктура',
      },
      {
        key: 'webrtc',
        name: 'WebRTC / LiveKit',
        category: 'Медиа & Стриминг',
      },
      {
        key: 'ffmpeg',
        name: 'FFmpeg & HLS',
        category: 'Медиа & Стриминг',
      },
      {
        key: 'android',
        name: 'Android (Kotlin / Java)',
        category: 'Мобильная разработка',
      },
      {
        key: 'gradle',
        name: 'Gradle Product Flavors',
        category: 'Мобильная разработка',
      },
      {
        key: 'edi',
        name: 'ЭДО и ЭЦП',
        category: 'Корпоративные системы',
      },
      {
        key: 'bpm',
        name: 'Doc-V BPM',
        category: 'Корпоративные системы',
      },
      {
        key: 'whisper',
        name: 'Whisper AI',
        category: 'ИИ & Обработка речи',
      },
      {
        key: 'git',
        name: 'Git & GitHub',
        category: 'Инструменты',
      },
    ],
    experience: [
      {
        key: 'bronnikov-fullstack',
        company: 'Благотворительный Фонд Вячеслава Бронникова',
        position: 'Fullstack-разработчик',
        period: 'Апрель 2025 — настоящее время',
        sortOrder: 1,
        achievements: [
          'Разработка серверной и клиентской архитектуры (Python, PHP, JS, REST API, Webhook).',
          'Внедрение корпоративной системы Doc-V BPM: настройка маршрутов согласования и интеграций.',
          'Развертывание защищенной видеоконференцсвязи WebRTC на базе LiveKit Meet с возможностью записи (Egress).',
          'Интеграция корпоративного редактора документов OnlyOffice и систем ЭЦП (включая SMS-подтверждение).',
          'Администрирование серверной инфраструктуры на базе Linux (Debian, Ubuntu, systemd, Proxmox VE, ZFS).',
          'Развертывание моделей транскрибации речи Whisper AI и подготовка инфраструктуры под интеграцию LLM.',
        ],
      },
      {
        key: 'edkids-fullstack',
        company: 'ООО Эдкидс',
        position: 'Fullstack / Android разработчик',
        period: 'Май 2024 — настоящее время',
        sortOrder: 2,
        achievements: [
          'Архитектура приложения с использованием Gradle product flavors: раздельные сборки под Google Play и RuStore.',
          'Интеграция Google Play Billing для Google Play флавора и RuStore Pay для отечественного стора.',
          'Проектирование системы оффлайн-доступа и кэширования медиафайлов для бесперебойной работы.',
          'Оптимизация сетевого взаимодействия и синхронизации аналитики (точность повышена на 30%).',
          'Повышение отказоустойчивости: глобальный перехватчик исключений (Thread.UncaughtExceptionHandler) и гарантированная доставка отчетов через WorkManager.',
        ],
      },
      {
        key: 'vodokanal-engineer',
        company: 'АО Водоканал',
        position: 'Инженер-программист',
        period: 'Июль 2023 — Март 2025',
        sortOrder: 3,
        achievements: [
          'Разработка системы автоматизации процесса получения технических условий заказчиками.',
          'Проектирование и внедрение корпоративной системы электронного документооборота (ЭДО).',
          'Создание защищенной системы подписания электронных документов квалифицированной ЭЦП.',
        ],
      },
    ],
    projects: [
      {
        key: 'digital-card',
        name: 'Digital Business Card API',
        description:
          'Интерактивная GraphQL цифровая визитка и резюме на NestJS, Prisma ORM, PostgreSQL и Docker с Apollo Sandbox.',
        url: 'https://github.com/ChebAndroidDeveloper/digital-card',
        sortOrder: 1,
      },
      {
        key: 'edkids-google-play',
        name: 'EdKids (Google Play)',
        description:
          'Детская образовательная интерактивная платформа с интеграцией Google Play Billing и оффлайн-кэшированием.',
        url: 'https://play.google.com/store/apps/details?id=ru.edkids',
        sortOrder: 2,
      },
      {
        key: 'edkids-rustore',
        name: 'EdKids (RuStore)',
        description:
          'Версия платформы EdKids под RuStore со встроенной платежной системой RuStore Pay и контролем сессий.',
        url: 'https://www.rustore.ru/catalog/app/ru.edkids.rustore',
        sortOrder: 3,
      },
      {
        key: 'bronnikov-ecosystem',
        name: 'Экосистема Фонда В. Бронникова',
        description:
          'Комплексная корпоративная инфраструктура: Doc-V BPM, видеоконференции LiveKit, ЭДО и медиасервер.',
        url: 'https://www.fundvmbronnikov.ru/',
        sortOrder: 4,
      },
    ],
    education: [
      {
        key: 'skillbox-android',
        institution: 'SkillBox',
        year: '2023',
        faculty: 'Информатика, Android-разработчик',
        sortOrder: 1,
      },
    ],
  },
] satisfies ProfileContent[];
