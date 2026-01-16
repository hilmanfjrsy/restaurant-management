FROM oven/bun:1 AS builder

WORKDIR /app

# Copy all workspace files
COPY package.json bun.lock* ./
COPY packages ./packages
COPY table-service ./table-service
COPY reservation-service/package.json ./reservation-service/package.json

# Install dependencies
RUN bun install --frozen-lockfile

FROM oven/bun:1-alpine AS production

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/table-service ./table-service

WORKDIR /app/table-service

EXPOSE 3002

CMD ["bun", "run", "start"]
