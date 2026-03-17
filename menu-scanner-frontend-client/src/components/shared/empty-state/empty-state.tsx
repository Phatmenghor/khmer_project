/**
 * Empty State Component
 * Reusable component for displaying empty states across the application
 */

"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Custom icon/image element */
  customIcon?: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: {
    container: "py-8",
    icon: "h-12 w-12",
    title: "text-lg",
    description: "text-sm",
  },
  md: {
    container: "py-12",
    icon: "h-16 w-16",
    title: "text-xl",
    description: "text-base",
  },
  lg: {
    container: "py-16",
    icon: "h-20 w-20",
    title: "text-2xl",
    description: "text-lg",
  },
};

/**
 * Empty State Component
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={PackageOpen}
 *   title="No products found"
 *   description="Try adjusting your filters or search terms"
 *   action={{
 *     label: "Clear Filters",
 *     onClick: handleClearFilters
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  customIcon,
  className,
  size = "md",
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        styles.container,
        className
      )}
    >
      {/* Icon */}
      {customIcon || (Icon && (
        <div className="mb-4 text-muted-foreground/50">
          <Icon className={styles.icon} strokeWidth={1.5} />
        </div>
      ))}

      {/* Title */}
      <h3 className={cn("font-semibold text-foreground mb-2", styles.title)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn("text-muted-foreground max-w-md mb-6", styles.description)}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
