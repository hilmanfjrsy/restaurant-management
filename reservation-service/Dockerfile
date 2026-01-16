FROM oven/bun:1 AS builder

WORKDIR /app

# Copy all workspace files
COPY package.json bun.lock* ./
COPY packages ./packages
COPY reservation-service ./reservation-service
COPY table-service/package.json ./table-service/package.json

# Install dependencies
RUN bun install --frozen-lockfile

FROM oven/bun:1-alpine AS production

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/reservation-service ./reservation-service

WORKDIR /app/reservation-service

EXPOSE 3001

CMD ["bun", "run", "start"]
