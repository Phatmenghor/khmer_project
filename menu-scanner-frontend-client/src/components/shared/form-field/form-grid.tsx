/**
 * Form Grid Layout Components
 * Provides flexible 1-column and 2-column layouts for forms
 */

"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FormGridProps {
  children: ReactNode;
  /** Number of columns (1 or 2) */
  columns?: 1 | 2;
  /** Gap between items */
  gap?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

const gapClasses = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

/**
 * FormGrid - Responsive grid container for form fields
 *
 * Usage:
 * ```tsx
 * <FormGrid columns={2} gap="md">
 *   <TextField name="firstName" label="First Name" />
 *   <TextField name="lastName" label="Last Name" />
 * </FormGrid>
 * ```
 */
export function FormGrid({
  children,
  columns = 1,
  gap = "md",
  className,
}: FormGridProps) {
  return (
    <div
      className={cn(
        "grid",
        columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1",
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

export interface FormSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Section content */
  children: ReactNode;
  /** Additional className */
  className?: string;
  /** Show top border/divider */
  divider?: boolean;
}

/**
 * FormSection - Organizes form into logical sections with optional title
 *
 * Usage:
 * ```tsx
 * <FormSection title="Personal Information" description="Basic details">
 *   <FormGrid columns={2}>
 *     <TextField name="name" label="Name" />
 *     <TextField name="email" label="Email" />
 *   </FormGrid>
 * </FormSection>
 * ```
 */
export function FormSection({
  title,
  description,
  children,
  className,
  divider = false,
}: FormSectionProps) {
  return (
    <div className={cn(divider && "border-t pt-6", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-sm font-semibold text-foreground mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export interface FormRowProps {
  /** Row content */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * FormRow - Single row that spans full width (useful in grids)
 *
 * Usage:
 * ```tsx
 * <FormGrid columns={2}>
 *   <TextField name="firstName" />
 *   <TextField name="lastName" />
 *   <FormRow>
 *     <TextareaField name="bio" label="Bio" />
 *   </FormRow>
 * </FormGrid>
 * ```
 */
export function FormRow({ children, className }: FormRowProps) {
  return <div className={cn("md:col-span-2", className)}>{children}</div>;
}

/**
 * FormDivider - Visual separator between form sections
 */
export function FormDivider({ className }: { className?: string }) {
  return <div className={cn("col-span-full border-t my-4", className)} />;
}
