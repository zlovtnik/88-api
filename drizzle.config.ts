import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: (process.env.DATABASE_URL || './data.db').replace(/^file:/, ''),
  },
  verbose: true,
  strict: true,
}); 