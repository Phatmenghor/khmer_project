"use client";

import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChartSkeleton } from "./chart-skeleton";
import { OwnerDashboardTrendsResponse } from "@/redux/features/owner-dashboard/store/models/response/owner-dashboard-response";

function TrendsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded shadow-lg px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-primary">
        New Subs:{" "}
        <span className="font-bold">{payload[0]?.value ?? 0}</span>
      </p>
      <p className="text-muted-foreground">
        Revenue:{" "}
        <span className="font-medium text-foreground">
          ${Number(payload[1]?.value ?? 0).toFixed(2)}
        </span>
      </p>
    </div>
  );
}

interface SubscriptionTrendsCardProps {
  trends: OwnerDashboardTrendsResponse | null;
  loading: boolean;
  className?: string;
}

export function SubscriptionTrendsCard({
  trends,
  loading,
  className,
}: SubscriptionTrendsCardProps) {
  const formatRevenue = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
    return `$${n.toFixed(0)}`;
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xs sm:text-sm font-semibold truncate">
              Subscription Trends
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs truncate">
              New subscriptions &amp; revenue over time
            </CardDescription>
          </div>
          {trends && (
            <div className="text-right shrink-0">
              <p className="text-sm sm:text-base font-bold text-primary tabular-nums whitespace-nowrap">
                {formatRevenue(trends.totalRevenue)}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground whitespace-nowrap">
                {trends.totalNewSubscriptions} new subs
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartSkeleton />
        ) : !trends?.data?.length ? (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-xs">
            No trend data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={trends.data}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  try {
                    return format(new Date(v), "MMM d");
                  } catch {
                    return v;
                  }
                }}
              />
              <YAxis
                yAxisId="subs"
                orientation="left"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={35}
              />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatRevenue(v)}
                width={50}
              />
              <Tooltip content={<TrendsTooltip />} />
              <Line
                yAxisId="subs"
                type="monotone"
                dataKey="newSubscriptions"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 2"
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
