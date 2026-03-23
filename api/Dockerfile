# === Stage 1: Dependencies ===
FROM node:20-alpine AS deps
ENV NODE_ENV=development
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Copy root workspace files for pnpm monorepo resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/
COPY web/package.json ./web/
COPY api/prisma ./api/prisma/

RUN pnpm install --frozen-lockfile --filter api...
RUN cd api && pnpm exec prisma generate

# === Stage 2: Builder ===
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/api/node_modules ./api/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api ./api

WORKDIR /app/api
RUN pnpm build

# === Stage 3: Production Runner ===
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Security: run as non-root user
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/api/node_modules ./node_modules
COPY --from=builder /app/api/prisma ./prisma
COPY --from=builder /app/api/package.json ./
COPY api/entrypoint.sh ./entrypoint.sh

# Create uploads directory with proper ownership
RUN mkdir -p uploads && chown nestjs:nestjs uploads && \
    chmod +x entrypoint.sh

USER nestjs

EXPOSE 3000
ENV PORT=3000

CMD ["./entrypoint.sh"]
