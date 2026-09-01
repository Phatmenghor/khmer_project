/**
 * Centralized utility to extract clean, human-readable error messages
 * from any Axios error response, Redux thunk payload, Error instance, or raw string.
 */
export function getErrorMessage(
  err: unknown,
  fallbackMessage: string = "An error occurred. Please try again."
): string {
  if (!err) return fallbackMessage;

  if (typeof err === "string") {
    return err.trim() || fallbackMessage;
  }

  if (typeof err === "object" && err !== null) {
    const errorObj = err as Record<string, any>;

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

  return fallbackMessage;
}
