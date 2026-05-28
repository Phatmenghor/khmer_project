// utils/apiWrapper.ts
import { createAsyncThunk } from "@reduxjs/toolkit";

export const createApiThunk = <ReturnType, ArgType = void>(
  typePrefix: string,
  apiCall: (arg: ArgType) => Promise<ReturnType>,
  options?: {
    transformResponse?: (data: any) => ReturnType;
    logError?: boolean;
  }
) => {
  return createAsyncThunk<ReturnType, ArgType>(
    typePrefix,
    async (arg, { rejectWithValue }) => {
      try {
        const response = await apiCall(arg);
        return options?.transformResponse
          ? options.transformResponse(response)
          : response;
      } catch (error: any) {
        // Custom error logging
        if (options?.logError !== false) {
          console.error(`Error in ${typePrefix}:`, error);
        }

        // Standardized error handling
        let errorMessage = "An unexpected error occurred";
        let status = error.response?.status;

        // Try to extract error message from various response formats
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Provide more helpful messages for specific HTTP status codes
        if (status === 500 && !errorMessage?.includes("unexpected")) {
          // Keep the server's error message for 500 errors
          errorMessage = error.response?.data?.message || "Server error. Please try again later.";
        } else if (status === 400) {
          // Keep validation error message for 400
          errorMessage = error.response?.data?.message || "Invalid request. Please check your input.";
        } else if (status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (status === 404) {
          errorMessage = "Resource not found.";
        }

        return rejectWithValue({
          message: errorMessage,
          status: status,
          data: error.response?.data,
        });
      }
    }
  );
};
