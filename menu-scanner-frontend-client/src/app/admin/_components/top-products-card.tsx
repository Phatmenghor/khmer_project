"use client";

import {
  BarChart,
  Bar,
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
import { DashboardTopProductsResponse } from "@/features/dashboard/store/models/response/dashboard-response";

function ProductTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-1 truncate max-w-[160px]">{label}</p>
      <p className="text-primary">
        Revenue: <span className="font-bold">{formatCurrency(payload[0]?.value ?? 0)}</span>
      </p>
      <p className="text-muted-foreground">
        Units sold: <span className="font-medium text-foreground">{payload[1]?.value ?? 0}</span>
      </p>
    </div>
  );
}

interface TopProductsCardProps {
  topProducts: DashboardTopProductsResponse | null;
  loading: boolean;
}

export function TopProductsCard({ topProducts, loading }: TopProductsCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <div>
          <CardTitle className="text-base">Top Selling Products</CardTitle>
          <CardDescription>Best performers this period</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartSkeleton height={260} />
        ) : !topProducts?.data?.length ? (
          <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
            No product data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={topProducts.data}
              layout="vertical"
              margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v)}`
                }
              />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.length > 14 ? `${v.slice(0, 14)}…` : v}
              />
              <Tooltip content={<ProductTooltip />} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={22} />
              <Bar dataKey="unitsSold" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
