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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartSkeleton } from "./chart-skeleton";
import { DashboardCustomerGrowthResponse } from "@/features/dashboard/store/models/response/dashboard-response";

function GrowthTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded shadow-lg px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-primary">
        Total customers: <span className="font-bold">{payload[0]?.payload?.totalCustomers ?? 0}</span>
      </p>
      <p className="text-muted-foreground">
        New that day: <span className="font-medium text-foreground">{payload[0]?.payload?.newCustomers ?? 0}</span>
      </p>
    </div>
  );
}

interface CustomerGrowthCardProps {
  customerGrowth: DashboardCustomerGrowthResponse | null;
  loading: boolean;
}

export function CustomerGrowthCard({ customerGrowth, loading }: CustomerGrowthCardProps) {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs">Customer Growth</CardTitle>
            <CardDescription className="text-xs">Total customers over time</CardDescription>
          </div>
          {customerGrowth && (
            <p className="text-xs font-bold text-primary">{customerGrowth.totalCustomers}</p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartSkeleton />
        ) : !customerGrowth?.data?.length ? (
          <div className="h-[180px] flex items-center justify-center text-muted-foreground text-xs">
            No customer data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={customerGrowth.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => { try { return format(new Date(v), "MMM d"); } catch { return v; } }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={30}
                allowDecimals={false}
              />
              <Tooltip content={<GrowthTooltip />} />
              <Area
                type="monotone"
                dataKey="totalCustomers"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.15}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
