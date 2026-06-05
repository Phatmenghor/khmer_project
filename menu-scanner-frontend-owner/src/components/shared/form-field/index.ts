// components/shared/form-field/index.ts
import { Control, FieldError, FieldValues, Path } from "react-hook-form";

/**
 * Shared form-field props. Generic over the form values type so the
 * RHF Controller accepts `control={form.control}` without falling back
 * to `Control<any>` (which is invariant in react-hook-form 7.54+).
 */
export interface BaseFieldProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface TextFieldProps<T extends FieldValues = FieldValues>
  extends BaseFieldProps<T> {
  type?: "text" | "email" | "tel" | "password" | "url" | "number";
  placeholder?: string;
  pattern?: string;
}

export interface PasswordFieldProps<T extends FieldValues = FieldValues>
  extends BaseFieldProps<T> {
  placeholder?: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export interface SelectFieldProps<T extends FieldValues = FieldValues>
  extends BaseFieldProps<T> {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

export interface TextareaFieldProps<T extends FieldValues = FieldValues>
  extends BaseFieldProps<T> {
  placeholder?: string;
  rows?: number;
}
