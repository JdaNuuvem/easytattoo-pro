# === Stage 1: Build ===
FROM node:20-alpine AS builder
ENV NODE_ENV=development
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Copy monorepo workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/
COPY web/package.json ./web/

# Install all dependencies (including devDeps for build)
RUN pnpm install --frozen-lockfile --filter api...

# Copy source and build
COPY api ./api
RUN cd api && pnpm exec prisma generate
RUN cd api && pnpm exec nest build
RUN ls -la api/dist/ && test -f api/dist/main.js

# === Stage 2: Production Runner ===
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

# Copy built app and production deps
COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/api/node_modules ./node_modules
COPY --from=builder /app/api/prisma ./prisma
COPY --from=builder /app/api/package.json ./
COPY api/entrypoint.sh ./entrypoint.sh

# Install prisma CLI for runtime migrations
RUN npm install -g prisma@6

RUN mkdir -p uploads && chown nestjs:nestjs uploads && \
    chmod +x entrypoint.sh

USER nestjs

EXPOSE 3000
ENV PORT=3000

CMD ["./entrypoint.sh"]
