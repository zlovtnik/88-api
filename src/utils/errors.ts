/**
 * Custom error types for the application
 * Following functional programming principles with explicit error handling
 */

export interface AppError {
  readonly type: string;
  readonly message: string;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;
}

export const createAppError = (
  type: string,
  message: string,
  statusCode: number,
  details?: Record<string, unknown>
): AppError => ({
  type,
  message,
  statusCode,
  ...(details && { details }),
});

// Specific error types
export const AppErrors = {
  // Authentication errors
  unauthorized: (message = 'Unauthorized'): AppError =>
    createAppError('UNAUTHORIZED', message, 401),

  forbidden: (message = 'Forbidden'): AppError =>
    createAppError('FORBIDDEN', message, 403),

  invalidCredentials: (): AppError =>
    createAppError('INVALID_CREDENTIALS', 'Invalid email or password', 401),

  invalidToken: (): AppError =>
    createAppError('INVALID_TOKEN', 'Invalid or expired token', 401),

  // Validation errors
  validationError: (message: string, details?: Record<string, unknown>): AppError =>
    createAppError('VALIDATION_ERROR', message, 400, details),

  // Resource errors
  notFound: (resource = 'Resource'): AppError =>
    createAppError('NOT_FOUND', `${resource} not found`, 404),

  conflict: (message: string): AppError =>
    createAppError('CONFLICT', message, 409),

  // Server errors
  internal: (message = 'Internal server error'): AppError =>
    createAppError('INTERNAL_ERROR', message, 500),

  databaseError: (message = 'Database operation failed'): AppError =>
    createAppError('DATABASE_ERROR', message, 500),

  // Rate limiting
  tooManyRequests: (message = 'Too many requests'): AppError =>
    createAppError('TOO_MANY_REQUESTS', message, 429),
} as const;

/**
 * HTTP status code to error type mapping
 */
export const statusCodeToErrorType: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_ERROR',
  502: 'BAD_GATEWAY',
  503: 'SERVICE_UNAVAILABLE',
} as const;

/**
 * Convert HTTP status code to error type
 */
export const getErrorTypeFromStatusCode = (statusCode: number): string =>
  statusCodeToErrorType[statusCode] || 'UNKNOWN_ERROR';

/**
 * Error response format for API
 */
export interface ErrorResponse {
  error: {
    type: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
  path?: string;
}

export const createErrorResponse = (
  error: AppError,
  path?: string
): ErrorResponse => ({
  error: {
    type: error.type,
    message: error.message,
    ...(error.details && { details: error.details }),
  },
  timestamp: new Date().toISOString(),
  ...(path && { path }),
}); 