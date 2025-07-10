import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { createUser, authenticateUser, getUserById } from '../../handlers/auth';
import { hashPassword, verifyPassword } from '../../utils/password';
import { generateToken } from '../../utils/jwt';
import { config } from '../../config';
import { clearTestDatabase, createTestUser } from '../common';

describe('Authentication Handlers', () => {
  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = createTestUser();
      
      const result = await createUser(
        userData,
        hashPassword,
        generateToken,
        config.jwt
      );
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.email).toBe(userData.email);
        expect(result.value.name).toBe(userData.name);
        expect(result.value.id).toBeDefined();
      }
    });

    it('should return error for invalid email', async () => {
      const userData = {
        ...createTestUser(),
        email: 'invalid-email',
      };
      
      const result = await createUser(
        userData,
        hashPassword,
        generateToken,
        config.jwt
      );
      
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
      }
    });

    it('should return error for weak password', async () => {
      const userData = {
        ...createTestUser(),
        password: 'weak',
      };
      
      const result = await createUser(
        userData,
        hashPassword,
        generateToken,
        config.jwt
      );
      
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      // First create a user
      const userData = createTestUser();
      const createResult = await createUser(
        userData,
        hashPassword,
        generateToken,
        config.jwt
      );
      
      expect(createResult.isSuccess()).toBe(true);
      
      // Then authenticate
      const authResult = await authenticateUser(
        {
          email: userData.email,
          password: userData.password,
        },
        verifyPassword,
        generateToken,
        config.jwt
      );
      
      expect(authResult.isSuccess()).toBe(true);
      if (authResult.isSuccess()) {
        expect(authResult.value.user.email).toBe(userData.email);
        expect(authResult.value.token).toBeDefined();
        expect(authResult.value.refreshToken).toBeDefined();
      }
    });

    it('should return error for invalid credentials', async () => {
      const authResult = await authenticateUser(
        {
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        },
        verifyPassword,
        generateToken,
        config.jwt
      );
      
      expect(authResult.isFailure()).toBe(true);
      if (authResult.isFailure()) {
        expect(authResult.error.type).toBe('INVALID_CREDENTIALS');
      }
    });
  });

  describe('getUserById', () => {
    it('should get user by ID', async () => {
      // First create a user
      const userData = createTestUser();
      const createResult = await createUser(
        userData,
        hashPassword,
        generateToken,
        config.jwt
      );
      
      expect(createResult.isSuccess()).toBe(true);
      
      if (createResult.isSuccess()) {
        const user = createResult.value;
        const getResult = await getUserById(user.id);
        
        expect(getResult.isSuccess()).toBe(true);
        if (getResult.isSuccess()) {
          expect(getResult.value.id).toBe(user.id);
          expect(getResult.value.email).toBe(user.email);
          expect(getResult.value.name).toBe(user.name);
        }
      }
    });

    it('should return error for non-existent user', async () => {
      const result = await getUserById('non-existent-id');
      
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('NOT_FOUND');
      }
    });
  });
}); 