BEGIN;

ALTER TABLE "Skill" ADD COLUMN "key" TEXT;
WITH mapping(locale, label, key) AS (VALUES
  ('en', 'TypeScript / JavaScript', 'typescript'),
  ('en', 'Node.js / NestJS', 'nestjs'),
  ('en', 'Python', 'python'),
  ('en', 'PHP', 'php'),
  ('en', 'REST API & GraphQL', 'api'),
  ('en', 'PostgreSQL & Prisma ORM', 'postgresql'),
  ('en', 'MariaDB / MySQL', 'mysql'),
  ('en', 'Docker & Docker Compose', 'docker'),
  ('en', 'Linux (Debian, Ubuntu Server)', 'linux'),
  ('en', 'Nginx / Caddy (Reverse Proxy)', 'proxy'),
  ('en', 'Proxmox VE & Virtualization', 'proxmox'),
  ('en', 'WebRTC / LiveKit', 'webrtc'),
  ('en', 'FFmpeg & HLS', 'ffmpeg'),
  ('en', 'Android (Kotlin / Java)', 'android'),
  ('en', 'Gradle Product Flavors', 'gradle'),
  ('en', 'EDI & Digital Signatures (EDS)', 'edi'),
  ('en', 'Doc-V BPM', 'bpm'),
  ('en', 'Whisper AI', 'whisper'),
  ('en', 'Git & GitHub', 'git'),
  ('ru', 'TypeScript / JavaScript', 'typescript'),
  ('ru', 'Node.js / NestJS', 'nestjs'),
  ('ru', 'Python', 'python'),
  ('ru', 'PHP', 'php'),
  ('ru', 'REST API & GraphQL', 'api'),
  ('ru', 'PostgreSQL & Prisma ORM', 'postgresql'),
  ('ru', 'MariaDB / MySQL', 'mysql'),
  ('ru', 'Docker & Docker Compose', 'docker'),
  ('ru', 'Linux (Debian, Ubuntu Server)', 'linux'),
  ('ru', 'Nginx / Caddy (Reverse Proxy)', 'proxy'),
  ('ru', 'Proxmox VE & Виртуализация', 'proxmox'),
  ('ru', 'WebRTC / LiveKit', 'webrtc'),
  ('ru', 'FFmpeg & HLS', 'ffmpeg'),
  ('ru', 'Android (Kotlin / Java)', 'android'),
  ('ru', 'Gradle Product Flavors', 'gradle'),
  ('ru', 'ЭДО и ЭЦП', 'edi'),
  ('ru', 'Doc-V BPM', 'bpm'),
  ('ru', 'Whisper AI', 'whisper'),
  ('ru', 'Git & GitHub', 'git')
), matched AS (
  SELECT child.id, mapping.key,
    row_number() OVER (PARTITION BY child."profileId", mapping.key ORDER BY child."createdAt", child.id) AS rank
  FROM "Skill" child
  JOIN "Profile" p ON p.id = child."profileId"
  JOIN mapping ON mapping.locale = p.locale AND mapping.label = child."name"
)
UPDATE "Skill" child SET "key" = matched.key
FROM matched WHERE child.id = matched.id AND matched.rank = 1;
UPDATE "Skill" SET "key" = 'legacy:' || id WHERE "key" IS NULL;
ALTER TABLE "Skill" ALTER COLUMN "key" SET NOT NULL;
CREATE UNIQUE INDEX "Skill_profileId_key_key" ON "Skill"("profileId", "key");

ALTER TABLE "Experience" ADD COLUMN "key" TEXT;
WITH mapping(locale, label, key) AS (VALUES
  ('en', 'Vyacheslav Bronnikov Foundation', 'bronnikov-fullstack'),
  ('en', 'EdKids LLC', 'edkids-fullstack'),
  ('en', 'Vodokanal JSC', 'vodokanal-engineer'),
  ('ru', 'Благотворительный Фонд Вячеслава Бронникова', 'bronnikov-fullstack'),
  ('ru', 'ООО Эдкидс', 'edkids-fullstack'),
  ('ru', 'АО Водоканал', 'vodokanal-engineer')
), matched AS (
  SELECT child.id, mapping.key,
    row_number() OVER (PARTITION BY child."profileId", mapping.key ORDER BY child."createdAt", child.id) AS rank
  FROM "Experience" child
  JOIN "Profile" p ON p.id = child."profileId"
  JOIN mapping ON mapping.locale = p.locale AND mapping.label = child."company"
)
UPDATE "Experience" child SET "key" = matched.key
FROM matched WHERE child.id = matched.id AND matched.rank = 1;
UPDATE "Experience" SET "key" = 'legacy:' || id WHERE "key" IS NULL;
ALTER TABLE "Experience" ALTER COLUMN "key" SET NOT NULL;
CREATE UNIQUE INDEX "Experience_profileId_key_key" ON "Experience"("profileId", "key");

ALTER TABLE "Project" ADD COLUMN "key" TEXT;
WITH mapping(locale, label, key) AS (VALUES
  ('en', 'Digital Business Card API', 'digital-card'),
  ('en', 'EdKids (Google Play Edition)', 'edkids-google-play'),
  ('en', 'EdKids (RuStore Edition)', 'edkids-rustore'),
  ('en', 'VM Bronnikov Foundation Ecosystem', 'bronnikov-ecosystem'),
  ('ru', 'Digital Business Card API', 'digital-card'),
  ('ru', 'EdKids (Google Play)', 'edkids-google-play'),
  ('ru', 'EdKids (RuStore)', 'edkids-rustore'),
  ('ru', 'Экосистема Фонда В. Бронникова', 'bronnikov-ecosystem')
), matched AS (
  SELECT child.id, mapping.key,
    row_number() OVER (PARTITION BY child."profileId", mapping.key ORDER BY child."createdAt", child.id) AS rank
  FROM "Project" child
  JOIN "Profile" p ON p.id = child."profileId"
  JOIN mapping ON mapping.locale = p.locale AND mapping.label = child."name"
)
UPDATE "Project" child SET "key" = matched.key
FROM matched WHERE child.id = matched.id AND matched.rank = 1;
UPDATE "Project" SET "key" = 'legacy:' || id WHERE "key" IS NULL;
ALTER TABLE "Project" ALTER COLUMN "key" SET NOT NULL;
CREATE UNIQUE INDEX "Project_profileId_key_key" ON "Project"("profileId", "key");

ALTER TABLE "Education" ADD COLUMN "key" TEXT;
WITH mapping(locale, label, key) AS (VALUES
  ('en', 'SkillBox', 'skillbox-android'),
  ('ru', 'SkillBox', 'skillbox-android')
), matched AS (
  SELECT child.id, mapping.key,
    row_number() OVER (PARTITION BY child."profileId", mapping.key ORDER BY child."createdAt", child.id) AS rank
  FROM "Education" child
  JOIN "Profile" p ON p.id = child."profileId"
  JOIN mapping ON mapping.locale = p.locale AND mapping.label = child."institution"
)
UPDATE "Education" child SET "key" = matched.key
FROM matched WHERE child.id = matched.id AND matched.rank = 1;
UPDATE "Education" SET "key" = 'legacy:' || id WHERE "key" IS NULL;
ALTER TABLE "Education" ALTER COLUMN "key" SET NOT NULL;
CREATE UNIQUE INDEX "Education_profileId_key_key" ON "Education"("profileId", "key");

COMMIT;
