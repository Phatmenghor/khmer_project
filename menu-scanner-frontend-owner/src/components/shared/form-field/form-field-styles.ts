import { cn } from "@/lib/utils";

/**
 * Standard Design System Form Field Tokens & Styles
 * Centralized for global scalability across all form inputs, select dropdowns, date pickers, and comboboxes.
 */
export const FORM_FIELD_SIZES = {
  sm: "h-8 text-xs rounded-[10px]",
  md: "h-[36px] text-xs rounded-[12px]",
  lg: "h-10 text-sm rounded-[14px]",
} as const;

export type FormFieldSize = keyof typeof FORM_FIELD_SIZES;

export const FORM_FIELD_LABEL_CLASS = "text-xs font-semibold text-foreground whitespace-nowrap block mb-1";

export const FORM_FIELD_INPUT_BASE = cn(
  "w-full bg-background border border-border/80 shadow-2xs transition-all duration-200",
  "hover:border-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

export const FORM_FIELD_CONTAINER_CLASS = "flex flex-col gap-1 w-full";
