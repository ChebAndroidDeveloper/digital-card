# Deployment Guide

This document outlines deployment procedures for both local development and production environments.

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
3. `api` starts up only after `db-init` successfully finishes, exposing the GraphQL endpoint on `http://localhost:3000/graphql`.

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

Run test suites:
```bash
npm test          # Unit tests (Jest)
npm run test:e2e  # Integration E2E tests (Node native test runner)
```

---

## 3. Production Deployment (VPS / Reverse Proxy)

In production environments, the container binds to `127.0.0.1:3000` and is reverse-proxied behind Nginx with SSL termination.

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

### Zero-Downtime Application Update:
```bash
git pull origin main
docker compose up -d --build api
```

---

## 4. Production Content Architecture (Resume as Code)

In this project, `prisma/seed.ts` is the declarative **Single Source of Truth** for the production resume content (*Resume as Code*).

### Non-Destructive Seed Updates:
When `prisma db seed` executes against an existing database, it performs **in-place upserts by stable business keys** (`company`, `name`, `institution`):
- Existing database `id` (UUIDs) are **strictly preserved**, preventing client-side cache invalidation (e.g. Apollo Client cache).
- Added entities are inserted with new UUIDs.
- Removed entities are cleaned up safely in an atomic database transaction.