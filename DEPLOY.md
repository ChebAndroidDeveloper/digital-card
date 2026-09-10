# Deployment & Operations Guide

This document outlines deployment procedures, maintenance, disaster recovery, and architecture details for both local development and production environments.

---

## 1. Quick Start with Docker Compose (Recommended)

The easiest way to run the entire stack (PostgreSQL + Automated Migrations & Seeding + API):

```bash
# 1. Clone the repository
git clone https://github.com/ChebAndroidDeveloper/digital-card.git
cd digital-card

# 2. Setup environment variables
cp .env.example .env

# 3. Build and launch all services
docker compose up -d --build
```

### What happens automatically:
1. `postgres` starts and completes its healthcheck.
2. `db-init` applies all pending Prisma migrations (`prisma migrate deploy`) and idempotently seeds profile data (`prisma db seed`), then exits cleanly.
3. `api` starts up only after `db-init` successfully finishes, exposing the GraphQL endpoint on `http://localhost:3000/graphql` and healthcheck on `http://localhost:3000/health`.

To shut down:
```bash
docker compose down
```

---

## 2. Local Checks on Windows

Docker is not required locally. Run these checks in PowerShell before committing and pushing:

```powershell
npm ci
npx prisma generate
npm run lint
npm run build
npm run typecheck:seed
npm test -- --runInBand
node --test test/app.e2e.test.cjs
```

The unit and HTTP tests use a mock database. `npm run test:db` additionally checks migrations, seed and SQL cancellation against PostgreSQL. It creates a temporary schema and removes it afterwards; use a separate test database, never production. GitHub Actions runs this test with PostgreSQL 16 in Docker.

For local development with live data, start a local PostgreSQL server and set DATABASE_URL to its address. The Docker hostname `postgres` from .env.example is only reachable inside Compose. Apply migrations and seed to the local database, then run `npm run start:dev`.

Commit source files, migrations and the lockfile, then push to GitHub and wait for CI to pass. The server pulls those changes and builds its own Docker images. Local build output is not used for deployment.

---

## 3. Production Deployment (VPS / Reverse Proxy)

In production environments, the container binds to `127.0.0.1:3000` and is reverse-proxied behind host Nginx with SSL termination.

### Reverse Proxy Configuration (Nginx snippet):
```nginx
server {
    server_name developerresume.webredirect.org;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Production Update Procedure

Updates replace the only API container, so a short outage is expected. Measure the actual switchover time on your server; there is no guaranteed duration.

Before updating, keep the current API image and a database backup:

```bash
cd /opt/digital-card
previous_release=$(git rev-parse HEAD)
docker image tag "$(docker compose images -q api)" "digital-card-api:$previous_release"
printf '%s\n' "$previous_release" > .previous-release

docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > "backup-$previous_release.sql"
```

Keep the backup outside the VPS too. The release file and image tag should refer to the last deployment that passed its checks; start from a clean Git checkout.

```bash
git pull --ff-only origin main
docker compose build api db-init
docker compose run --rm --no-deps db-init
docker compose up -d --no-deps --wait --wait-timeout 120 api
docker compose run --rm --no-deps -e GRAPHQL_URL=http://api:3000/graphql db-init node test/smoke-stack.cjs
```

The migration and seed run before the new API starts. Schema changes must remain compatible with the old API while it is still serving requests. If the migration or seed fails, stop the update and inspect its logs before replacing the API.

### Rollback

Use the saved release SHA and API image, not a reflog position. First check that the old API supports the current database schema. Rolling back an image does not undo migrations. Prefer a forward fix when schema compatibility is uncertain; restoring a backup requires downtime and loses changes made after that backup.

For a compatible schema, create a local override using the saved SHA:

```yaml
# compose.rollback.yml
services:
  api:
    image: digital-card-api:<saved-sha>
```

```bash
docker compose -f docker-compose.yml -f compose.rollback.yml up -d --no-deps --no-build --wait --wait-timeout 120 api
```

Verify /health and a GraphQL response with no errors using the smoke test from that release. Do not rerun the old seed automatically: it can overwrite newer content. Keep the saved image until the release has been verified.

## 4. Production Content

Resume content lives in `prisma/content.ts`; `prisma/seed.ts` synchronizes it with the database. Each child record has an explicit `key`, unique within its profile and relation. Keep that key when renaming a company or project. Give different positions at the same company different keys.

The seed updates existing records in place, inserts new keys and removes keys no longer present in the content. Each profile is synchronized in its own transaction. English and Russian profiles are separate transactions.

The stable-key migration matches existing seed entries by their old names and preserves their IDs. Unknown entries and extra duplicates receive a `legacy:<id>` key. The seed leaves those records untouched. Review them after upgrading: assign the intended key and add the entry to content, or remove it explicitly if it is no longer needed. The `legacy:` prefix is reserved for migration leftovers.

## 5. Health Checks and Database Limits

`GET /health` (also HEAD) checks database availability. It returns 503 with only an unhealthy status on failure; details stay in server logs. The HTTP check waits at most 2 seconds and shares an outstanding database probe between callers.

The API adds runtime connection limits: 2 seconds to connect or wait for the pool, 5 seconds for a socket query, a PostgreSQL statement timeout of 4 seconds and lock timeout of 2 seconds. The application wait limit is 8 seconds. The server-side timeout cancels SQL; the application timer only bounds the wait. These settings are applied to API connections, not migration or seed connections. They use the [Prisma PostgreSQL connection parameters](https://docs.prisma.io/docs/orm/v6/overview/databases/postgresql).

The profile cache lasts 60 seconds. A manual seed while the API is running can remain invisible until the cache expires; restart the API when content must become visible immediately.

## 6. Backup and Recovery

Recovery targets need a timed restore exercise on the actual server. There is no measured RTO yet. Git can restore committed resume content, but not database-generated IDs or changes made directly in the database. The database RPO depends on the age of the latest usable backup.

Create a backup:

```bash
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backup.sql
```

Restore into an empty database, with the API stopped. The dump includes tables and data; do not first run migrations or seed against that target.

```bash
docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 --single-transaction -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < backup.sql
```

On a replacement VPS, install Docker, restore the environment and reverse proxy/TLS configuration, start PostgreSQL, restore the backup, then deploy the matching release. Keep POSTGRES_PASSWORD and the password in DATABASE_URL consistent. If no backup exists, migrations and seed rebuild committed content with new IDs.

After recovery, check /health, both GraphQL locales, nested counts and IDs against the backup. Record backup age, restore duration and the release SHA. Store backups and deployment configuration off the VPS.
