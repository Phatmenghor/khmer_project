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
import { formatCurrency } from "@/utils/common/currency-format";
import { ChartSkeleton } from "./chart-skeleton";
import { DashboardSalesResponse } from "@/features/dashboard/store/models/response/dashboard-response";

function SalesTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded shadow-lg px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-primary">
        Revenue: <span className="font-bold">{formatCurrency(payload[0]?.value ?? 0)}</span>
      </p>
      <p className="text-muted-foreground">
        Orders: <span className="font-medium text-foreground">{payload[1]?.value ?? 0}</span>
      </p>
    </div>
  );
}

interface SalesAnalyticsCardProps {
  sales: DashboardSalesResponse | null;
  loading: boolean;
}

export function SalesAnalyticsCard({ sales, loading }: SalesAnalyticsCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs">Sales Analytics</CardTitle>
            <CardDescription>Revenue &amp; orders over time — last 7 days</CardDescription>
          </div>
          {sales && (
            <div className="text-right">
              <p className="text-xs font-bold text-primary">{formatCurrency(sales.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">{sales.totalOrders} orders</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartSkeleton />
        ) : !sales?.data?.length ? (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-xs">
            No sales data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={sales.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => { try { return format(new Date(v), "MMM d"); } catch { return v; } }}
              />
              <YAxis
                yAxisId="revenue"
                orientation="left"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={45}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip content={<SalesTooltip />} />
              <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} strokeDasharray="4 2" activeDot={{ r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
