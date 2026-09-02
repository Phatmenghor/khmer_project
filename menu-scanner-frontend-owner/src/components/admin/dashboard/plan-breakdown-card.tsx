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
import {
  OwnerDashboardPlanBreakdownResponse,
  PlanStat,
} from "@/features/owner-dashboard/store/models/response/owner-dashboard-response";

const PLAN_COLORS = [
  { bar: "bg-primary", text: "text-primary" },
  { bar: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
  { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  { bar: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
  { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
];

interface PlanRowProps {
  plan: PlanStat;
  colorIndex: number;
}

function PlanRow({ plan, colorIndex }: PlanRowProps) {
  const colors = PLAN_COLORS[colorIndex % PLAN_COLORS.length];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 min-w-0">
          <div className={cn("h-1 w-1 rounded-full shrink-0", colors.bar)} />
          <span className="font-medium text-foreground truncate">{plan.planName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-1">
          <span className={cn("text-xs font-semibold", colors.text)}>
            {plan.percentage.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {plan.activeCount} / {plan.totalCount}
          </span>
        </div>
      </div>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
          style={{ width: `${Math.min(plan.percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function PlanRowSkeleton() {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Skeleton className="h-1 w-1 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-14" />
      </div>
      <Skeleton className="h-1 w-full rounded-full" />
    </div>
  );
}

interface PlanBreakdownCardProps {
  planBreakdown: OwnerDashboardPlanBreakdownResponse | null;
  loading: boolean;
}

export function PlanBreakdownCard({ planBreakdown, loading }: PlanBreakdownCardProps) {
  const sortedPlans = planBreakdown?.data
    ? [...planBreakdown.data].sort((a, b) => b.activeCount - a.activeCount)
    : [];

  const totalActive = sortedPlans.reduce((sum, p) => sum + p.activeCount, 0);

  return (
    <Card className="rounded-[16px] border border-border/80 shadow-2xs hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm sm:text-base font-bold text-foreground truncate">
          Plan Breakdown
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground truncate">
          {loading || !planBreakdown
            ? "Active subscriptions by plan"
            : `${totalActive} active subscriptions across ${sortedPlans.length} plans`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-8" />
            </div>
            <PlanRowSkeleton />
            <PlanRowSkeleton />
            <PlanRowSkeleton />
            <PlanRowSkeleton />
          </>
        ) : sortedPlans.length > 0 ? (
          <>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs text-muted-foreground">Total active</span>
              <span className="text-xs font-bold text-foreground">{totalActive}</span>
            </div>
            {sortedPlans.map((plan, idx) => (
              <PlanRow key={plan.planName} plan={plan} colorIndex={idx} />
            ))}
          </>
        ) : (
          <div className="h-24 flex items-center justify-center text-muted-foreground text-xs">
            No plan data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
