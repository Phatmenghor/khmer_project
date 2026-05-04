// utils/apiWrapper.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import devLogger from "@/utils/debug/dev-logger";

export const createApiThunk = <ReturnType, ArgType = void>(
  typePrefix: string,
  apiCall: (arg: ArgType, signal: AbortSignal) => Promise<ReturnType>,
  options?: {
    transformResponse?: (data: any) => ReturnType;
    logError?: boolean;
  }
) => {
  return createAsyncThunk<ReturnType, ArgType>(
    typePrefix,
    async (arg, { rejectWithValue, signal }) => {
      try {
        const response = await apiCall(arg, signal);

        // If thunk was aborted while waiting for API, reject to prevent stale data
        if (signal.aborted) {
          return rejectWithValue({ aborted: true, message: "Request superseded" });
        }

        return options?.transformResponse
          ? options.transformResponse(response)
          : response;
      } catch (error: any) {
        // If aborted, reject silently
        if (signal.aborted) {
          return rejectWithValue({ aborted: true, message: "Request superseded" });
        }

        // Custom error logging (dev-only)
        if (options?.logError !== false) {
          devLogger.error(`Error in ${typePrefix}`, error);
        }

        // Standardized error handling
        if (error?.response?.data?.message) {
          return rejectWithValue(error.response.data.message);
        }

        if (error instanceof Error) {
          return rejectWithValue(error.message);
        }

        if (typeof error === "string") {
          return rejectWithValue(error);
        }

        return rejectWithValue(error?.message || "An unexpected error occurred");
      }
    }
  );
};

/**
 * REQUEST DEDUPLICATION PATTERN
 *
 * To prevent duplicate API requests, use conditional logic in components:
 *
 * Example:
 * ```tsx
 * useEffect(() => {
 *   // Check if data already exists in Redux state
 *   if (!userProfile && !isLoadingProfile) {
 *     dispatch(getProfileService());
 *   }
 * }, [dispatch, userProfile, isLoadingProfile]);
 * ```
 *
 * Or use Redux thunk argument to skip fetch:
 * ```tsx
 * export const getProfileThunk = createApiThunk(
 *   "auth/profile",
 *   async (_, { getState }) => {
 *     const state = getState() as RootState;
 *     if (state.auth.profile) {
 *       return state.auth.profile; // Skip API call if data exists
 *     }
 *     return fetchProfile();
 *   }
 * );
 * ```
 *
 * The cache-manager utility provides TTL-based deduplication.
 * See: src/utils/cache/cache-manager.ts
 */
