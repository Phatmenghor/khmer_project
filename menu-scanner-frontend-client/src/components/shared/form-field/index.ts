// components/shared/form/index.ts
import { Control, FieldError, FieldValues, Path } from "react-hook-form";

export interface BaseFieldProps<T extends FieldValues = any> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface TextFieldProps<T extends FieldValues = any> extends BaseFieldProps<T> {
  type?: "text" | "email" | "tel" | "password";
  placeholder?: string;
}

export interface PasswordFieldProps<T extends FieldValues = any> extends BaseFieldProps<T> {
  placeholder?: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export interface SelectFieldProps<T extends FieldValues = any> extends BaseFieldProps<T> {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  loading?: boolean;
  loadingPlaceholder?: string;
}

export interface TextareaFieldProps<T extends FieldValues = any> extends BaseFieldProps<T> {
  placeholder?: string;
  rows?: number;
}
