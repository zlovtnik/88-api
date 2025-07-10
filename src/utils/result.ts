/**
 * Result type for explicit error handling
 * Inspired by functional programming patterns
 */
export type Result<T, E> = Success<T, E> | Failure<T, E>;

export class Success<T, E> {
  readonly _tag = 'Success' as const;
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isSuccess(): this is Success<T, E> {
    return true;
  }

  isFailure(): this is Failure<T, E> {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return success(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  match<U>(
    onSuccess: (value: T) => U,
    onFailure: (error: E) => U
  ): U {
    return onSuccess(this.value);
  }
}

export class Failure<T, E> {
  readonly _tag = 'Failure' as const;
  readonly error: E;

  constructor(error: E) {
    this.error = error;
  }

  isSuccess(): this is Success<T, E> {
    return false;
  }

  isFailure(): this is Failure<T, E> {
    return true;
  }

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return failure(this.error);
  }

  flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return failure(this.error);
  }

  match<U>(
    _onSuccess: (value: T) => U,
    onFailure: (error: E) => U
  ): U {
    return onFailure(this.error);
  }
}

export const success = <T, E>(value: T): Result<T, E> => new Success(value);
export const failure = <T, E>(error: E): Result<T, E> => new Failure(error);

/**
 * Utility functions for working with Results
 */
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T, E> =>
  result.isSuccess();

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<T, E> =>
  result.isFailure();

export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.isSuccess()) {
    return result.value;
  }
  throw new Error(`Attempted to unwrap a Failure: ${JSON.stringify(result.error)}`);
};

export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  return result.isSuccess() ? result.value : defaultValue;
};

export const unwrapError = <T, E>(result: Result<T, E>): E => {
  if (result.isFailure()) {
    return result.error;
  }
  throw new Error(`Attempted to unwrap error from a Success: ${JSON.stringify(result.value)}`);
}; 