const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Test } = require('@nestjs/testing');
const request = require('supertest');
const { AppModule } = require('../dist/app.module');
const { PrismaService } = require('../dist/prisma/prisma.service');
const { ProfileService } = require('../dist/profile/profile.service');
const { configureHttpSecurity, RequestLimiter } = require('../dist/common/http-security');
const { getIntrospectionQuery } = require('graphql');

test('real HTTP GraphQL pipeline with mocked database (direct connection)', async (t) => {
  const previousEnv = process.env.NODE_ENV;
  const previousProxy = process.env.TRUSTED_PROXIES;
  process.env.NODE_ENV = 'production';
  delete process.env.TRUSTED_PROXIES;
  let profileCalls = 0;
  let skillCalls = 0;
  const prisma = {
    profile: { findFirst: async ({ where }) => {
      profileCalls++;
      if (where.locale === 'ru') throw new Error('PRIVATE_DATABASE_HOST:5432');
      return { id: 'p1', locale: 'en', name: 'Test' };
    } },
    skill: { findMany: async () => {
      skillCalls++;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return [{ id: 's1', name: 'TypeScript' }];
    } },
    experience: {
      findMany: async ({ orderBy }) => {
        // Данные вставлены вперемешку (3, затем 1, затем 2):
        const items = [
          { id: 'e3', company: 'Vodokanal', sortOrder: 3 },
          { id: 'e1', company: 'Bronnikov Foundation', sortOrder: 1 },
          { id: 'e2', company: 'EdKids', sortOrder: 2 },
        ];
        if (orderBy?.[0]?.sortOrder) {
          return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
        }
        return items;
      },
    },
  };
  let app;
  try {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService).useValue(prisma).compile();
    app = module.createNestApplication({ logger: false });
    configureHttpSecurity(app);
    await app.init();
    const send = (query) => request(app.getHttpServer()).post('/graphql').send({ query });

    await t.test('experience is sorted deterministically by sortOrder rather than insertion order', async () => {
      const result = await send('{ profile { experience { company sortOrder } } }');
      assert.equal(result.status, 200);
      assert.equal(result.body.errors, undefined);
      assert.deepEqual(
        result.body.data.profile.experience.map((e) => e.company),
        ['Bronnikov Foundation', 'EdKids', 'Vodokanal'],
      );
    });
    await t.test('concurrent field aliases share a pending database request', async () => {
      const result = await send('{ profile { name a: skills { name } b: skills { name } } }');
      assert.equal(result.status, 200);
      assert.equal(result.body.errors, undefined);
      assert.deepEqual(result.body.data.profile.a, result.body.data.profile.b);
      assert.equal(profileCalls, 1);
      assert.equal(skillCalls, 1);
    });
    await t.test('internal errors are masked by the actual Apollo adapter', async () => {
      const result = await send('{ profile(locale: "ru") { name } }');
      assert.equal(result.body.errors[0].message, 'Internal server error');
      assert.deepEqual(result.body.errors[0].path, ['profile']);
      assert.equal(JSON.stringify(result.body).includes('PRIVATE_DATABASE_HOST'), false);
      assert.equal(result.body.errors[0].extensions.stacktrace, undefined);
    });
    await t.test('syntax errors remain actionable', async () => {
      const result = await send('{');
      assert.equal(result.body.errors[0].extensions.code, 'GRAPHQL_PARSE_FAILED');
    });
    await t.test('expanded fragments exceed budget before resolver execution', async () => {
      const before = profileCalls;
      const result = await send(`{ profile { ${'...Fields '.repeat(260)} } } fragment Fields on Profile { name }`);
      assert.equal(result.body.errors[0].extensions.code, 'GRAPHQL_VALIDATION_FAILED');
      assert.equal(profileCalls, before);
    });
    await t.test('Sandbox introspection still fits the budget', async () => {
      const result = await send(getIntrospectionQuery());
      assert.equal(result.body.errors, undefined);
      assert.ok(result.body.data.__schema);
    });
    await t.test('changing forwarded headers cannot bypass the HTTP limit without proxy', async () => {
      let limited;
      for (let i = 0; i < 101; i++) {
        const result = await request(app.getHttpServer()).post('/graphql')
          .set('X-Forwarded-For', `198.51.100.${i}`).send({ query: '{ __typename }' });
        if (result.status === 429) { limited = result; break; }
      }
      assert.ok(limited);
      assert.equal(limited.body.errors[0].extensions.code, 'TOO_MANY_REQUESTS');
      assert.ok(Number(limited.headers['retry-after']) > 0);
    });
  } finally {
    if (app) await app.close();
    if (previousEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnv;
    if (previousProxy === undefined) delete process.env.TRUSTED_PROXIES;
    else process.env.TRUSTED_PROXIES = previousProxy;
  }
});

test('trusted reverse proxy pipeline (production Nginx -> Docker -> API scheme with TRUSTED_PROXIES=1)', async (t) => {
  const previousEnv = process.env.NODE_ENV;
  const previousProxy = process.env.TRUSTED_PROXIES;
  process.env.NODE_ENV = 'production';
  process.env.TRUSTED_PROXIES = '1';

  let app;
  try {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService).useValue({}).compile();
    app = module.createNestApplication({ logger: false });
    configureHttpSecurity(app);
    await app.init();

    await t.test('distinct clients behind proxy receive separate rate-limit buckets', async () => {
      // Клиент А делает 50 запросов
      for (let i = 0; i < 50; i++) {
        const res = await request(app.getHttpServer()).post('/graphql')
          .set('X-Forwarded-For', '203.0.113.10').send({ query: '{ __typename }' });
        assert.equal(res.status, 200);
      }

      // Клиент Б делает 50 запросов (суммарно 100 через один сокет Nginx)
      for (let i = 0; i < 50; i++) {
        const res = await request(app.getHttpServer()).post('/graphql')
          .set('X-Forwarded-For', '203.0.113.20').send({ query: '{ __typename }' });
        assert.equal(res.status, 200);
      }

      // Ни один из них не превысил 100 запросов, оба активны и не заблокированы
      const resA = await request(app.getHttpServer()).post('/graphql')
        .set('X-Forwarded-For', '203.0.113.10').send({ query: '{ __typename }' });
      assert.equal(resA.status, 200);

      const resB = await request(app.getHttpServer()).post('/graphql')
        .set('X-Forwarded-For', '203.0.113.20').send({ query: '{ __typename }' });
      assert.equal(resB.status, 200);
    });

    await t.test('client cannot bypass rate limit by prepending fake forwarded headers behind trusted proxy', async () => {
      // Реальный IP клиента зафиксирован Nginx как правый (203.0.113.99).
      // Клиент пытается обмануть сервер, меняя IP слева: 'fake_ip, 203.0.113.99'
      let limited;
      for (let i = 0; i < 105; i++) {
        const spoofedHeader = `198.51.100.${i}, 203.0.113.99`;
        const res = await request(app.getHttpServer()).post('/graphql')
          .set('X-Forwarded-For', spoofedHeader).send({ query: '{ __typename }' });
        if (res.status === 429) {
          limited = res;
          break;
        }
      }
      assert.ok(limited, 'Attacker should be rate-limited despite changing spoofed IP');
      assert.equal(limited.body.errors[0].extensions.code, 'TOO_MANY_REQUESTS');
    });
  } finally {
    if (app) await app.close();
    if (previousEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnv;
    if (previousProxy === undefined) delete process.env.TRUSTED_PROXIES;
    else process.env.TRUSTED_PROXIES = previousProxy;
  }
});

test('limiter expires records and fails closed at capacity', () => {
  const limiter = new RequestLimiter(2, 1000, 2);
  assert.equal(limiter.consume('a', 0), 0);
  assert.equal(limiter.consume('a', 0), 0);
  assert.equal(limiter.consume('a', 0), 1);
  assert.equal(limiter.consume('b', 0), 0);
  assert.equal(limiter.consume('c', 0), 1);
  assert.equal(limiter.consume('c', 1000), 0);
  assert.equal(limiter.consume('a', 1000), 0);
});

test('failed cached requests can retry, unsupported locales never hit the database', async () => {
  let calls = 0;
  const service = new ProfileService({ profile: { findFirst: async () => {
    calls++;
    if (calls === 1) throw new Error('temporary');
    return { id: 'p1' };
  } } });
  await assert.rejects(service.findByLocale('en'));
  assert.deepEqual(await service.findByLocale('en'), { id: 'p1' });
  assert.equal(await service.findByLocale('unsupported'), null);
  assert.equal(calls, 2);
});