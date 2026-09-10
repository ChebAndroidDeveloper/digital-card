const assert = require('node:assert/strict');

async function verify() {
  for (const [locale, name] of [
    ['en', 'Konstantin Chumbakov'],
    ['ru', 'Константин Чумбаков'],
  ]) {
    const response = await fetch(
      process.env.GRAPHQL_URL ?? 'http://localhost:3000/graphql',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{ profile(locale: "${locale}") {
          name title skills { id name category }
          experience { id company sortOrder }
          projects { id name sortOrder }
          education { id institution sortOrder }
        } }`,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.errors, undefined);
    const profile = body.data.profile;
    assert.equal(profile.name, name);
    assert.ok(profile.title);
    for (const [field, count] of Object.entries({
      skills: 19,
      experience: 3,
      projects: 4,
      education: 1,
    })) {
      assert.equal(profile[field].length, count, `${locale}: ${field} count`);
      assert.equal(new Set(profile[field].map((item) => item.id)).size, count);
      if (field !== 'skills') {
        assert.deepEqual(
          profile[field].map((item) => item.sortOrder),
          Array.from({ length: count }, (_, i) => i + 1),
          `${locale}: ${field} order`,
        );
      }
    }
  }
  console.log('GraphQL smoke test passed.');
}

verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
