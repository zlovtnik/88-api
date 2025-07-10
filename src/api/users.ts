import { getUsers, updateUser, deleteUser } from '../handlers';
import { createErrorResponse } from '../utils/errors';

/**
 * Get all users endpoint
 */
export const getAllUsers = async (request: Request): Promise<Response> => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = parseInt(url.searchParams.get('limit') ?? '10');
    
    const result = await getUsers({ page, limit });
    
    if (result.isFailure()) {
      const errorResponse = createErrorResponse(result.error, '/users');
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
      { type: 'INTERNAL_ERROR', message: 'Internal server error', statusCode: 500 },
      '/users'
    );
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Get user by ID endpoint
 */
export const getUserById = async (request: Request, userId: string): Promise<Response> => {
  try {
    const result = await getUsers({ page: 1, limit: 1 });
    
    if (result.isFailure()) {
      const errorResponse = createErrorResponse(result.error, `/users/${userId}`);
      return new Response(JSON.stringify(errorResponse), {
        status: result.error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Find user by ID in the results
    const user = result.value.data.find(u => u.id === userId);
    if (!user) {
      const errorResponse = createErrorResponse(
        { type: 'NOT_FOUND', message: 'User not found', statusCode: 404 },
        `/users/${userId}`
      );
      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorResponse = createErrorResponse(
      { type: 'INTERNAL_ERROR', message: 'Internal server error', statusCode: 500 },
      `/users/${userId}`
    );
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Update user endpoint
 */
export const updateUserById = async (request: Request, userId: string): Promise<Response> => {
  try {
    const body = await request.json() as { name?: string; email?: string };
    
    const result = await updateUser(userId, body);
    
    if (result.isFailure()) {
      const errorResponse = createErrorResponse(result.error, `/users/${userId}`);
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
      { type: 'VALIDATION_ERROR', message: 'Invalid JSON', statusCode: 400 },
      `/users/${userId}`
    );
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Delete user endpoint
 */
export const deleteUserById = async (request: Request, userId: string): Promise<Response> => {
  try {
    const result = await deleteUser(userId);
    
    if (result.isFailure()) {
      const errorResponse = createErrorResponse(result.error, `/users/${userId}`);
      return new Response(JSON.stringify(errorResponse), {
        status: result.error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorResponse = createErrorResponse(
      { type: 'INTERNAL_ERROR', message: 'Internal server error', statusCode: 500 },
      `/users/${userId}`
    );
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 