
/**
 * Default type assertion error of this library.
 */
export class TypeAssertionError extends Error {
}

/**
 * Creates a function to be used for type checks.
 *
 * Created function returns true on success and false on failure.
 * The function is also a custom type guard,
 * so when the function returns true, TS understands that the value is of the type T.
 */
export function createIs<T>(): (object: any) => object is T;

/**
 * Creates a function to be used for type assertions.
 *
 * Created function returns the object on success or constructs and throws a error on failure.
 */
export function createAssertType<T>(): (object: any, errorFactory?: (msg: string) => Error) => T;
