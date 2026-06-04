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
      <div>
        <div className="flex items-center gap-1">
          <h1 className="text-base font-bold text-foreground">Platform Dashboard</h1>
          <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            Last 30 days
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
      </div>
      <Button variant="outline" size="sm" className="gap-1 self-start sm:self-auto" onClick={onRefresh}>
        <RefreshCw className="h-2.5 w-2.5" />
        Refresh
      </Button>
    </div>
  );
}
