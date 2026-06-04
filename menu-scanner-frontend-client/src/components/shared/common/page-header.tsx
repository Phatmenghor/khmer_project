import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;

  count?: number;

  countLabel?: string;

  actions?: React.ReactNode;
  className?: string;
}


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
        "flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2",
        "py-2 sm:py-3 mb-3 sm:mb-4 border-b",
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          {Icon && <Icon className="h-3 w-3 text-primary shrink-0" />}
          <h1 className="text-xs sm:text-base font-bold truncate">{title}</h1>
          {count !== undefined && count > 0 && (
            <span className="shrink-0 text-xs font-semibold bg-muted text-muted-foreground px-1 py-0.5 rounded-full">
              {count.toLocaleString()}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-xs text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="shrink-0 flex items-center gap-1">{actions}</div>}
    </div>
  );
}
