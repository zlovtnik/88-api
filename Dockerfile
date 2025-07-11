# Use the official Bun image with build tools
FROM oven/bun:1 as base

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies (including devDependencies for migrations)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built application and database files
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./
COPY --from=base /app/drizzle.config.ts ./
COPY --from=base /app/src/db ./src/db
COPY --from=base /app/node_modules ./node_modules

# Create data directory for SQLite with correct permissions
RUN mkdir -p /app/data && \
    chown -R bun:bun /app/data

# Create data directory for SQLite
RUN mkdir -p /app/data

# Create initialization script
RUN echo '#!/bin/sh\nif [ ! -f /app/data/data.db ]; then\n  echo "Initializing database..."\n  echo "Running database migrations..."\n  bun run db:migrate || echo "Migrations failed, continuing with existing database"\nfi\n\necho "Starting application..."\nexec bun ./dist/index.js\n' > /app/start.sh && chmod +x /app/start.sh

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Start the application with initialization
CMD ["/app/start.sh"] 