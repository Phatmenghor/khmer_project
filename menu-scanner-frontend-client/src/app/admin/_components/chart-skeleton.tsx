"use client";

import { BarChart2 } from "lucide-react";

interface ChartSkeletonProps {
  height?: number;
}

export function ChartSkeleton({ height = 280 }: ChartSkeletonProps) {
  return (
    <div
      className="flex items-center justify-center bg-muted/20 rounded"
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-1 text-muted-foreground">
        <BarChart2 className="h-5 w-5 opacity-30" />
        <span className="text-xs">Loading chart…</span>
      </div>
    </div>
  );
}
