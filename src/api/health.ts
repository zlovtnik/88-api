import { checkDatabaseHealth } from '../db';

/**
 * Health check response interface
 */
export interface HealthResponse {
  readonly status: 'healthy' | 'unhealthy';
  readonly timestamp: string;
  readonly uptime: number;
  readonly database: 'connected' | 'disconnected';
  readonly version: string;
}

/**
 * Health check handler
 * Pure function that takes database health check as parameter
 */
export const healthCheck = async (
  databaseHealthCheck: () => Promise<boolean>
): Promise<HealthResponse> => {
  const isDatabaseHealthy = await databaseHealthCheck();
  
  return {
    status: isDatabaseHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isDatabaseHealthy ? 'connected' : 'disconnected',
    version: '1.0.0',
  };
}; 