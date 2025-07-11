import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';
import { config } from '../config';
import * as schema from './schema';

// Get the directory name in ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Ensure the database directory exists
 */
const ensureDbDir = (dbPath: string): string => {
  const fullPath = dbPath.startsWith('/') 
    ? dbPath 
    : join(process.cwd(), dbPath);
  
  const dir = dirname(fullPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return fullPath;
};

/**
 * Initialize SQLite database connection
 * Pure function that takes database URL as parameter
 */
export const createDatabase = (databaseUrl: string) => {
  try {
    // Remove 'file:' prefix if present and ensure directory exists
    const dbPath = ensureDbDir(databaseUrl.replace(/^file:/, ''));
    console.log(`Connecting to database at: ${dbPath}`);
    const sqlite = new Database(dbPath);
    
    // Enable foreign key constraints
    sqlite.exec('PRAGMA foreign_keys = ON');
    
    return drizzle(sqlite, { schema });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
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