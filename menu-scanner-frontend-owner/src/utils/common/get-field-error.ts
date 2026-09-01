
import { FieldError } from "react-hook-form";


export const getFieldError = (
  error: any
): string | undefined => {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  if (error.message && typeof error.message === "string") return error.message;
  if (Array.isArray(error)) return getFieldError(error[0]);
  return undefined;
};

export const getArrayFieldError = (error: unknown): FieldError | undefined => {
  if (!error) return undefined;
  if (Array.isArray(error)) return error[0];
  return error as FieldError;
};
