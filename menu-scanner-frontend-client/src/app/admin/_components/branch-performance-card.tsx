"use client";

import { Store, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import { DashboardBranchesResponse } from "@/features/dashboard/store/models/response/dashboard-response";

interface BranchPerformanceCardProps {
  branches: DashboardBranchesResponse | null;
  loading: boolean;
}

export function BranchPerformanceCard({ branches, loading }: BranchPerformanceCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Branch Performance</CardTitle>
            <CardDescription>Revenue ranking by branch</CardDescription>
          </div>
          <Award className="h-4 w-4 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : !branches?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Store className="h-8 w-8 opacity-30" />
            <p className="text-sm">No branch data available</p>
          </div>
        ) : (
          <div className="divide-y">
            {branches.data.map((branch, i) => {
              const maxRevenue = branches.data[0]?.revenue || 1;
              const pct = Math.round((branch.revenue / maxRevenue) * 100);
              const medalColors = ["text-amber-500", "text-slate-400", "text-amber-700"];
              return (
                <div key={branch.id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40" :
                    i === 1 ? "bg-slate-100 text-slate-600 dark:bg-slate-800" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i < 3
                      ? <Award className={cn("h-3.5 w-3.5", medalColors[i])} />
                      : <span className="text-xs">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{branch.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{branch.orders} orders</p>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(branch.revenue)}</p>
                    {branch.revenueChange !== undefined && (
                      <p className={cn(
                        "text-xs font-medium",
                        branch.revenueChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                      )}>
                        {branch.revenueChange >= 0 ? "+" : ""}{branch.revenueChange.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
