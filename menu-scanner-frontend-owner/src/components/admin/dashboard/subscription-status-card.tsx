"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { OwnerDashboardStatusBreakdownResponse } from "@/redux/features/owner-dashboard/store/models/response/owner-dashboard-response";

interface StatusRowProps {
  label: string;
  count: number;
  percent: number;
  barColor: string;
  textColor: string;
}

function StatusRow({ label, count, percent, barColor, textColor }: StatusRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-1">
          <span className={cn("text-xs font-semibold", textColor)}>
            {percent.toFixed(1)}%
          </span>
          <span className="text-muted-foreground text-xs w-5 text-right">{count}</span>
        </div>
      </div>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

function StatusRowSkeleton() {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-11" />
      </div>
      <Skeleton className="h-1 w-full rounded-full" />
    </div>
  );
}

interface SubscriptionStatusCardProps {
  statusBreakdown: OwnerDashboardStatusBreakdownResponse | null;
  loading: boolean;
}

export function SubscriptionStatusCard({
  statusBreakdown,
  loading,
}: SubscriptionStatusCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs sm:text-sm font-semibold truncate">
          Subscription Status
        </CardTitle>
        <CardDescription className="text-[11px] sm:text-xs truncate">
          {loading || !statusBreakdown
            ? "Breakdown by status"
            : `${statusBreakdown.total} total subscriptions`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-8" />
            </div>
            <StatusRowSkeleton />
            <StatusRowSkeleton />
            <StatusRowSkeleton />
          </>
        ) : statusBreakdown ? (
          <>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs text-muted-foreground">Total subscriptions</span>
              <span className="text-xs font-bold text-foreground">
                {statusBreakdown.total}
              </span>
            </div>
            <StatusRow
              label="Active"
              count={statusBreakdown.active}
              percent={statusBreakdown.activePercent}
              barColor="bg-emerald-500"
              textColor="text-emerald-600 dark:text-emerald-400"
            />
            <StatusRow
              label="Expiring Soon"
              count={statusBreakdown.expiringSoon}
              percent={statusBreakdown.expiringSoonPercent}
              barColor="bg-amber-500"
              textColor="text-amber-600 dark:text-amber-400"
            />
            <StatusRow
              label="Expired"
              count={statusBreakdown.expired}
              percent={statusBreakdown.expiredPercent}
              barColor="bg-rose-500"
              textColor="text-rose-600 dark:text-rose-400"
            />
            <StatusRow
              label="Cancelled"
              count={statusBreakdown.cancelled}
              percent={statusBreakdown.cancelledPercent}
              barColor="bg-orange-500"
              textColor="text-orange-600 dark:text-orange-400"
            />
            <StatusRow
              label="Plan Changed"
              count={statusBreakdown.planChanged}
              percent={statusBreakdown.planChangedPercent}
              barColor="bg-blue-500"
              textColor="text-blue-600 dark:text-blue-400"
            />
          </>
        ) : (
          <div className="h-24 flex items-center justify-center text-muted-foreground text-xs">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
