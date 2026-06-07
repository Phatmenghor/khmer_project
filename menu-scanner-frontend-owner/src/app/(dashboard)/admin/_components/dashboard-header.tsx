"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  today: string;
  onRefresh: () => void;
}

export function DashboardHeader({ today, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <h1 className="text-sm sm:text-base lg:text-lg font-bold text-foreground whitespace-nowrap">
            Platform Dashboard
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
            Last 30 days
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
          {today}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="gap-1 self-start sm:self-auto whitespace-nowrap"
        onClick={onRefresh}
      >
        <RefreshCw className="h-3 w-3" />
        Refresh
      </Button>
    </div>
  );
}
