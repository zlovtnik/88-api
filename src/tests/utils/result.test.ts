import { describe, it, expect } from 'bun:test';
import { 
  success, 
  failure, 
  isSuccess, 
  isFailure, 
  unwrap, 
  unwrapOr,
  unwrapError 
} from '../../utils/result';

describe('Result Type', () => {
  describe('Success', () => {
    it('should create a success result', () => {
      const result = success('test value');
      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      if (result.isSuccess()) {
        expect(result.value).toBe('test value');
      }
    });

    it('should map success value', () => {
      const result = success('hello');
      const mapped = result.map(str => str.toUpperCase());
      expect(mapped.isSuccess()).toBe(true);
      if (mapped.isSuccess()) {
        expect(mapped.value).toBe('HELLO');
      }
    });

    it('should flatMap success value', () => {
      const result = success('hello');
      const flatMapped = result.flatMap(str => success(str.length));
      expect(flatMapped.isSuccess()).toBe(true);
      if (flatMapped.isSuccess()) {
        expect(flatMapped.value).toBe(5);
      }
    });

    it('should match success case', () => {
      const result = success('test');
      const matched = result.match(
        value => `Success: ${value}`,
        error => `Error: ${error}`
      );
      expect(matched).toBe('Success: test');
    });
  });

  describe('Failure', () => {
    it('should create a failure result', () => {
      const result = failure('test error');
      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBe('test error');
      }
    });

    it('should not map failure value', () => {
      const result = failure('error');
      const mapped = result.map((str: string) => str.toUpperCase());
      expect(mapped.isFailure()).toBe(true);
      if (mapped.isFailure()) {
        expect(mapped.error).toBe('error');
      }
    });

    it('should not flatMap failure value', () => {
      const result = failure('error');
      const flatMapped = result.flatMap((str: string) => success(str.length));
      expect(flatMapped.isFailure()).toBe(true);
      if (flatMapped.isFailure()) {
        expect(flatMapped.error).toBe('error');
      }
    });

    it('should match failure case', () => {
      const result = failure('test error');
      const matched = result.match(
        value => `Success: ${value}`,
        error => `Error: ${error}`
      );
      expect(matched).toBe('Error: test error');
    });
  });

  describe('Utility Functions', () => {
    it('should check if result is success', () => {
      const successResult = success('value');
      const failureResult = failure('error');
      
      expect(isSuccess(successResult)).toBe(true);
      expect(isSuccess(failureResult)).toBe(false);
    });

    it('should check if result is failure', () => {
      const successResult = success('value');
      const failureResult = failure('error');
      
      expect(isFailure(successResult)).toBe(false);
      expect(isFailure(failureResult)).toBe(true);
    });

    it('should unwrap success value', () => {
      const result = success('test');
      expect(unwrap(result)).toBe('test');
    });

    it('should throw when unwrapping failure', () => {
      const result = failure('error');
      expect(() => unwrap(result)).toThrow();
    });

    it('should unwrap or return default', () => {
      const successResult = success('value');
      const failureResult = failure('error');
      
      expect(unwrapOr(successResult, 'default')).toBe('value');
      expect(unwrapOr(failureResult, 'default')).toBe('default');
    });

    it('should unwrap error from failure', () => {
      const result = failure('test error');
      expect(unwrapError(result)).toBe('test error');
    });

    it('should throw when unwrapping error from success', () => {
      const result = success('value');
      expect(() => unwrapError(result)).toThrow();
    });
  });
}); 