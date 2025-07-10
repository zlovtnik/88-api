import { handleRequest } from './api';
import { config } from './config';
import { createErrorResponse } from './utils/errors';
import { logRequest, logResponse } from './utils/logger';

/**
 * Global error handler
 */
const handleError = (error: unknown, path: string): Response => {
  console.error('Unhandled error:', error);
  
  const errorResponse = createErrorResponse(
    { type: 'INTERNAL_ERROR', message: 'Internal server error', statusCode: 500 },
    path
  );
  
  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * CORS headers
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Main request handler
 */
const handleServerRequest = async (request: Request): Promise<Response> => {
  try {
    logRequest(request);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      const response = new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
      logResponse(request, response);
      return response;
    }

    // Handle API requests
    const response = await handleRequest(request);

    // Add CORS headers to all responses
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    const finalResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });

    logResponse(request, finalResponse);
    return finalResponse;
  } catch (error) {
    const url = new URL(request.url);
    const errorResponse = handleError(error, url.pathname);
    logResponse(request, errorResponse);
    return errorResponse;
  }
};

/**
 * Start the server
 */
const startServer = () => {
  const port = config.server.port;
  const env = config.server.env;
  
  console.log(`🚀 Starting 88-API server...`);
  console.log(`📍 Environment: ${env}`);
  console.log(`🌐 Server running at http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`📚 API Documentation: Available at /health endpoint`);
  
  Bun.serve({
    port,
    fetch: handleServerRequest,
    error: (error) => {
      console.error('Server error:', error);
    },
  });
  
  console.log(`✅ Server started successfully!`);
};

/**
 * Graceful shutdown handler
 */
const handleShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  process.exit(0);
};

// Register shutdown handlers
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Start the server
startServer(); 