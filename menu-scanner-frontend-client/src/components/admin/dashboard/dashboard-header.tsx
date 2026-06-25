"use client";

import { RefreshCw } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  today: string;
  isLive: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({ today, isLive, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold tracking-tight text-foreground">Dashboard</h1>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
              isLive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-muted text-muted-foreground border-border"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                isLive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
              )}
            />
            {isLive ? "Live" : "Connecting..."}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <CustomButton variant="outline" size="sm" className="gap-1.5 h-8" onClick={onRefresh}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </CustomButton>
      </div>
    </div>
  );
}
