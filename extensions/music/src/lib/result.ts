import { SafeParseReturnType, ZodError } from "zod";

import { runScript, tell } from "./apple-script";

type Lazy<T> = () => T;
type LazyPromise<T> = Lazy<Promise<T>>;

/**
 *
 * Result is a type that represents a value that can be either a success or a failure.
 */
export type ResultSucces<T> = {
  success: true;
  data: T;
};

/**
 *
 * ResultFailure is a type that represents a failure.
 */
export type ResultFailure<E> = {
  success: false;
  error: E;
};

/**
 *
 * Result is a type that represents a value that can be either a success or a failure.
 * It is inspired by the Result type in the Rust programming language.
 *
 * @see https://doc.rust-lang.org/std/result/enum.Result.html
 * @see https://doc.rust-lang.org/std/result/index.html
 */
export type Result<T, E> = ResultSucces<T> | ResultFailure<E>;

/**
 *
 * Result is a type that represents a value that can be either a success or a failure.
 * It is inspired by the Result type in the Rust programming language.
 *
 * @see https://doc.rust-lang.org/std/result/enum.Result.html
 * @see https://doc.rust-lang.org/std/result/index.html
 */
export const Result = {
  /**
   *
   * Creates a ResultSucces<T> from data.
   */
  success: <T>(data: T): Result<T, never> => ({ success: true, data }),

  /**
   *
   * Creates a ResultFailure<E> from an error.
   */
  failure: <E>(error: E): Result<never, E> => ({ success: false, error }),

  /**
   *
   * Guard to check if a Result is a ResultSucces.
   */
  isSucces: <T, E>(result: Result<T, E>): result is ResultSucces<T> => result.success,

  /**
   *
   * Guard to check if a Result is a ResultFailure.
   */
  isFailure: <T, E>(result: Result<T, E>): result is ResultFailure<E> => !result.success,

  /**
   *
   * Transforms a Result<T, E> to a Result<U, E> by applying a function to the data.
   *
   * @example
   * const result = Result.success(1);
   * const result2 = Result.map(result, (data) => data + 1);
   * // result2 = { success: true, data: 2 }
   */
  map: <T, E, U>(result: Result<T, E>, f: (data: T) => U): Result<U, E> =>
    Result.isSucces(result) ? Result.success(f(result.data)) : result,

  /**
   *
   * Transforms a Result<T, E> to a Result<T, F> by applying a function to the error.
   *
   * @example
   *
   * const errorCodes = { 400: 'bad-request', 500: 'internal-server-error' };
   *
   * const result = Result.failure(400);
   * const result2 = Result.mapError(result, (error) => error_codes[error]);
   * // result2 = { success: false, error: 'bad-request' }
   */
  mapError: <T, E, F>(result: Result<T, E>, f: (error: E) => F): Result<T, F> =>
    Result.isFailure(result) ? Result.failure(f(result.error)) : result,

  /**
   *
   * Alias for `fromPromise`
   */
  try: <T, E>(promise: LazyPromise<T>, onError: (error: unknown) => E): Promise<Result<T, E>> =>
    Result.fromPromise(promise, onError),

  /**
   *
   * Transforms a Promise<T> to a Promise<Result<T, E>> by applying a function to the error.
   * @example
   * const promise = Promise.reject(new Error('my-message'));
   * const result = await Result.fromPromise(promise, (error) => error.message);
   * // result = { success: false, error: 'my-message' }
   */
  fromPromise: <T, E>(promise: LazyPromise<T>, onError: (error: unknown) => E): Promise<Result<T, E>> =>
    promise()
      .then(Result.success)
      .catch((error) => Result.failure(onError(error))),

  /**
   *
   * Transforms a Result<T, E> to a Result<U, E> by applying a function to the data.
   */
  chain: <T, E, U>(result: Result<T, E>, f: (data: T) => Promise<Result<U, E>>): Promise<Result<U, E>> =>
    Result.isSucces(result) ? f(result.data) : Promise.resolve(result),

  chainSchema: <T, E, U>(
    result: Result<T, E>,
    f: (data: T) => SafeParseReturnType<T, U>
  ): Result<U, E | ZodError<U>> => {
    const isSuccess = Result.isSucces(result);

    if (!isSuccess) return result;
    const parsed = f(result.data);

    if (!parsed.success) {
      return Result.failure(parsed.error) as Result<U, ZodError<U>>;
    }

    return Result.success(parsed.data);
  },

  promisify:
    <T, E>(promise: LazyPromise<Result<T, E>>) =>
      async (): Promise<T> => {
        const result = await promise();

        if (Result.isSucces(result)) {
          return Promise.resolve(result.data);
        } else {
          return Promise.reject(result.error);
        }
      },

  /**
   *
   * Same as `chain` but less strict.
   * This allows to return a different error type.
   */
  chainW: <T, E, U, W>(result: Result<T, E>, f: (data: T) => Result<U, W>): Result<U, E | W> =>
    Result.isSucces(result) ? f(result.data) : Result.failure(result.error),

  tap: <T, E>(result: Result<T, E>, f: (data: T) => void): Result<T, E> =>
    Result.isSucces(result) ? (f(result.data), result) : result,

  tapError: <T, E>(result: Result<T, E>, f: (error: E) => void): Result<T, E> =>
    Result.isFailure(result) ? (f(result.error), result) : result,

  runScript: runScript,
  tell: (script: string) => tell("Music", script),

  asError: (error: unknown) => error as Error,
};

export default Result;
