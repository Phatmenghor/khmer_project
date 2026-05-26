"use client";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
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
import { DashboardPaymentsResponse } from "@/features/dashboard/store/models/response/dashboard-response";

const PAYMENT_COLORS: Record<string, string> = {
  CASH: "hsl(var(--chart-1))",
  BANK: "hsl(var(--chart-2))",
};

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold">{payload[0].name}</p>
      <p className="text-primary">{formatCurrency(payload[0].value)}</p>
      <p className="text-muted-foreground">{payload[0].payload.percentage?.toFixed(1)}%</p>
    </div>
  );
}

interface PaymentMethodsCardProps {
  payments: DashboardPaymentsResponse | null;
  loading: boolean;
}

export function PaymentMethodsCard({ payments, loading }: PaymentMethodsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Payment Methods</CardTitle>
        <CardDescription>Revenue by payment type</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartSkeleton height={240} />
        ) : !payments?.data?.length ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
            No payment data
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={payments.data} dataKey="amount" nameKey="method" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {payments.data.map((item) => (
                    <Cell
                      key={item.method}
                      fill={PAYMENT_COLORS[item.method] ?? "hsl(var(--chart-3))"}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend iconSize={8} iconType="circle" formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {payments.data.map((item) => (
                <div key={item.method} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PAYMENT_COLORS[item.method] ?? "hsl(var(--chart-3))" }}
                    />
                    <span className="text-muted-foreground">{item.method}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-foreground tabular-nums">{item.percentage?.toFixed(0)}%</span>
                    <span className="ml-2 text-xs text-muted-foreground tabular-nums">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
