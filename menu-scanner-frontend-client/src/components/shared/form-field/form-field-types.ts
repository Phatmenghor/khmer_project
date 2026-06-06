import { Control, FieldError, FieldValues, Path } from "react-hook-form";

/**
 * Base props for all form field components.
 * `name` is typed as Path<T> so react-hook-form's Controller accepts it
 * without widening to string.
 */
export interface BaseFormFieldProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

/**
 * Extended props for text-based form fields
 */
export interface TextFormFieldProps<T extends FieldValues = FieldValues> extends BaseFormFieldProps<T> {
  type?:
    | "text"
    | "email"
    | "tel"
    | "password"
    | "number"
    | "url"
    | "datetime-local"
    | "color";
  valueAsNumber?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
  allowZero?: boolean;
  pattern?: string;
  onCustomChange?: (value: string) => void;
}

/**
 * Extended props for textarea form fields
 */
export interface TextareaFormFieldProps<T extends FieldValues = FieldValues> extends BaseFormFieldProps<T> {
  rows?: number;
}

/**
 * Extended props for select/combobox form fields
 */
export interface SelectFormFieldProps<T extends FieldValues = FieldValues> extends BaseFormFieldProps<T> {
  options: Array<{ label: string; value: string | number }>;
  multiple?: boolean;
  searchable?: boolean;
  onValueChange?: (value: string | number | (string | number)[]) => void;
}

/**
 * Extended props for time picker form fields
 */
export interface TimePickerFormFieldProps<T extends FieldValues = FieldValues> extends BaseFormFieldProps<T> {
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * Extended props for date picker form fields
 */
export interface DatePickerFormFieldProps<T extends FieldValues = FieldValues> extends BaseFormFieldProps<T> {
  mode?: "date" | "datetime";
  minDate?: Date;
  maxDate?: Date;
}

/**
 * Extended props for password form fields
 */
export interface PasswordFormFieldProps<T extends FieldValues = FieldValues> extends BaseFormFieldProps<T> {
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

/**
 * Extended props for promotion value form fields
 */
export interface PromoValueFormFieldProps<T extends FieldValues = FieldValues> extends BaseFormFieldProps<T> {
  promotionType?: "FIXED_AMOUNT" | "PERCENTAGE";
}

/**
 * Extended props for multi-select days form fields
 */
export interface MultiSelectDaysFieldProps<T extends FieldValues = FieldValues> extends BaseFormFieldProps<T> {
  defaultDays?: string[];
}

/**
 * Extended props for page size select form fields
 */
export interface PageSizeSelectFieldProps {
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  className?: string;
  label?: string;
}
