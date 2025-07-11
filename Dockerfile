# Use the official Bun image
FROM oven/bun:1 as base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./ 
COPY data.db ./data/data.db

# Install dependencies (including devDependencies for migrations)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy built application
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./
COPY --from=base /app/drizzle.config.ts ./
COPY --from=base /app/src/db ./src/db

# Install dependencies (including drizzle-kit for migrations)
RUN bun install --frozen-lockfile

# Create data directory for SQLite
RUN mkdir -p /app/data

# Create initialization script
RUN echo '#!/bin/sh\n\
if [ ! -f /app/data/data.db ]; then\n\
  echo "Initializing database..."\n\
  bun run db:migrate\n\
fi\n\
echo "Starting application..."\n\
exec bun ./dist/index.js\n\
' > /app/start.sh && chmod +x /app/start.sh

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