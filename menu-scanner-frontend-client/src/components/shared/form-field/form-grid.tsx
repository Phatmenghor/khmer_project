


"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FormGridProps {
  children: ReactNode;

  columns?: 1 | 2;

  gap?: "sm" | "md" | "lg";

  className?: string;
}

const gapClasses = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};


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

  title?: string;

  description?: string;

  children: ReactNode;

  className?: string;

  divider?: boolean;
}


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

  children: ReactNode;

  className?: string;
}


export function FormRow({ children, className }: FormRowProps) {
  return <div className={cn("md:col-span-2", className)}>{children}</div>;
}


export function FormDivider({ className }: { className?: string }) {
  return <div className={cn("col-span-full border-t my-4", className)} />;
}
