# --- Stage 1: Build ---
FROM node:22-alpine AS builder

WORKDIR /app

ENV DATABASE_URL="postgresql://postgres:placeholder@localhost:5432/digital_card?schema=public"

COPY package*.json ./
COPY prisma ./prisma/

# Используем точный lock-файл для воспроизводимой сборки
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Tools are only included in the explicitly selected maintenance image.
FROM builder AS maintenance
USER node
CMD ["npx", "prisma", "migrate", "deploy"]

FROM builder AS production-deps
RUN npm prune --omit=dev --ignore-scripts

# --- Stage 2: Runtime ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN chown -R node:node /app
USER node

EXPOSE 3000

# Финальный контейнер запускает ТОЛЬКО серверное приложение
CMD ["node", "dist/main.js"]
