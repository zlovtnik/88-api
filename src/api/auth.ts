import { createUser, authenticateUser, getUserById, refreshAccessToken } from '../handlers';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken, type JWTConfig } from '../utils/jwt';
import { config } from '../config';
import { createErrorResponse, type AppError } from '../utils/errors';
import type { CreateUserRequest, LoginRequest } from '../db/models';

/**
 * Register new user endpoint
 */
export const registerUser = async (request: Request): Promise<Response> => {
  try {
    const body = await request.json() as CreateUserRequest;
    
    const result = await createUser(
      body,
      hashPassword,
      generateToken,
      config.jwt
    );
    
    if (result.isFailure()) {
      const errorResponse = createErrorResponse(result.error, '/auth/register');
      return new Response(JSON.stringify(errorResponse), {
        status: result.error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ user: result.value }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorResponse = createErrorResponse(
      { type: 'VALIDATION_ERROR', message: 'Invalid JSON', statusCode: 400 },
      '/auth/register'
    );
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Login endpoint
 */
export const loginUser = async (request: Request): Promise<Response> => {
  try {
    const body = await request.json() as LoginRequest;
    
    const result = await authenticateUser(
      body,
      verifyPassword,
      generateToken,
      config.jwt
    );
    
    if (result.isFailure()) {
      const errorResponse = createErrorResponse(result.error, '/auth/login');
      return new Response(JSON.stringify(errorResponse), {
        status: result.error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify(result.value), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorResponse = createErrorResponse(
      { type: 'VALIDATION_ERROR', message: 'Invalid JSON', statusCode: 400 },
      '/auth/login'
    );
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Get current user profile endpoint
 */
export const getCurrentUser = async (request: Request): Promise<Response> => {
  try {
    // Extract user ID from JWT token (this would be done by middleware in a real app)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const errorResponse = createErrorResponse(
        { type: 'UNAUTHORIZED', message: 'Authorization header required', statusCode: 401 },
        '/auth/me'
      );
      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // For simplicity, we'll assume the user ID is in the header
    // In a real app, this would be extracted from JWT token
    const userId = authHeader.replace('Bearer ', '');
    
    const result = await getUserById(userId);
    
    if (result.isFailure()) {
      const errorResponse = createErrorResponse(result.error, '/auth/me');
      return new Response(JSON.stringify(errorResponse), {
        status: result.error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ user: result.value }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorResponse = createErrorResponse(
      { type: 'INTERNAL_ERROR', message: 'Internal server error', statusCode: 500 },
      '/auth/me'
    );
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Refresh token endpoint
 */
export const refreshToken = async (request: Request): Promise<Response> => {
  try {
    const body = await request.json() as { refreshToken: string };
    
    if (!body.refreshToken) {
      const errorResponse = createErrorResponse(
        { type: 'VALIDATION_ERROR', message: 'Refresh token is required', statusCode: 400 },
        '/auth/refresh'
      );
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const result = await refreshAccessToken(
      body.refreshToken,
      generateToken,
      config.jwt
    );
    
    if (result.isFailure()) {
      const errorResponse = createErrorResponse(result.error, '/auth/refresh');
      return new Response(JSON.stringify(errorResponse), {
        status: result.error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ token: result.value }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorResponse = createErrorResponse(
      { type: 'VALIDATION_ERROR', message: 'Invalid JSON', statusCode: 400 },
      '/auth/refresh'
    );
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 