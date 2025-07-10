

import { verifyToken, extractTokenFromHeader, type JWTPayload } from '../utils/jwt';
import { AppErrors, type AppError } from '../utils/errors';
import { config } from '../config';

/**
 * Request context with authenticated user
 */
export interface AuthenticatedRequest {
  readonly user: JWTPayload;
}

/**
 * JWT Authentication middleware
 * Pure function that takes request and JWT secret as parameters
 */
export const authenticateJWT = (
  authHeader: string | undefined,
  jwtSecret: string
): { user: JWTPayload } | AppError => {
  // Extract token from header
  const tokenResult = extractTokenFromHeader(authHeader);
  if (tokenResult.isFailure()) {
    return tokenResult.error;
  }
  
  // Verify token
  const verifyResult = verifyToken(tokenResult.value, jwtSecret);
  if (verifyResult.isFailure()) {
    return verifyResult.error;
  }
  
  return { user: verifyResult.value };
};

/**
 * Middleware factory for JWT authentication
 * Returns a middleware function that can be used in route handlers
 */
export const createJWTAuthMiddleware = () => {
  return (request: Request): { user: JWTPayload } | AppError => {
    const authHeader = request.headers.get('authorization') ?? undefined;
    return authenticateJWT(authHeader, config.jwt.secret);
  };
};

/**
 * Type guard to check if request is authenticated
 */
export const isAuthenticated = (
  result: { user: JWTPayload } | AppError
): result is { user: JWTPayload } => {
  return !('type' in result);
}; 