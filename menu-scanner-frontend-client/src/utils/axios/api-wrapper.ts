// utils/apiWrapper.ts
import { createAsyncThunk } from "@reduxjs/toolkit";

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

        // Custom error logging
        if (options?.logError !== false) {
          console.error(`Error in ${typePrefix}:`, error);
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
