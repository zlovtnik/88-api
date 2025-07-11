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
RUN echo '#!/bin/sh\n\n# Set default environment variables\n: "${DATABASE_URL:=file:/app/data/data.db}"\n: "${PORT:=3000}"\n\n# Create database directory if it doesn\'t exist\nDB_DIR=$(dirname "${DATABASE_URL#file:}")\nmkdir -p "$DB_DIR"\nchown -R 1001:1001 "$DB_DIR"\n\n# Initialize database if it doesn\'t exist\nif [ ! -f "${DATABASE_URL#file:}" ]; then\n  echo "Initializing database at ${DATABASE_URL#file:}"\n  touch "${DATABASE_URL#file:}"\n  chmod 666 "${DATABASE_URL#file:}"\n  \n  echo "Running database migrations..."\n  if ! bun run db:migrate; then\n    echo "Warning: Database migrations failed"\n    # Continue anyway to allow manual intervention\n  fi\nfi\n\necho "Starting application on port $PORT..."\n# Run as non-root user (1001 is the default user in oven/bun:1-slim)
USER 1001

# Start the application
exec bun run start\n' > /app/start.sh && \
    chmod +x /app/start.sh

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