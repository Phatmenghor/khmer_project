"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardPeriod } from "@/features/dashboard/store/models/response/dashboard-response";

const PERIOD_OPTIONS: { label: string; value: DashboardPeriod }[] = [
  { label: "Today", value: "TODAY" },
  { label: "7 Days", value: "7D" },
  { label: "30 Days", value: "30D" },
  { label: "90 Days", value: "90D" },
];

interface DashboardHeaderProps {
  today: string;
  period: DashboardPeriod;
  isLive: boolean;
  onPeriodChange: (p: DashboardPeriod) => void;
  onRefresh: () => void;
}

export function DashboardHeader({ today, period, isLive, onPeriodChange, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Dashboard</h1>
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
        <p className="text-sm text-muted-foreground mt-1">{today}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex bg-muted rounded-md p-1 gap-0.5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPeriodChange(opt.value)}
              className={cn(
                "px-3 py-1 rounded text-xs font-medium transition-all duration-150",
                period === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={onRefresh}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
