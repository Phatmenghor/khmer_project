// utils/common/get-field-error.ts
import { FieldError } from "react-hook-form";

/**
 * Extract error message from react-hook-form FieldError
 * @param error - The field error from react-hook-form
 * @returns The error message string or undefined
 */
export const getFieldError = (
  error: FieldError | undefined
): string | undefined => {
  return error?.message;
};

export const getArrayFieldError = (error: any): FieldError | undefined => {
  if (!error) return undefined;
  if (Array.isArray(error)) return error[0];
  return error;
};
