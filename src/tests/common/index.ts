import { db } from '../../db';
import { users, items, refreshTokens } from '../../db/schema';

/**
 * Test database utilities
 */
export const clearTestDatabase = async (): Promise<void> => {
  await db.delete(refreshTokens);
  await db.delete(items);
  await db.delete(users);
};

/**
 * Create test user data
 */
export const createTestUser = () => ({
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User',
});


/**
 * Test utilities
 */
export const testUtils = {
  /**
   * Test server URL
   */
  TEST_SERVER_URL: 'http://localhost:3000',
  /**
   * Make authenticated request
   */
  async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {},
    token?: string
  ): Promise<Response> {
    const headers = new Headers(options.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return fetch(url, {
      ...options,
      headers,
    });
  },
  
  /**
   * Parse JSON response
   */
  async parseJsonResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json() as Promise<T>;
  },
  
  /**
   * Wait for server to be ready
   */
  async waitForServer(url: string, maxAttempts = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${url}/health`);
        if (response.ok) {
          return;
        }
      } catch {
        // Ignore errors and continue
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Server did not start within expected time');
  },
}; 