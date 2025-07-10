import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, items, refreshTokens } from './schema';

/**
 * User model types
 */
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export interface UserWithoutPassword {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateUserRequest {
  readonly email: string;
  readonly password: string;
  readonly name: string;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly user: UserWithoutPassword;
  readonly token: string;
  readonly refreshToken: string;
}

/**
 * Item model types
 */
export type Item = InferSelectModel<typeof items>;
export type NewItem = InferInsertModel<typeof items>;

export interface CreateItemRequest {
  readonly name: string;
  readonly description?: string;
  readonly price: number;
}

export interface UpdateItemRequest {
  readonly name?: string;
  readonly description?: string;
  readonly price?: number;
}

/**
 * Refresh token model types
 */
export type RefreshToken = InferSelectModel<typeof refreshTokens>;
export type NewRefreshToken = InferInsertModel<typeof refreshTokens>;

/**
 * Database query result types
 */
export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
}

/**
 * Utility type for removing sensitive fields
 */
export type WithoutPassword<T> = Omit<T, 'password'>;
export type WithoutTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt'>; 