
import { FieldError } from "react-hook-form";


export const getFieldError = (
  error: FieldError | undefined
): string | undefined => {
  return error?.message;
};

export const getArrayFieldError = (error: unknown): FieldError | undefined => {
  if (!error) return undefined;
  if (Array.isArray(error)) return error[0];
  return error as FieldError;
};
