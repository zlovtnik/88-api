import { z } from 'zod';

/**
 * Environment variables schema for validation
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().default('file:./data.db'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRATION_MINUTES: z.string().transform(Number).pipe(
    z.number().min(1).max(1440) // 1 minute to 24 hours
  ).default('60'),
  
  // Server
  PORT: z.string().transform(Number).pipe(
    z.number().min(1).max(65535)
  ).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

/**
 * Application configuration interface
 */
export interface AppConfig {
  readonly database: {
    readonly url: string;
  };
  readonly jwt: {
    readonly secret: string;
    readonly expirationMinutes: number;
  };
  readonly server: {
    readonly port: number;
    readonly env: 'development' | 'production' | 'test';
  };
  readonly logging: {
    readonly level: 'error' | 'warn' | 'info' | 'debug';
  };
}

/**
 * Load and validate configuration from environment variables
 * Pure function that returns immutable configuration
 */
export const loadConfig = (): AppConfig => {
  const env = envSchema.parse(process.env);
  
  return {
    database: {
      url: env.DATABASE_URL,
    },
    jwt: {
      secret: env.JWT_SECRET,
      expirationMinutes: env.JWT_EXPIRATION_MINUTES,
    },
    server: {
      port: env.PORT,
      env: env.NODE_ENV,
    },
    logging: {
      level: env.LOG_LEVEL,
    },
  };
};

/**
 * Global configuration instance
 * Immutable once loaded
 */
export const config = Object.freeze(loadConfig());

/**
 * Type-safe configuration getters
 */
export const getDatabaseUrl = (): string => config.database.url;
export const getJwtSecret = (): string => config.jwt.secret;
export const getJwtExpirationMinutes = (): number => config.jwt.expirationMinutes;
export const getServerPort = (): number => config.server.port;
export const getServerEnv = (): string => config.server.env;
export const getLogLevel = (): string => config.logging.level;
export const isDevelopment = (): boolean => config.server.env === 'development';
export const isProduction = (): boolean => config.server.env === 'production';
export const isTest = (): boolean => config.server.env === 'test'; 