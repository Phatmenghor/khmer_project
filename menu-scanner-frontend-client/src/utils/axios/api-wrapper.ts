
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

        if (signal.aborted) {
          return rejectWithValue({ aborted: true, message: "Request superseded" });
        }

        return options?.transformResponse
          ? options.transformResponse(response)
          : response;
      } catch (error: unknown) {

        if (signal.aborted) {
          return rejectWithValue({ aborted: true, message: "Request superseded" });
        }

        if (options?.logError !== false) {
        }

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
