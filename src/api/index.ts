import { healthCheck } from './health';
import { registerUser, loginUser, getCurrentUser, refreshToken } from './auth';
import { getAllUsers, getUserById, updateUserById, deleteUserById } from './users';
import { checkDatabaseHealth } from '../db';
import { createErrorResponse } from '../utils/errors';

/**
 * Route handler type
 */
type RouteHandler = (request: Request, ...args: string[]) => Promise<Response>;

/**
 * Route definition interface
 */
interface Route {
  readonly method: string;
  readonly path: string;
  readonly handler: RouteHandler;
}

/**
 * Route definitions
 */
const routes: readonly Route[] = [
  // Health check
  { method: 'GET', path: '/health', handler: async () => {
    const health = await healthCheck(checkDatabaseHealth);
    return new Response(JSON.stringify(health), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }},
  
  // Authentication routes
  { method: 'POST', path: '/auth/register', handler: registerUser },
  { method: 'POST', path: '/auth/login', handler: loginUser },
  { method: 'GET', path: '/auth/me', handler: getCurrentUser },
  { method: 'POST', path: '/auth/refresh', handler: refreshToken },
  
  // User routes
  { method: 'GET', path: '/users', handler: getAllUsers },
  { method: 'GET', path: '/users/:id', handler: getUserById },
  { method: 'PUT', path: '/users/:id', handler: updateUserById },
  { method: 'DELETE', path: '/users/:id', handler: deleteUserById },
];

/**
 * Match route pattern with URL path
 */
const matchRoute = (pattern: string, path: string): { matched: boolean; params: string[] } => {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  
  if (patternParts.length !== pathParts.length) {
    return { matched: false, params: [] };
  }
  
  const params: string[] = [];
  
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i]!;
    const pathPart = pathParts[i]!;
    
    if (patternPart.startsWith(':')) {
      params.push(pathPart);
    } else if (patternPart !== pathPart) {
      return { matched: false, params: [] };
    }
  }
  
  return { matched: true, params };
};

/**
 * Main API router
 */
export const handleRequest = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  // Find matching route
  for (const route of routes) {
    if (route.method !== method) continue;
    
    const { matched, params } = matchRoute(route.path, path);
    if (matched) {
      try {
        return await route.handler(request, ...params);
      } catch (error) {
        console.error('Route handler error:', error);
        const errorResponse = createErrorResponse(
          { type: 'INTERNAL_ERROR', message: 'Internal server error', statusCode: 500 },
          path
        );
        return new Response(JSON.stringify(errorResponse), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }
  
  // No matching route found
  const errorResponse = createErrorResponse(
    { type: 'NOT_FOUND', message: 'Route not found', statusCode: 404 },
    path
  );
  return new Response(JSON.stringify(errorResponse), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}; 