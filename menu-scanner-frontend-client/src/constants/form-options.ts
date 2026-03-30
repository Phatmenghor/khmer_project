// Shared form field options used across the application
import { SelectOption } from "@/components/shared/common/custom-select";

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
];

// Promotion and Discount Options
export const PROMOTION_TYPES: SelectOption[] = [
  { value: "FIXED_AMOUNT", label: "Fixed Amount ($)" },
  { value: "PERCENTAGE", label: "Percentage (%)" },
];

// Default values and constants
export const PROMOTION_DEFAULT_DURATION_DAYS = 7;
export const PAGINATION_ITEMS_THRESHOLD = 7;
export const DATE_RANGE_CALENDAR_DAYS = 35;
export const YEAR_RANGE_OFFSET = 50;
