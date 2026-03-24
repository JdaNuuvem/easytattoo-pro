# === Stage 1: Build ===
FROM node:20-alpine AS builder
ENV NODE_ENV=development
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Copy monorepo workspace files
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/
COPY api/package.json ./api/

# Install all dependencies with shamefully-hoist (NODE_ENV=development to get devDeps)
RUN pnpm install --filter web...

# Copy source
COPY web ./web

# Switch to production for Next.js build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_URL=http://api:3000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js
WORKDIR /app/web
RUN pnpm build

# === Stage 2: Production Runner ===
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/static ./.next/static

USER nextjs

EXPOSE 3080
ENV PORT=3080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
