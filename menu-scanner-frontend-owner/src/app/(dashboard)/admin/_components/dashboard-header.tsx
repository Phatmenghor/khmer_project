"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  today: string;
  onRefresh: () => void;
}

export function DashboardHeader({ today, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">Platform Dashboard</h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            Last 30 days
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
      </div>
      <Button variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto" onClick={onRefresh}>
        <RefreshCw className="h-3.5 w-3.5" />
        Refresh
      </Button>
    </div>
  );
}
