


"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {

  icon?: LucideIcon;

  title: string;

  description?: string;

  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };

  secondaryAction?: {
    label: string;
    onClick: () => void;
  };

  customIcon?: React.ReactNode;

  className?: string;

  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: {
    container: "py-5",
    icon: "h-8 w-8",
    title: "text-xs",
    description: "text-xs",
  },
  md: {
    container: "py-8",
    icon: "h-11 w-11",
    title: "text-xs",
    description: "text-xs",
  },
  lg: {
    container: "py-11",
    icon: "h-14 w-14",
    title: "text-base",
    description: "text-xs",
  },
};


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
        "flex flex-col items-center justify-center text-center animate-fade-in-up",
        styles.container,
        className
      )}
    >
      {}
      {customIcon || (Icon && (
        <div className="mb-3 text-muted-foreground/50 animate-scale-in">
          <Icon className={styles.icon} strokeWidth={1.5} />
        </div>
      ))}

      {}
      <h3 className={cn("font-semibold text-foreground mb-1.5", styles.title)}>
        {title}
      </h3>

      {}
      {description && (
        <p className={cn("text-muted-foreground max-w-md mb-4", styles.description)}>
          {description}
        </p>
      )}

      {}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2">
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
