/**
 * Standardized error handling utilities
 * Ensures consistent error handling patterns throughout the application
 *
 * Replaces scattered try-catch and .catch() implementations
 */

import { showToast } from "@/components/shared/common/show-toast";

export interface ErrorHandlerOptions {
  showToast?: boolean;
  toastMessage?: string;
  logError?: boolean;
  rethrow?: boolean;
}

/**
 * Default error messages mapped by error type
 */
const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  NETWORK: "Network error. Please check your connection.",
  VALIDATION: "Validation failed. Please check your input.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "Resource not found.",
  CONFLICT: "This resource already exists.",
  TIMEOUT: "Request timed out. Please try again.",
  SERVER: "Server error. Please try again later.",
  UNKNOWN: "An unexpected error occurred. Please try again.",
};

/**
 * Gets error message from various error types with optional fallback
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage?: string
): string {
  if (!error) return fallbackMessage || DEFAULT_ERROR_MESSAGES.UNKNOWN;

  if (typeof error === "string") {
    return error.trim() || fallbackMessage || DEFAULT_ERROR_MESSAGES.UNKNOWN;
  }

  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, any>;

    // 1. Check Axios response data
    if (errorObj.response?.data) {
      const data = errorObj.response.data;
      if (typeof data === "string" && data.trim()) return data.trim();
      if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
      if (typeof data.error === "string" && data.error.trim()) return data.error.trim();
      if (typeof data.error?.message === "string" && data.error.message.trim()) return data.error.message.trim();
    }

    // 2. Check Redux Toolkit thunk payload
    if (errorObj.payload) {
      const payload = errorObj.payload;
      if (typeof payload === "string" && payload.trim()) return payload.trim();
      if (typeof payload.message === "string" && payload.message.trim()) return payload.message.trim();
      if (typeof payload.error === "string" && payload.error.trim()) return payload.error.trim();
    }

    // 3. Check Standard Error / Exception message property
    if (typeof errorObj.message === "string" && errorObj.message.trim()) {
      return errorObj.message.trim();
    }

    // 4. Check nested data or details
    if (typeof errorObj.data === "string" && errorObj.data.trim()) return errorObj.data.trim();
    if (typeof errorObj.data?.message === "string" && errorObj.data.message.trim()) return errorObj.data.message.trim();
  }

  return fallbackMessage || DEFAULT_ERROR_MESSAGES.UNKNOWN;
}

/**
 * Determines error type from error code or status
 */
export function getErrorType(error: unknown): keyof typeof DEFAULT_ERROR_MESSAGES {
  if (!error || typeof error !== "object") {
    return "UNKNOWN";
  }

  const err = error as any;

  if (err.code === "NETWORK_ERROR" || err.code === "ENOTFOUND") {
    return "NETWORK";
  }
  if (err.status === 401) {
    return "UNAUTHORIZED";
  }
  if (err.status === 403) {
    return "FORBIDDEN";
  }
  if (err.status === 404) {
    return "NOT_FOUND";
  }
  if (err.status === 409) {
    return "CONFLICT";
  }
  if (err.status === 408 || err.code === "TIMEOUT") {
    return "TIMEOUT";
  }
  if (err.status === 500 || err.status >= 500) {
    return "SERVER";
  }

  return "UNKNOWN";
}

/**
 * Standardized error handler
 *
 * Usage:
 * try {
 *   await someAsyncOperation();
 * } catch (error) {
 *   handleError(error, { showToast: true, toastMessage: "Failed to save" });
 * }
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast: shouldShowToast = true,
    toastMessage,
    logError: shouldLogError = true,
    rethrow = false,
  } = options;

  const message = toastMessage || getErrorMessage(error);
  const errorType = getErrorType(error);

  if (shouldLogError) {
    console.error(`[${errorType}]`, error);
  }

  if (shouldShowToast) {
    showToast.error(message);
  }

  if (rethrow) {
    throw error;
  }
}

/**
 * Async error handler for async/await operations
 *
 * Usage:
 * const result = await asyncOperation().catch((error) =>
 *   asyncHandleError(error, { showToast: true })
 * );
 */
export async function asyncHandleError<T = void>(
  error: unknown,
  options: ErrorHandlerOptions = {}
): Promise<T | null> {
  handleError(error, { ...options, rethrow: false });
  return null as T | null;
}

/**
 * Safe async wrapper that catches and logs errors
 *
 * Usage:
 * await safeAsync(async () => {
 *   await someOperation();
 * }, { showToast: true });
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    await asyncHandleError(error, options);
    return null;
  }
}

/**
 * Safe sync wrapper
 *
 * Usage:
 * safeSync(() => {
 *   return someOperation();
 * }, { showToast: true });
 */
export function safeSync<T>(
  fn: () => T,
  options: ErrorHandlerOptions = {}
): T | null {
  try {
    return fn();
  } catch (error) {
    handleError(error, { ...options, rethrow: false });
    return null;
  }
}

/**
 * Create a standardized error response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  errorType: string;
  details?: unknown;
}

export function createErrorResponse(
  error: unknown,
  details?: unknown
): ErrorResponse {
  return {
    success: false,
    error: getErrorMessage(error),
    errorType: getErrorType(error),
    details,
  };
}
