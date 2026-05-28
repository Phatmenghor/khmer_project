"use client";

import { BarChart2 } from "lucide-react";

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      className="flex items-center justify-center bg-muted/20 rounded-lg"
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <BarChart2 className="h-8 w-8 opacity-30" />
        <span className="text-sm">Loading chart…</span>
      </div>
    </div>
  );
}
