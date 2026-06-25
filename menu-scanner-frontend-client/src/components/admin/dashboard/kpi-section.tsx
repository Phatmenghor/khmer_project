"use client";

import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import { DashboardSummaryResponse } from "@/features/dashboard/store/models/response/dashboard-response";

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
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <div className={cn("h-8 w-8 rounded-md flex items-center justify-center shrink-0", iconBg)}>
            {icon}
          </div>
        </div>
        <p className="text-xl font-bold text-foreground tracking-tight tabular-nums">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {isPositive
              ? <TrendingUp className="h-4 w-4 text-emerald-500" />
              : <TrendingDown className="h-4 w-4 text-rose-500" />}
            <span className={cn(
              "text-xs font-medium",
              isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {isPositive ? "+" : ""}{change.toFixed(1)}% vs yesterday
            </span>
          </div>
        )}
        {description && change === undefined && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function KpiCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="h-6 w-24 mb-1.5" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

interface KpiSectionProps {
  summary: DashboardSummaryResponse | null;
  loading: { summary: boolean };
}

export function KpiSection({ summary, loading }: KpiSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {loading.summary ? (
        <>
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </>
      ) : (
        <>
          <KpiCard
            title="Total Sales"
            value={formatCurrency(summary?.totalSalesToday ?? 0)}
            change={summary?.totalSalesChange}
            icon={<DollarSign className="h-4 w-4 text-primary" />}
            iconBg="bg-primary/10"
          />
          <KpiCard
            title="Total Orders"
            value={String(summary?.totalOrdersToday ?? 0)}
            change={summary?.totalOrdersChange}
            icon={<ShoppingCart className="h-4 w-4 text-sky-600" />}
            iconBg="bg-sky-100 dark:bg-sky-950/40"
          />
          <KpiCard
            title="Low Stock Items"
            value={String(summary?.lowStockItems ?? 0)}
            icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
            iconBg="bg-amber-100 dark:bg-amber-950/40"
            description={summary?.lowStockItems ? "Needs restocking" : "Fully stocked"}
          />
          <KpiCard
            title="System Alerts"
            value={String(summary?.systemAlerts ?? 0)}
            icon={<Bell className="h-4 w-4 text-rose-600" />}
            iconBg="bg-rose-100 dark:bg-rose-950/40"
            description={summary?.systemAlerts ? "Action required" : "No alerts"}
          />
        </>
      )}
    </div>
  );
}
