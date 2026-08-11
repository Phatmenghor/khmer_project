"use client";

import React from "react";

interface SectionHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PortfolioSectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0 p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface EmptySectionStateProps {
  message: string;
  hint?: string;
}

export function PortfolioEmptyState({ message, hint }: EmptySectionStateProps) {
  return (
    <div className="text-center py-6 border-2 border-dashed border-border/80 rounded-xl bg-muted/20">
      <p className="text-xs font-semibold text-muted-foreground">{message}</p>
      {hint && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{hint}</p>}
    </div>
  );
}
