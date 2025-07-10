import { eq } from 'drizzle-orm';
import { Result, success, failure } from '../utils/result';
import { AppErrors, type AppError } from '../utils/errors';
import { db, users } from '../db';
import type { UserWithoutPassword, PaginatedResult, PaginationParams } from '../db/models';

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
    
    const user = userResult[0]!;
    
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
 * Get all users with pagination
 * Pure function that takes database and pagination parameters
 */
export const getUsers = async (
  pagination: PaginationParams = {}
): Promise<Result<PaginatedResult<UserWithoutPassword>, AppError>> => {
  try {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 10, 100); // Max 100 per page
    const offset = (page - 1) * limit;
    
    // Get total count
    const totalResult = await db.select({ count: users.id }).from(users);
    const total = totalResult.length;
    
    // Get users for current page
    const usersResult = await db.select().from(users).limit(limit).offset(offset);
    
    const usersWithoutPassword: UserWithoutPassword[] = usersResult.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    
    const result: PaginatedResult<UserWithoutPassword> = {
      data: usersWithoutPassword,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    
    return success(result);
  } catch (error) {
    return failure(AppErrors.internal('Failed to get users'));
  }
};

/**
 * Update user
 * Pure function that takes database and update data as parameters
 */
export const updateUser = async (
  userId: string,
  updateData: Partial<Pick<UserWithoutPassword, 'name' | 'email'>>
): Promise<Result<UserWithoutPassword, AppError>> => {
  try {
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (existingUser.length === 0) {
      return failure(AppErrors.notFound('User'));
    }
    
    // Update user
    const updatedUsers = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (updatedUsers.length === 0) {
      return failure(AppErrors.internal('Failed to update user'));
    }
    
    const updatedUser = updatedUsers[0]!;
    
    const userWithoutPassword: UserWithoutPassword = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
    
    return success(userWithoutPassword);
  } catch (error) {
    return failure(AppErrors.internal('Failed to update user'));
  }
};

/**
 * Delete user
 * Pure function that takes database as parameter
 */
export const deleteUser = async (
  userId: string
): Promise<Result<void, AppError>> => {
  try {
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (existingUser.length === 0) {
      return failure(AppErrors.notFound('User'));
    }
    
    // Delete user
    await db.delete(users).where(eq(users.id, userId));
    
    return success(undefined);
  } catch (error) {
    return failure(AppErrors.internal('Failed to delete user'));
  }
}; 