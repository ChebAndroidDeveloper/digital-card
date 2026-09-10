const http = require('node:http');
const assert = require('node:assert/strict');

function sendQuery(query) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query });
    const req = http.request(
      'http://localhost:3000/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch {
            reject(new Error(`Failed to parse JSON response: ${raw}`));
          }
        });
      },
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function verify() {
  console.log('🔍 Running Deep GraphQL JSON Smoke Verification...');

  // 1. Проверяем локаль EN:
  const enRes = await sendQuery(`{
    profile(locale: "en") {
      name
      title
      skills { name category }
      experience { company sortOrder }
      projects { name sortOrder }
      education { institution sortOrder }
    }
  }`);

  assert.equal(enRes.status, 200, 'HTTP status must be 200');
  assert.equal(enRes.data.errors, undefined, 'EN query must not produce GraphQL errors');
  assert.equal(enRes.data.data.profile.name, 'Konstantin Chumbakov');
  assert.ok(enRes.data.data.profile.skills.length > 0, 'EN skills must be non-empty');
  assert.ok(enRes.data.data.profile.projects.length > 0, 'EN projects must be non-empty');
  assert.ok(enRes.data.data.profile.education.length > 0, 'EN education must be non-empty');

  // Проверяем строгий порядок sortOrder в EN:
  const enExp = enRes.data.data.profile.experience;
  assert.deepEqual(
    enExp.map((e) => e.company),
    ['Vyacheslav Bronnikov Foundation', 'EdKids LLC', 'Vodokanal JSC'],
    'EN experience must strictly follow sortOrder',
  );

  // 2. Проверяем локаль RU:
  const ruRes = await sendQuery(`{
    profile(locale: "ru") {
      name
      title
      skills { name category }
      experience { company sortOrder }
      projects { name sortOrder }
      education { institution sortOrder }
    }
  }`);

  assert.equal(ruRes.status, 200, 'HTTP status must be 200');
  assert.equal(ruRes.data.errors, undefined, 'RU query must not produce GraphQL errors');
  assert.equal(ruRes.data.data.profile.name, 'Константин Чумбаков');
  assert.ok(ruRes.data.data.profile.skills.length > 0, 'RU skills must be non-empty');

  // Проверяем строгий порядок sortOrder в RU:
  const ruExp = ruRes.data.data.profile.experience;
  assert.deepEqual(
    ruExp.map((e) => e.company),
    ['Благотворительный Фонд Вячеслава Бронникова', 'ООО Эдкидс', 'АО Водоканал'],
    'RU experience must strictly follow sortOrder',
  );

  console.log('✅ Deep GraphQL verification passed: 0 errors, full nested models, exact sortOrder.');
}

verify().catch((e) => {
  console.error('❌ Smoke verification failed:', e);
  process.exit(1);
});