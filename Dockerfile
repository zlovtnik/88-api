# Use the official Bun image with build tools
FROM oven/bun:1 AS base

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
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

# Create app directory structure
RUN mkdir -p /app/data && \
    mkdir -p /app/migrations && \
    chown -R bun:bun /app

# Copy built application and required files
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./
COPY --from=base /app/drizzle.config.ts ./
COPY --from=base /app/src/db ./src/db
COPY --from=base /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/data.db
ENV PORT=3000

# Create app user and set permissions
RUN mkdir -p /app/data && \
    chown -R 1001:1001 /app

# Create initialization script
RUN cat <<'EOF' > /app/start.sh
#!/bin/sh

# Set default environment variables
: "${DATABASE_URL:=file:/app/data/data.db}"
: "${PORT:=3000}"

# Create database directory if it doesn't exist
DB_DIR=$(dirname "${DATABASE_URL#file:}")
mkdir -p "$DB_DIR"
chown -R 1001:1001 "$DB_DIR"

# Initialize database if it doesn't exist
if [ ! -f "${DATABASE_URL#file:}" ]; then
  echo "Initializing database at ${DATABASE_URL#file:}"
  touch "${DATABASE_URL#file:}"
  chmod 666 "${DATABASE_URL#file:}"

  echo "Running database migrations..."
  if ! bun run db:migrate; then
    echo "Warning: Database migrations failed"
    # Continue anyway to allow manual intervention
  fi
fi

echo "Starting application on port $PORT..."
exec bun run start
EOF

RUN chmod +x /app/start.sh

# Run as non-root user (1001 is the default user in oven/bun:1-slim)
USER 1001

# Start the application
CMD ["/app/start.sh"]

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

 