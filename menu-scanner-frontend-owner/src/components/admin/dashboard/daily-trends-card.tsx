"use client";

import { format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartSkeleton } from "./chart-skeleton";
import { OwnerDashboardDailyTrendsResponse } from "@/redux/features/owner-dashboard/store/models/response/owner-dashboard-response";

type Mode = "count" | "amount";

interface DailyTrendsCardProps {
  title: string;
  description: string;
  data: OwnerDashboardDailyTrendsResponse | null;
  loading: boolean;
  mode: Mode;
  color?: string;
  totalLabel: string;
}

function CustomTooltip({ active, payload, label, mode }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="bg-popover border rounded shadow-lg px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-foreground mb-1">
        {(() => { try { return format(new Date(label), "MMM d, yyyy"); } catch { return label; } })()}
      </p>
      <p className="text-primary font-bold">
        {mode === "amount"
          ? `$${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : val}
      </p>
    </div>
  );
}

export function DailyTrendsCard({
  title,
  description,
  data,
  loading,
  mode,
  color = "hsl(var(--primary))",
  totalLabel,
}: DailyTrendsCardProps) {
  const chartData = data?.data?.map((p) => ({
    date: p.date,
    value: mode === "amount" ? Number(p.amount) : p.count,
  })) ?? [];

  const total = mode === "amount"
    ? `$${Number(data?.totalAmount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : String(data?.totalCount ?? 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xs sm:text-sm font-semibold truncate">
              {title}
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs truncate">
              {description}
            </CardDescription>
          </div>
          {loading ? (
            <Skeleton className="h-4 w-14 shrink-0" />
          ) : (
            <div className="text-right shrink-0">
              <p className="text-sm sm:text-base font-bold text-primary tabular-nums whitespace-nowrap">
                {total}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground whitespace-nowrap">
                {totalLabel}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartSkeleton height={200} />
        ) : !chartData.length ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs">
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => { try { return format(new Date(v), "MMM d"); } catch { return v; } }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={mode === "amount" ? 55 : 35}
                tickFormatter={(v) =>
                  mode === "amount"
                    ? v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                    : String(v)
                }
              />
              <Tooltip content={<CustomTooltip mode={mode} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#grad-${title})`}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
