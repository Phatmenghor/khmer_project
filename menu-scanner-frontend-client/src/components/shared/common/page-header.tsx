import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Numeric count shown as a pill next to the title */
  count?: number;
  /** Label after count, e.g. "items", "products" */
  countLabel?: string;
  /** Optional content rendered on the right side (buttons, etc.) */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Sticky page-level header used consistently across all public pages.
 * Sticks below the Navbar (top-16) with a frosted backdrop.
 */
export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  count,
  countLabel = "items",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3",
        "py-3 sm:py-4 mb-4 sm:mb-6 border-b",
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary shrink-0" />}
          <h1 className="text-xl sm:text-2xl font-bold truncate">{title}</h1>
          {count !== undefined && count > 0 && (
            <span className="shrink-0 text-xs font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {count.toLocaleString()}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}
