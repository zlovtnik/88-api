import bcrypt from 'bcryptjs';
import { Result, success, failure } from './result';

/**
 * Hash password with bcrypt
 * Pure function that takes salt rounds as parameter
 */
export const hashPassword = async (
  password: string,
  saltRounds: number = 12
): Promise<Result<string, Error>> => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return success(hashedPassword);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error('Password hashing failed'));
  }
};

/**
 * Verify password against hash
 * Pure function for password verification
 */
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<Result<boolean, Error>> => {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return success(isValid);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error('Password verification failed'));
  }
};

/**
 * Generate random password
 * Pure function for generating secure passwords
 */
export const generateRandomPassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

/**
 * Validate password strength
 * Pure function for password validation
 */
export interface PasswordValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}; 