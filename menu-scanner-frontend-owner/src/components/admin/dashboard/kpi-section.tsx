"use client";

import {
  TrendingUp,
  TrendingDown,
  Building2,
  UserPlus,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { OwnerDashboardSummaryResponse } from "@/features/owner-dashboard/store/models/response/owner-dashboard-response";

interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  iconBg: string;
  description?: string;
}

function KpiCard({ title, value, change, icon, iconBg, description }: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <Card className="rounded-[16px] border border-border/80 shadow-2xs hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs font-semibold text-foreground/80 tracking-tight truncate min-w-0">
            {title}
          </p>
          <div className={cn("h-9 w-9 rounded-[10px] flex items-center justify-center shrink-0 shadow-2xs", iconBg)}>
            {icon}
          </div>
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight tabular-nums truncate">
          {value}
        </p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2 min-w-0">
            {isPositive
              ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              : <TrendingDown className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
            <span className={cn(
              "text-xs font-medium truncate",
              isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {isPositive ? "+" : ""}{change.toFixed(1)}% vs previous period
            </span>
          </div>
        )}
        {description && change === undefined && (
          <p className="text-xs text-muted-foreground mt-1.5 truncate">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function KpiCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
        <Skeleton className="h-7 w-28 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

interface KpiSectionProps {
  summary: OwnerDashboardSummaryResponse | null;
  loading: boolean;
}

export function KpiSection({ summary, loading }: KpiSectionProps) {
  const formatRevenue = (n: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {loading ? (
        <>
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </>
      ) : (
        <>
          <KpiCard
            title="Total Owners"
            value={String(summary?.totalBusinessOwners ?? 0)}
            icon={<Building2 className="h-4 w-4 text-blue-600" />}
            iconBg="bg-blue-100 dark:bg-blue-950/40"
            description="Registered business owners"
          />
          <KpiCard
            title="Active Subscriptions"
            value={String(summary?.activeSubscriptions ?? 0)}
            icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
            iconBg="bg-emerald-100 dark:bg-emerald-950/40"
            description="Currently active subscriptions"
          />
          <KpiCard
            title="Expiring Soon"
            value={String(summary?.expiringSoonSubscriptions ?? 0)}
            icon={<Clock className="h-4 w-4 text-amber-600" />}
            iconBg="bg-amber-100 dark:bg-amber-950/40"
            description="≤7 days remaining"
          />
          <KpiCard
            title="Revenue"
            value={formatRevenue(summary?.totalRevenue ?? 0)}
            change={summary?.revenueChange}
            icon={<DollarSign className="h-4 w-4 text-violet-600" />}
            iconBg="bg-violet-100 dark:bg-violet-950/40"
          />
        </>
      )}
    </div>
  );
}
