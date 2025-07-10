import jwt from 'jsonwebtoken';
import { Result, success, failure } from './result';
import { AppErrors, type AppError } from './errors';

export interface JWTPayload {
  readonly userId: string;
  readonly email: string;
  readonly iat?: number;
  readonly exp?: number;
}

export interface JWTConfig {
  readonly secret: string;
  readonly expirationMinutes: number;
}

/**
 * Generate JWT token
 * Pure function that takes all dependencies as parameters
 */
export const generateToken = (
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  config: JWTConfig
): Result<string, Error> => {
  try {
    const token = jwt.sign(payload, config.secret, {
      expiresIn: `${config.expirationMinutes}m`,
    });
    return success(token);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error('Token generation failed'));
  }
};

/**
 * Verify and decode JWT token
 * Pure function that takes all dependencies as parameters
 */
export const verifyToken = (
  token: string,
  secret: string
): Result<JWTPayload, AppError> => {
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return success(decoded);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return failure(AppErrors.invalidToken());
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return failure(AppErrors.invalidToken());
    }
    return failure(AppErrors.internal('Token verification failed'));
  }
};

/**
 * Extract token from Authorization header
 * Pure function for parsing headers
 */
export const extractTokenFromHeader = (authHeader: string | undefined): Result<string, AppError> => {
  if (!authHeader) {
    return failure(AppErrors.unauthorized('Authorization header missing'));
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return failure(AppErrors.unauthorized('Invalid authorization header format'));
  }

  const token = parts[1];
  if (!token) {
    return failure(AppErrors.unauthorized('Token missing'));
  }

  return success(token);
};

/**
 * Get token expiration time in milliseconds
 */
export const getTokenExpirationTime = (config: JWTConfig): number => {
  return Date.now() + (config.expirationMinutes * 60 * 1000);
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (payload: JWTPayload): boolean => {
  if (!payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}; 