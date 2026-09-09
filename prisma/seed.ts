import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertProfile(locale: string, data: any) {
  const existing = await prisma.profile.findUnique({
    where: { locale },
  });

  if (existing) {
    console.log(`Updating existing profile [${locale}] with deterministic sortOrder...`);
    await prisma.$transaction([
      prisma.skill.deleteMany({ where: { profileId: existing.id } }),
      prisma.experience.deleteMany({ where: { profileId: existing.id } }),
      prisma.project.deleteMany({ where: { profileId: existing.id } }),
      prisma.education.deleteMany({ where: { profileId: existing.id } }),
      prisma.profile.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          title: data.title,
          description: data.description,
          location: data.location,
          phone: data.phone,
          telegram: data.telegram,
          githubUrl: data.githubUrl,
          email: data.email,
          skills: data.skills,
          experience: data.experience,
          projects: data.projects,
          education: data.education,
        },
      }),
    ]);
    console.log(`Profile [${locale}] successfully updated.`);
  } else {
    console.log(`Creating new profile [${locale}]...`);
    await prisma.profile.create({ data });
    console.log(`Profile [${locale}] successfully created.`);
  }
}

async function main() {
  console.log('Seeding database...');

  const enData = {
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
    skills: {
      create: [
        { name: 'TypeScript / JavaScript', category: 'Backend' },
        { name: 'Node.js / NestJS', category: 'Backend' },
        { name: 'Python', category: 'Backend' },
        { name: 'PHP', category: 'Backend' },
        { name: 'REST API & GraphQL', category: 'Backend' },
        { name: 'PostgreSQL & Prisma ORM', category: 'Databases' },
        { name: 'MariaDB / MySQL', category: 'Databases' },
        { name: 'Docker & Docker Compose', category: 'DevOps & Infra' },
        { name: 'Linux (Debian, Ubuntu Server)', category: 'DevOps & Infra' },
        { name: 'Nginx / Caddy (Reverse Proxy)', category: 'DevOps & Infra' },
        { name: 'Proxmox VE & Virtualization', category: 'DevOps & Infra' },
        { name: 'WebRTC / LiveKit', category: 'Media & Streaming' },
        { name: 'FFmpeg & HLS', category: 'Media & Streaming' },
        { name: 'Android (Kotlin / Java)', category: 'Mobile' },
        { name: 'Gradle Product Flavors', category: 'Mobile' },
        { name: 'EDI & Digital Signatures (EDS)', category: 'Enterprise Systems' },
        { name: 'Doc-V BPM', category: 'Enterprise Systems' },
        { name: 'Whisper AI', category: 'AI & Speech' },
        { name: 'Git & GitHub', category: 'Tools' },
      ],
    },
    experience: {
      create: [
        {
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
    },
    projects: {
      create: [
        {
          name: 'Digital Business Card API',
          description:
            'Interactive GraphQL resume backend built with NestJS, Prisma ORM, PostgreSQL, and Docker with Apollo Sandbox.',
          url: 'https://github.com/ChebAndroidDeveloper/digital-card',
          sortOrder: 1,
        },
        {
          name: 'EdKids (Google Play Edition)',
          description:
            'Interactive educational multimedia platform for children. Features Google Play Billing integration and offline media caching.',
          url: 'https://play.google.com/store/apps/details?id=ru.edkids',
          sortOrder: 2,
        },
        {
          name: 'EdKids (RuStore Edition)',
          description:
            'RuStore product flavor of EdKids platform featuring native RuStore Pay integration and custom session timer.',
          url: 'https://www.rustore.ru/catalog/app/ru.edkids.rustore',
          sortOrder: 3,
        },
        {
          name: 'VM Bronnikov Foundation Ecosystem',
          description:
            'Enterprise digital workspace integrating Doc-V BPM, LiveKit WebRTC video conferencing, and EDMS.',
          url: 'https://www.fundvmbronnikov.ru/',
          sortOrder: 4,
        },
      ],
    },
    education: {
      create: [
        {
          institution: 'SkillBox',
          year: '2023',
          faculty: 'Computer Science, Android Development',
          sortOrder: 1,
        },
      ],
    },
  };

  const ruData = {
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
    skills: {
      create: [
        { name: 'TypeScript / JavaScript', category: 'Backend' },
        { name: 'Node.js / NestJS', category: 'Backend' },
        { name: 'Python', category: 'Backend' },
        { name: 'PHP', category: 'Backend' },
        { name: 'REST API & GraphQL', category: 'Backend' },
        { name: 'PostgreSQL & Prisma ORM', category: 'Базы данных' },
        { name: 'MariaDB / MySQL', category: 'Базы данных' },
        { name: 'Docker & Docker Compose', category: 'DevOps & Инфраструктура' },
        { name: 'Linux (Debian, Ubuntu Server)', category: 'DevOps & Инфраструктура' },
        { name: 'Nginx / Caddy (Reverse Proxy)', category: 'DevOps & Инфраструктура' },
        { name: 'Proxmox VE & Виртуализация', category: 'DevOps & Инфраструктура' },
        { name: 'WebRTC / LiveKit', category: 'Медиа & Стриминг' },
        { name: 'FFmpeg & HLS', category: 'Медиа & Стриминг' },
        { name: 'Android (Kotlin / Java)', category: 'Мобильная разработка' },
        { name: 'Gradle Product Flavors', category: 'Мобильная разработка' },
        { name: 'ЭДО и ЭЦП', category: 'Корпоративные системы' },
        { name: 'Doc-V BPM', category: 'Корпоративные системы' },
        { name: 'Whisper AI', category: 'ИИ & Обработка речи' },
        { name: 'Git & GitHub', category: 'Инструменты' },
      ],
    },
    experience: {
      create: [
        {
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
    },
    projects: {
      create: [
        {
          name: 'Digital Business Card API',
          description:
            'Интерактивная GraphQL цифровая визитка и резюме на NestJS, Prisma ORM, PostgreSQL и Docker с Apollo Sandbox.',
          url: 'https://github.com/ChebAndroidDeveloper/digital-card',
          sortOrder: 1,
        },
        {
          name: 'EdKids (Google Play)',
          description:
            'Детская образовательная интерактивная платформа с интеграцией Google Play Billing и оффлайн-кэшированием.',
          url: 'https://play.google.com/store/apps/details?id=ru.edkids',
          sortOrder: 2,
        },
        {
          name: 'EdKids (RuStore)',
          description:
            'Версия платформы EdKids под RuStore со встроенной платежной системой RuStore Pay и контролем сессий.',
          url: 'https://www.rustore.ru/catalog/app/ru.edkids.rustore',
          sortOrder: 3,
        },
        {
          name: 'Экосистема Фонда В. Бронникова',
          description:
            'Комплексная корпоративная инфраструктура: Doc-V BPM, видеоконференции LiveKit, ЭДО и медиасервер.',
          url: 'https://www.fundvmbronnikov.ru/',
          sortOrder: 4,
        },
      ],
    },
    education: {
      create: [
        {
          institution: 'SkillBox',
          year: '2023',
          faculty: 'Информатика, Android-разработчик',
          sortOrder: 1,
        },
      ],
    },
  };

  await upsertProfile('en', enData);
  await upsertProfile('ru', ruData);

  console.log('Database verification and seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });