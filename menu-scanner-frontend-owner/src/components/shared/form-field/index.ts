// components/shared/form-field/index.ts
export { SpacesImageUpload } from "./spaces-image-upload";
import { Control, FieldError, FieldValues, Path } from "react-hook-form";

/**
 * Shared form-field props. Generic over the form values type so the
 * RHF Controller accepts `control={form.control}` without falling back
 * to `Control<any>` (which is invariant in react-hook-form 7.54+).
 */
export interface BaseFieldProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label?: string;
  control: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

export interface TextFieldProps<T extends FieldValues = FieldValues>
  extends BaseFieldProps<T> {
  type?:
    | "text"
    | "email"
    | "tel"
    | "password"
    | "number"
    | "url"
    | "date"
    | "time"
    | "datetime-local"
    | "color";
  valueAsNumber?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
  allowZero?: boolean;
  pattern?: string;
  onCustomChange?: (value: string) => void;
  autoComplete?: string;
}

export interface PasswordFieldProps<T extends FieldValues = FieldValues>
  extends BaseFieldProps<T> {
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export interface SelectFieldProps<T extends FieldValues = FieldValues>
  extends BaseFieldProps<T> {
  options: Array<{ value: string | number; label: string }>;
  onValueChange?: (value: string | number) => void;
}

export interface TextareaFieldProps<T extends FieldValues = FieldValues>
  extends BaseFieldProps<T> {
  rows?: number;
}
