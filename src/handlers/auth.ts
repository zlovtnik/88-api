import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Result, success, failure } from '../utils/result';
import { AppErrors, type AppError } from '../utils/errors';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken, verifyToken, type JWTConfig } from '../utils/jwt';
import { db, users, refreshTokens } from '../db';
import type { 
  CreateUserRequest, 
  LoginRequest, 
  LoginResponse, 
  UserWithoutPassword,
  NewUser 
} from '../db/models';

/**
 * Validation schemas
 */
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Create a new user
 * Pure function that takes all dependencies as parameters
 */
export const createUser = async (
  userData: CreateUserRequest,
  hashPasswordFn: (password: string) => Promise<Result<string, Error>>,
  generateTokenFn: (payload: { userId: string; email: string }, config: JWTConfig) => Result<string, Error>,
  jwtConfig: JWTConfig
): Promise<Result<UserWithoutPassword, AppError>> => {
  try {
    // Validate input
    const validatedData = createUserSchema.parse(userData);
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, validatedData.email)).limit(1);
    if (existingUser.length > 0) {
      return failure(AppErrors.conflict('User with this email already exists'));
    }
    
    // Hash password
    const hashedPasswordResult = await hashPasswordFn(validatedData.password);
    if (hashedPasswordResult.isFailure()) {
      return failure(AppErrors.internal('Password hashing failed'));
    }
    
    // Create user
    const newUser: NewUser = {
      email: validatedData.email,
      password: hashedPasswordResult.value,
      name: validatedData.name,
    };
    
    const createdUsers = await db.insert(users).values(newUser).returning();
    
    if (createdUsers.length === 0) {
      return failure(AppErrors.internal('Failed to create user'));
    }
    
    const createdUser = createdUsers[0];
    
    // Return user without password
    const userWithoutPassword: UserWithoutPassword = {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };
    
    return success(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return failure(AppErrors.validationError('Invalid input data', { errors: error.errors }));
    }
    return failure(AppErrors.internal('User creation failed'));
  }
};

/**
 * Authenticate user and generate tokens
 * Pure function that takes all dependencies as parameters
 */
export const authenticateUser = async (
  loginData: LoginRequest,
  verifyPasswordFn: (password: string, hash: string) => Promise<Result<boolean, Error>>,
  generateTokenFn: (payload: { userId: string; email: string }, config: JWTConfig) => Result<string, Error>,
  jwtConfig: JWTConfig
): Promise<Result<LoginResponse, AppError>> => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(loginData);
    
    // Find user by email
    const userResult = await db.select().from(users).where(eq(users.email, validatedData.email)).limit(1);
    if (userResult.length === 0) {
      return failure(AppErrors.invalidCredentials());
    }
    
    const user = userResult[0]!;
    
    // Verify password
    const passwordValidResult = await verifyPasswordFn(validatedData.password, user.password);
    if (passwordValidResult.isFailure()) {
      return failure(AppErrors.internal('Password verification failed'));
    }
    
    if (!passwordValidResult.value) {
      return failure(AppErrors.invalidCredentials());
    }
    
    // Generate JWT token
    const tokenResult = generateTokenFn(
      { userId: user.id, email: user.email },
      jwtConfig
    );
    
    if (tokenResult.isFailure()) {
      return failure(AppErrors.internal('Token generation failed'));
    }
    
    // Generate refresh token
    const refreshToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await db.insert(refreshTokens).values({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });
    
    // Return user without password
    const userWithoutPassword: UserWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    const response: LoginResponse = {
      user: userWithoutPassword,
      token: tokenResult.value,
      refreshToken,
    };
    
    return success(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return failure(AppErrors.validationError('Invalid input data', { errors: error.errors }));
    }
    return failure(AppErrors.internal('Authentication failed'));
  }
};

/**
 * Get user by ID
 * Pure function that takes database as parameter
 */
export const getUserById = async (
  userId: string
): Promise<Result<UserWithoutPassword, AppError>> => {
  try {
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (userResult.length === 0) {
      return failure(AppErrors.notFound('User'));
    }
    
    const user = userResult[0];
    
    const userWithoutPassword: UserWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    return success(userWithoutPassword);
  } catch (error) {
    return failure(AppErrors.internal('Failed to get user'));
  }
};

/**
 * Refresh access token
 * Pure function that takes all dependencies as parameters
 */
export const refreshAccessToken = async (
  refreshToken: string,
  generateTokenFn: (payload: { userId: string; email: string }, config: JWTConfig) => Result<string, Error>,
  jwtConfig: JWTConfig
): Promise<Result<string, AppError>> => {
  try {
    // Find refresh token
    const tokenResult = await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken)).limit(1);
    
    if (tokenResult.length === 0) {
      return failure(AppErrors.invalidToken());
    }
    
    const tokenRecord = tokenResult[0];
    
    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      // Delete expired token
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
      return failure(AppErrors.invalidToken());
    }
    
    // Get user
    const userResult = await db.select().from(users).where(eq(users.id, tokenRecord.userId)).limit(1);
    
    if (userResult.length === 0) {
      return failure(AppErrors.notFound('User'));
    }
    
    const user = userResult[0];
    
    // Generate new access token
    const tokenResult2 = generateTokenFn(
      { userId: user.id, email: user.email },
      jwtConfig
    );
    
    if (tokenResult2.isFailure()) {
      return failure(AppErrors.internal('Token generation failed'));
    }
    
    return success(tokenResult2.value);
  } catch (error) {
    return failure(AppErrors.internal('Token refresh failed'));
  }
}; 