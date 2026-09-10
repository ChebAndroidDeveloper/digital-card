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

## 2. Local Development (Without Docker)

For active local development with hot-reload:

```bash
# 1. Install dependencies
npm ci

# 2. Generate Prisma client
npx prisma generate

# 3. Apply database schema and seed
npx prisma migrate deploy
npx prisma db seed

# 4. Start NestJS in watch mode
npm run start:dev
```

Run test and lint suites:
```bash
npm run lint      # Code quality check (Oxlint)
npm test          # Unit tests (Jest)
npm run test:e2e  # Integration E2E tests (Node native test runner)
```

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

### Production Update Procedure (Short Switchover Window):

In a single-container deployment, updates incur a minimal switchover window (~1-2 seconds) while the API container recreates. Both the `maintenance` image (for migrations/seed) and the `runner` image (for API) are rebuilt to ensure migrations and runtime code stay synchronized.

1. **Pull and Deploy Updates (with Migrations & Seed):**
   ```bash
   cd /opt/digital-card
   git pull origin main

   # Builds both maintenance and runner stages, runs db-init migrations/seed, and restarts API
   docker compose up -d --build
   ```

2. **Verify Deployment Health (Smoke Test):**
   ```bash
   curl --fail -s -X POST https://developerresume.webredirect.org/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "{ profile(locale: \"en\") { name } }"}'
   ```

3. **Rollback Strategy (in case of failure):**
   ```bash
   # Revert to the previous git commit and rebuild
   git reset --hard HEAD@{1}
   docker compose up -d --build
   ```

---

## 4. Production Content Architecture (Resume as Code)

In this project, `prisma/seed.ts` is the declarative **Single Source of Truth** for the production resume content (*Resume as Code*).

### Non-Destructive Seed Updates:
When `prisma db seed` executes against an existing database, it performs **in-place upserts by stable business keys** (`company`, `name`, `institution`):
- Existing database `id` (UUIDs) are **strictly preserved**, preventing client-side cache invalidation (e.g. Apollo Client cache).
- Added entities are inserted with new UUIDs.
- Removed entities are cleaned up safely in an atomic database transaction.

---

## 5. Disaster Recovery & Backup Strategy

### Recovery Objectives:
- **RPO (Recovery Point Objective):** 0 minutes (The entire production resume data is declarative in Git under `prisma/seed.ts`).
- **RTO (Recovery Time Objective):** < 3 minutes (Time to spin up fresh containers on any clean VPS via Docker Compose).

### Database Backup & Restore:

1. **Create Database Snapshot:**
   ```bash
   docker exec -t digital_card_db pg_dump -U postgres digital_card > backup.sql
   ```

2. **Restore Database from Snapshot:**
   ```bash
   cat backup.sql | docker exec -i digital_card_db psql -U postgres -d digital_card
   ```

3. **Complete Cold-Start Disaster Recovery:**
   If the entire VPS is lost, provision a new server and run:
   ```bash
   git clone https://github.com/ChebAndroidDeveloper/digital-card.git /opt/digital-card
   cd /opt/digital-card
   cp .env.example .env
   # Set POSTGRES_PASSWORD in .env
   docker compose up -d --build
   ```