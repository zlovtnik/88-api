import { describe, it, expect, beforeAll } from 'bun:test';
import { createTestUser, testUtils, clearTestDatabase } from '../common';

beforeAll(async () => {
  await testUtils.waitForServer(testUtils.TEST_SERVER_URL);
  await clearTestDatabase();
});

describe('Authentication API', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = createTestUser();
      const response = await fetch(`${testUtils.TEST_SERVER_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      expect(response.status).toBe(201);
      const result = await response.json();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
    });

    it('should return error for invalid email', async () => {
      const userData = { ...createTestUser(), email: 'invalid-email' };
      const response = await fetch(`${testUtils.TEST_SERVER_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error.type).toBe('VALIDATION_ERROR');
    });

    it('should return error for weak password', async () => {
      const userData = { ...createTestUser(), password: 'weak' };
      const response = await fetch(`${testUtils.TEST_SERVER_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error.type).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // First register a user
      const userData = createTestUser();
      await fetch(`${testUtils.TEST_SERVER_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      // Then login
      const response = await fetch(`${testUtils.TEST_SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email, password: userData.password }),
      });
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const response = await fetch(`${testUtils.TEST_SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@example.com', password: 'wrongpassword' }),
      });
      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.error.type).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await fetch(`${testUtils.TEST_SERVER_URL}/health`);
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.status).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeDefined();
      expect(result.database).toBeDefined();
      expect(result.version).toBeDefined();
    });
  });
}); 