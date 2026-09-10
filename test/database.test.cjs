require('ts-node/register');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const { profiles } = require('../prisma/content');
const { syncProfile } = require('../prisma/seed');
const { runtimeDatabaseUrl } = require('../src/prisma/database-url');

test(
  'migration, seed and database timeouts',
  { timeout: 60_000 },
  async (t) => {
    assert.ok(
      process.env.DATABASE_URL,
      'DATABASE_URL must point to a test database',
    );
    const schema = `test_${randomUUID().replaceAll('-', '')}`;
    const url = new URL(process.env.DATABASE_URL);
    url.searchParams.set('schema', schema);
    const prisma = new PrismaClient({
      datasources: { db: { url: url.toString() } },
    });
    const runtime = new PrismaClient({
      datasources: { db: { url: runtimeDatabaseUrl(url.toString()) } },
    });

    async function migrate(name) {
      const sql = readFileSync(
        join(__dirname, '../prisma/migrations', name, 'migration.sql'),
        'utf8',
      );
      await prisma.$transaction(async (tx) => {
        for (const statement of sql
          .replace(/^--.*$/gm, '')
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean)) {
          if (
            [
              'BEGIN',
              'COMMIT',
              'CREATE SCHEMA IF NOT EXISTS "public"',
            ].includes(statement)
          )
            continue;
          await tx.$executeRawUnsafe(statement);
        }
      });
    }

    async function snapshot() {
      const rows = await prisma.profile.findMany({
        orderBy: { locale: 'asc' },
        include: Object.fromEntries(
          ['skills', 'experience', 'projects', 'education'].map((field) => [
            field,
            { orderBy: { key: 'asc' } },
          ]),
        ),
      });
      return rows.map(({ updatedAt: _updatedAt, ...row }) => row);
    }

    try {
      await prisma.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
      await migrate('0_init');
      await migrate('20260909000000_add_sort_orde');
      await prisma.$executeRaw`INSERT INTO "Profile" (id, locale, name, title, description, "updatedAt")
      VALUES ('old-profile', 'en', 'Old name', 'Old title', 'Old description', CURRENT_TIMESTAMP)`;
      await prisma.$executeRaw`INSERT INTO "Project" (id, name, "profileId")
      VALUES ('old-project', 'Digital Business Card API', 'old-profile')`;
      await prisma.$executeRaw`INSERT INTO "Education" (id, institution, year, faculty, "profileId")
      VALUES ('unknown-education', 'Old college', '2020', 'Science', 'old-profile')`;
      await migrate('20260910000000_stable_content_keys');

      await t.test(
        'upgrade preserves old IDs and leaves unknown entries for review',
        async () => {
          for (const content of profiles) await syncProfile(prisma, content);
          assert.equal(
            (await prisma.project.findUnique({ where: { id: 'old-project' } }))
              .key,
            'digital-card',
          );
          assert.equal(
            (
              await prisma.education.findUnique({
                where: { id: 'unknown-education' },
              })
            ).key,
            'legacy:unknown-education',
          );
          await prisma.education.delete({ where: { id: 'unknown-education' } });
        },
      );

      await t.test(
        'repeat seed preserves IDs, counts and content directly in the database',
        async () => {
          const before = await snapshot();
          for (const content of profiles) await syncProfile(prisma, content);
          const after = await snapshot();
          assert.deepEqual(after, before);
          for (const content of profiles) {
            const stored = after.find((row) => row.locale === content.locale);
            for (const [field, expected] of Object.entries(content)) {
              if (Array.isArray(expected)) {
                const actual = stored[field].map(
                  ({
                    id: _id,
                    profileId: _profileId,
                    createdAt: _createdAt,
                    ...item
                  }) => item,
                );
                assert.deepEqual(
                  actual,
                  [...expected].sort((a, b) => a.key.localeCompare(b.key)),
                );
              } else {
                assert.deepEqual(stored[field], expected);
              }
            }
          }
        },
      );

      await t.test(
        'renames and two roles at one company keep separate IDs',
        async () => {
          const changed = structuredClone(profiles[0]);
          const original = await prisma.experience.findFirst({
            where: {
              key: changed.experience[0].key,
              profile: { locale: 'en' },
            },
          });
          changed.experience[0].company = 'Renamed foundation';
          changed.experience.push({
            ...changed.experience[0],
            key: 'second-role',
            position: 'Team lead',
            sortOrder: 4,
          });
          changed.projects[0].name = 'Renamed project';
          await syncProfile(prisma, changed);
          const before = await snapshot();
          await syncProfile(prisma, changed);
          assert.deepEqual(await snapshot(), before);
          assert.equal(
            (await prisma.experience.findUnique({ where: { id: original.id } }))
              .company,
            'Renamed foundation',
          );
          assert.equal(
            (await prisma.project.findUnique({ where: { id: 'old-project' } }))
              .name,
            'Renamed project',
          );
          await syncProfile(prisma, profiles[0]);
          assert.equal(
            await prisma.experience.count({ where: { key: 'second-role' } }),
            0,
          );
        },
      );

      await t.test('duplicate keys fail without changing data', async () => {
        const invalid = structuredClone(profiles[0]);
        invalid.projects.push({ ...invalid.projects[0] });
        const before = await snapshot();
        await assert.rejects(
          syncProfile(prisma, invalid),
          /Duplicate content key/,
        );
        assert.deepEqual(await snapshot(), before);
      });

      await t.test(
        'PostgreSQL cancels slow queries and the connection remains usable',
        async () => {
          const [setting] = await runtime.$queryRaw`SHOW statement_timeout`;
          assert.equal(setting.statement_timeout, '4s');
          const started = Date.now();
          await assert.rejects(
            runtime.$queryRaw`SELECT 1 FROM pg_sleep(10)`,
            /statement timeout/,
          );
          assert.ok(Date.now() - started < 8000);
          assert.deepEqual(await runtime.$queryRaw`SELECT 1 AS value`, [
            { value: 1 },
          ]);
        },
      );
    } finally {
      await runtime.$disconnect();
      try {
        await prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        );
      } finally {
        await prisma.$disconnect();
      }
    }
  },
);
