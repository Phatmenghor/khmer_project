"use client";

import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DashboardCustomerStatsResponse } from "@/features/dashboard/store/models/response/dashboard-response";

interface CustomerStatsCardProps {
  customerStats: DashboardCustomerStatsResponse | null;
  loading: boolean;
}

export function CustomerStatsCard({ customerStats, loading }: CustomerStatsCardProps) {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Customers</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : customerStats ? (
          <div className="space-y-3">
            {[
              { label: "Total Customers", value: customerStats.totalCustomers, color: "text-foreground" },
              { label: "New", value: customerStats.newCustomers, color: "text-sky-600 dark:text-sky-400" },
              { label: "Returning", value: customerStats.returningCustomers, color: "text-emerald-600 dark:text-emerald-400" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className={cn("text-sm font-semibold tabular-nums", row.color)}>{row.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Return rate</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {customerStats.returnRate?.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(customerStats.returnRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No data</p>
        )}
      </CardContent>
    </Card>
  );
}
