import { createAsyncThunk } from "@reduxjs/toolkit";

interface AbortedRejection {
  aborted: true;
  message: string;
}

export type ApiThunkRejectValue = string | AbortedRejection;

interface AxiosLikeError {
  response?: { data?: { message?: string } };
  message?: string;
}

export const createApiThunk = <ReturnType, ArgType = void>(
  typePrefix: string,
  apiCall: (arg: ArgType, signal: AbortSignal) => Promise<ReturnType>,
  options?: {
    transformResponse?: (data: ReturnType) => ReturnType;
    logError?: boolean;
  }
) => {
  return createAsyncThunk<
    ReturnType,
    ArgType,
    { rejectValue: ApiThunkRejectValue }
  >(typePrefix, async (arg, { rejectWithValue, signal }) => {
    try {
      const response = await apiCall(arg, signal);

      if (signal.aborted) {
        return rejectWithValue({
          aborted: true,
          message: "Request superseded",
        });
      }

      return options?.transformResponse
        ? options.transformResponse(response)
        : response;
    } catch (error: unknown) {
      if (signal.aborted) {
        return rejectWithValue({
          aborted: true,
          message: "Request superseded",
        });
      }

      const axiosError = error as AxiosLikeError;

      if (axiosError?.response?.data?.message) {
        return rejectWithValue(axiosError.response.data.message);
      }

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      if (typeof error === "string") {
        return rejectWithValue(error);
      }

      return rejectWithValue(
        axiosError?.message ?? "An unexpected error occurred"
      );
    }
  });
};
