FROM oven/bun AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS prisma-generate
COPY prisma ./prisma/
RUN bunx prisma generate

FROM base AS build
COPY --from=prisma-generate /app/node_modules ./node_modules
COPY --from=prisma-generate /app/prisma ./prisma
COPY ./src ./src
ENV NODE_ENV=production
RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--outfile server \
	src/index.ts

FROM oven/bun AS runtime
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the binary from build stage
COPY --from=build /app/server .

# Copy prisma schema and generated client for migrations
COPY --from=prisma-generate /app/prisma ./prisma
COPY --from=prisma-generate /app/node_modules/.prisma ./node_modules/.prisma

# Create non-root user
RUN addgroup --system --gid 1001 bun
RUN adduser --system --uid 1001 bun
USER bun

ENV NODE_ENV=production

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["./server"]