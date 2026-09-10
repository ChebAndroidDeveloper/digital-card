import { PrismaClient } from '@prisma/client';
import { profiles, type ProfileContent } from './content';

export async function syncProfile(
  prisma: PrismaClient,
  content: ProfileContent,
) {
  const { skills, experience, projects, education, ...data } = content;
  for (const items of [skills, experience, projects, education]) {
    if (items.some((item) => !item.key || item.key.startsWith('legacy:'))) {
      throw new Error(
        'Content keys must be non-empty and cannot start with legacy:',
      );
    }
    if (new Set(items.map((item) => item.key)).size !== items.length) {
      throw new Error('Duplicate content key');
    }
  }

  await prisma.$transaction(
    async (tx) => {
      const profile = await tx.profile.upsert({
        where: { locale: data.locale ?? 'en' },
        create: data,
        update: data,
      });

      for (const item of skills) {
        await tx.skill.upsert({
          where: { profileId_key: { profileId: profile.id, key: item.key } },
          create: { ...item, profileId: profile.id },
          update: item,
        });
      }
      await tx.skill.deleteMany({
        where: {
          profileId: profile.id,
          key: {
            notIn: skills.map((item) => item.key),
            not: { startsWith: 'legacy:' },
          },
        },
      });

      for (const item of experience) {
        await tx.experience.upsert({
          where: { profileId_key: { profileId: profile.id, key: item.key } },
          create: { ...item, profileId: profile.id },
          update: item,
        });
      }
      await tx.experience.deleteMany({
        where: {
          profileId: profile.id,
          key: {
            notIn: experience.map((item) => item.key),
            not: { startsWith: 'legacy:' },
          },
        },
      });

      for (const item of projects) {
        await tx.project.upsert({
          where: { profileId_key: { profileId: profile.id, key: item.key } },
          create: { ...item, profileId: profile.id },
          update: item,
        });
      }
      await tx.project.deleteMany({
        where: {
          profileId: profile.id,
          key: {
            notIn: projects.map((item) => item.key),
            not: { startsWith: 'legacy:' },
          },
        },
      });

      for (const item of education) {
        await tx.education.upsert({
          where: { profileId_key: { profileId: profile.id, key: item.key } },
          create: { ...item, profileId: profile.id },
          update: item,
        });
      }
      await tx.education.deleteMany({
        where: {
          profileId: profile.id,
          key: {
            notIn: education.map((item) => item.key),
            not: { startsWith: 'legacy:' },
          },
        },
      });
    },
    { timeout: 30_000 },
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    for (const profile of profiles) {
      await syncProfile(prisma, profile);
      console.log(`Profile [${profile.locale}] updated.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
