"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OwnerDashboardPeriod } from "@/redux/features/owner-dashboard/store/models/response/owner-dashboard-response";

const PERIOD_OPTIONS: { label: string; value: OwnerDashboardPeriod }[] = [
  { label: "Today", value: "TODAY" },
  { label: "7 Days", value: "7D" },
  { label: "30 Days", value: "30D" },
  { label: "90 Days", value: "90D" },
];

interface DashboardHeaderProps {
  today: string;
  period: OwnerDashboardPeriod;
  onPeriodChange: (p: OwnerDashboardPeriod) => void;
  onRefresh: () => void;
}

export function DashboardHeader({
  today,
  period,
  onPeriodChange,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Platform Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex bg-muted rounded-lg p-1 gap-0.5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPeriodChange(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
                period === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onRefresh}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
