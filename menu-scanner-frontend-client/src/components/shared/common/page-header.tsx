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
        "py-2 sm:py-3 mb-4 sm:mb-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-5 sm:h-6 rounded-full bg-primary inline-block shrink-0" />
          {Icon && <Icon className="h-5 w-5 text-primary shrink-0" />}
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground truncate">
            {title}
          </h1>
          {count !== undefined && count > 0 && !subtitle && (
            <span className="shrink-0 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
              {count.toLocaleString()}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 pl-4 font-normal truncate">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}
