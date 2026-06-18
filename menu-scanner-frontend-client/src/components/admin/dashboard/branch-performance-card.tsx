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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs">Branch Performance</CardTitle>
            <CardDescription className="text-xs">Revenue ranking by branch</CardDescription>
          </div>
          <Award className="h-3 w-3 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-2 w-14" />
                </div>
                <Skeleton className="h-3 w-11" />
              </div>
            ))}
          </div>
        ) : !branches?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-7 text-muted-foreground gap-1">
            <Store className="h-5 w-5 opacity-30" />
            <p className="text-xs">No branch data available</p>
          </div>
        ) : (
          <div className="divide-y">
            {branches.data.map((branch, i) => {
              const maxRevenue = branches.data[0]?.revenue || 1;
              const pct = Math.round((branch.revenue / maxRevenue) * 100);
              const medalColors = ["text-amber-500", "text-slate-400", "text-amber-700"];
              return (
                <div key={branch.id} className="flex items-center gap-2 px-4 py-2 hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40" :
                    i === 1 ? "bg-slate-100 text-slate-600 dark:bg-slate-800" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i < 3
                      ? <Award className={cn("h-2.5 w-2.5", medalColors[i])} />
                      : <span className="text-xs">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{branch.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-xs text-muted-foreground">{branch.orders} orders</p>
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-foreground tabular-nums">{formatCurrency(branch.revenue)}</p>
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
