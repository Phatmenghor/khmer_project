"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { formatCurrency } from "@/utils/common/currency-format";
import { ChartSkeleton } from "./chart-skeleton";
import { DashboardHourlySalesResponse } from "@/features/dashboard/store/models/response/dashboard-response";

function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function HourlyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-xl shadow-lg px-4 py-3 text-sm space-y-1">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-primary">
        Revenue: <span className="font-bold">{formatCurrency(payload[0]?.value ?? 0)}</span>
      </p>
      {payload[1] && (
        <p className="text-muted-foreground">
          Orders: <span className="font-medium text-foreground">{payload[1]?.value ?? 0}</span>
        </p>
      )}
    </div>
  );
}

interface HourlySalesCardProps {
  hourlySales: DashboardHourlySalesResponse | null;
  loading: boolean;
  currentHour: number;
}

export function HourlySalesCard({ hourlySales, loading, currentHour }: HourlySalesCardProps) {
  const hourlyData = (hourlySales?.data ?? []).map((d) => ({
    ...d,
    label: formatHour(d.hour),
    isCurrent: d.hour === currentHour,
  }));

  const peakHour = hourlySales?.peakHour ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Hourly Sales Pattern</CardTitle>
            <CardDescription>
              Today's revenue by hour (current: {formatHour(currentHour)})
            </CardDescription>
          </div>
          {hourlyData.length > 0 && (
            <Badge variant="outline" className="gap-1.5 text-xs">
              <Flame className="h-3 w-3 text-rose-500" />
              Peak: {formatHour(peakHour)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartSkeleton height={200} />
        ) : !hourlyData.length ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            No hourly data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                interval={2}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                width={40}
              />
              <Tooltip content={<HourlyTooltip />} />
              <Bar
                dataKey="revenue"
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              >
                {hourlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isCurrent
                      ? "hsl(var(--primary))"
                      : "hsl(var(--primary) / 0.45)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
