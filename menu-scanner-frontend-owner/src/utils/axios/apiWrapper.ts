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

        return rejectWithValue({
          message: errorMessage,
          status: error.response?.status,
          data: error.response?.data,
        });
      }
    }
  );
};
