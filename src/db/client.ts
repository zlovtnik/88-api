import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { config } from '../config';
import * as schema from './schema';

/**
 * Initialize SQLite database connection
 * Pure function that takes database URL as parameter
 */
export const createDatabase = (databaseUrl: string) => {
  // Remove 'file:' prefix if present
  const dbPath = databaseUrl.replace(/^file:/, '');
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
};

/**
 * Global database instance
 * Immutable once created
 */
export const db = Object.freeze(createDatabase(config.database.url));

/**
 * Database connection utilities
 */
export const closeDatabase = (): void => {
  // Note: better-sqlite3 doesn't have a close method
  // The connection is automatically closed when the process exits
};

/**
 * Database health check
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await db.select().from(schema.users).limit(1);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}; 