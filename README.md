# Digital Business Card & Resume API
![CI Pipeline](https://github.com/ChebAndroidDeveloper/digital-card/actions/workflows/ci.yaml/badge.svg)

A backend service presenting professional developer experience, skills, and projects via an interactive GraphQL API with Apollo Sandbox.

Built with **NestJS**, **TypeScript**, **GraphQL (Code-First)**, **Prisma ORM**, **PostgreSQL**, and **Docker**.

---

## 🚀 Key Features & Architectural Decisions

- **Clean Architecture & Separation of Concerns:**
  - **Resolvers (`ProfileResolver`):** Handles incoming GraphQL operations.
  - **Service Layer (`ProfileService`):** Encapsulates business logic.
  - **Data Access (`PrismaService`):** Type-safe database interactions via Prisma ORM.
  - **Field Resolvers (`@ResolveField`):** Prevents overfetching by fetching nested relations (`skills`, `experience`, `projects`, `education`) only when requested in the GraphQL query.
- **Multilingual Support (i18n):**
  - Native support for both **English** (`locale: "en"`, default) and **Russian** (`locale: "ru"`).
- **Security & Hardening:**
  - Masking internal database errors in production (prevents table/query detail leakage while preserving GraphQL spec error locations).
  - PostgreSQL database is completely isolated within the Docker private bridge network (no exposed public database ports).
- **Containerization:**
  - Multi-stage Docker build with PostgreSQL health checks to prevent race conditions during startup.

---

## 🛠 Tech Stack

- **Runtime:** Node.js 22 LTS
- **Language:** TypeScript
- **Framework:** NestJS
- **API Protocol:** GraphQL (Apollo Server + Apollo Sandbox)
- **ORM:** Prisma ORM
- **Database:** PostgreSQL 16
- **DevOps:** Docker & Docker Compose, GitHub Actions CI

---

## ⚡ Quick Start (Docker Compose)

1. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```

2. **Start the Application:**
   ```bash
   docker compose up -d --build
   ```

3. **Access GraphQL Sandbox:**
   Open http://localhost:3000/graphql in your browser.

4. **Stop Containers:**
   ```bash
   docker compose down
   ```

---

## 🔍 Example GraphQL Queries

### 1. Default Profile Query (English)
```graphql
query {
  profile {
    name
    title
    description
    location
    skills {
      name
      category
    }
    experience {
      company
      position
      period
      achievements
    }
    projects {
      name
      description
      url
    }
    education {
      institution
      year
      faculty
    }
  }
}
```

### 2. Russian Profile Query
```graphql
query {
  profile(locale: "ru") {
    name
    title
    description
    location
    skills {
      name
      category
    }
    experience {
      company
      position
      period
      achievements
    }
    projects {
      name
      description
      url
    }
    education {
      institution
      year
      faculty
    }
  }
}
```