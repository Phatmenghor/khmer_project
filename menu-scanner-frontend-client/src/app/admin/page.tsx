"use client";

import { useCallback, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Bell,
  RefreshCw,
  Package,
  Store,
  Award,
  BarChart2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/common/currency-format";
import { showToast } from "@/components/shared/common/show-toast";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { useDashboardState } from "@/features/dashboard/store/state/dashboard-state";
import { setPeriod, resetState } from "@/features/dashboard/store/slice/dashboard-slice";
import {
  fetchDashboardSummaryService,
  fetchDashboardSalesService,
  fetchDashboardPaymentsService,
  fetchDashboardStockService,
  fetchDashboardOrdersService,
  fetchDashboardBranchesService,
} from "@/features/dashboard/store/thunks/dashboard-thunks";
import { DashboardPeriod, StockStatus } from "@/features/dashboard/store/models/response/dashboard-response";
import { OrderStatus } from "@/enums/order-status.enum";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { label: string; value: DashboardPeriod }[] = [
  { label: "Today", value: "TODAY" },
  { label: "7 Days", value: "7D" },
  { label: "30 Days", value: "30D" },
  { label: "90 Days", value: "90D" },
];

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const STOCK_STATUS_CONFIG: Record<StockStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  IN_STOCK: { label: "In Stock", variant: "default" },
  LOW_STOCK: { label: "Low Stock", variant: "outline" },
  OUT_OF_STOCK: { label: "Out of Stock", variant: "destructive" },
};

const ORDER_STATUS_STYLE: Record<string, string> = {
  [OrderStatus.PENDING]: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  [OrderStatus.CONFIRMED]: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
  [OrderStatus.COMPLETED]: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  [OrderStatus.CANCELLED]: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function KpiCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className={cn("flex items-center justify-center bg-muted/20 rounded-lg")} style={{ height }}>
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <BarChart2 className="h-8 w-8 opacity-30" />
        <span className="text-sm">Loading chart…</span>
      </div>
    </div>
  );
}

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
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1.5">
            {isPositive
              ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              : <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
            <span className={cn("text-xs font-medium", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
              {isPositive ? "+" : ""}{change.toFixed(1)}% vs yesterday
            </span>
          </div>
        )}
        {description && !change && (
          <p className="text-xs text-muted-foreground mt-1.5">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  useAdminCleanup(resetState);

  const {
    period,
    summary,
    sales,
    payments,
    stock,
    orders,
    branches,
    loading,
    error,
    dispatch,
  } = useDashboardState();

  const fetchAll = useCallback(
    (p: DashboardPeriod) => {
      dispatch(fetchDashboardSummaryService({ period: p }));
      dispatch(fetchDashboardSalesService({ period: p }));
      dispatch(fetchDashboardPaymentsService({ period: p }));
      dispatch(fetchDashboardStockService());
      dispatch(fetchDashboardOrdersService({ period: p }));
      dispatch(fetchDashboardBranchesService({ period: p }));
    },
    [dispatch]
  );

  useEffect(() => {
    fetchAll(period);
  }, [period, fetchAll]);

  useEffect(() => {
    if (error) {
      showToast.error(error);
    }
  }, [error]);

  const handlePeriodChange = (p: DashboardPeriod) => {
    dispatch(setPeriod(p));
  };

  const handleRefresh = () => fetchAll(period);

  // ── Date range label ──
  const today = format(new Date(), "MMM d, yyyy");

  // ── Recharts custom tooltip ──
  const SalesTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border rounded-xl shadow-lg px-4 py-3 text-sm space-y-1">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        <p className="text-primary">Revenue: <span className="font-bold">{formatCurrency(payload[0]?.value ?? 0)}</span></p>
        <p className="text-muted-foreground">Orders: <span className="font-medium text-foreground">{payload[1]?.value ?? 0}</span></p>
      </div>
    );
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-primary">{formatCurrency(payload[0].value)}</p>
        <p className="text-muted-foreground">{payload[0].payload.percentage?.toFixed(1)}%</p>
      </div>
    );
  };

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{today} · POS Overview</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="flex bg-muted rounded-lg p-1 gap-0.5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handlePeriodChange(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
                  period === opt.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              description={summary?.lowStockItems ? "Requires restocking" : "All items stocked"}
            />
            <KpiCard
              title="System Alerts"
              value={String(summary?.systemAlerts ?? 0)}
              icon={<Bell className="h-4 w-4 text-rose-600" />}
              iconBg="bg-rose-100 dark:bg-rose-950/40"
              description={summary?.systemAlerts ? "Action required" : "No active alerts"}
            />
          </>
        )}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Sales Analytics</CardTitle>
                <CardDescription className="mt-0.5">
                  Revenue &amp; orders over time
                </CardDescription>
              </div>
              {sales && (
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{formatCurrency(sales.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">{sales.totalOrders} orders</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading.sales ? (
              <ChartSkeleton />
            ) : !sales?.data?.length ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
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
                    tickFormatter={(v) => {
                      try { return format(new Date(v), "MMM d"); } catch { return v; }
                    }}
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
                  <Line
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
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

        {/* Payment Methods Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Methods</CardTitle>
            <CardDescription>Revenue by payment type</CardDescription>
          </CardHeader>
          <CardContent>
            {loading.payments ? (
              <ChartSkeleton height={240} />
            ) : !payments?.data?.length ? (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                No payment data
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={payments.data}
                      dataKey="amount"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {payments.data.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      iconSize={8}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {payments.data.slice(0, 3).map((item, i) => (
                    <div key={item.method} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="text-muted-foreground truncate max-w-[100px]">{item.method}</span>
                      </div>
                      <span className="font-medium text-foreground tabular-nums">{item.percentage?.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Middle Row: Inventory + Branch Performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inventory Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Inventory Status</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </div>
              {stock && (
                <div className="flex items-center gap-2">
                  {stock.outOfStockCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {stock.outOfStockCount} out of stock
                    </Badge>
                  )}
                  {stock.lowStockCount > 0 && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      {stock.lowStockCount} low
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading.stock ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : !stock?.data?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Package className="h-8 w-8 opacity-30" />
                <p className="text-sm">All items fully stocked</p>
              </div>
            ) : (
              <div className="divide-y">
                {stock.data.slice(0, 7).map((item) => {
                  const cfg = STOCK_STATUS_CONFIG[item.status];
                  const pct = Math.min(100, Math.round((item.quantity / Math.max(item.minStock * 2, 1)) * 100));
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">{item.quantity} / {item.minStock} min</p>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                item.status === "IN_STOCK" ? "bg-emerald-500" :
                                item.status === "LOW_STOCK" ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <Badge variant={cfg.variant} className="text-xs shrink-0">
                        {cfg.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Branch Performance */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Branch Performance</CardTitle>
                <CardDescription>Revenue ranking by branch</CardDescription>
              </div>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading.branches ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : !branches?.data?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Store className="h-8 w-8 opacity-30" />
                <p className="text-sm">No branch data available</p>
              </div>
            ) : (
              <div className="divide-y">
                {branches.data.map((branch, i) => {
                  const maxRevenue = branches.data[0]?.revenue || 1;
                  const pct = Math.round((branch.revenue / maxRevenue) * 100);
                  const medalColors = ["text-amber-500", "text-slate-400", "text-amber-700"];
                  return (
                    <div key={branch.id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                          i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40" :
                          i === 1 ? "bg-slate-100 text-slate-600 dark:bg-slate-800" :
                          "bg-muted text-muted-foreground"
                        )}
                      >
                        {i < 3 ? (
                          <Award className={cn("h-3.5 w-3.5", medalColors[i])} />
                        ) : (
                          <span className="text-xs">{i + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{branch.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">{branch.orders} orders</p>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground tabular-nums">
                          {formatCurrency(branch.revenue)}
                        </p>
                        {branch.revenueChange !== undefined && (
                          <p className={cn(
                            "text-xs font-medium",
                            branch.revenueChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                          )}>
                            {branch.revenueChange >= 0 ? "+" : ""}{branch.revenueChange.toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Orders ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <CardDescription>
                {orders?.totalElements
                  ? `${orders.totalElements} total orders this period`
                  : "Latest transactions"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading.orders ? (
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28 flex-1" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : !orders?.data?.length ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <ShoppingCart className="h-8 w-8 opacity-30" />
              <p className="text-sm">No orders for this period</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[140px_1fr_100px_120px_100px] gap-4 px-6 py-2.5 bg-muted/30 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Order</span>
                <span>Customer</span>
                <span className="text-right">Amount</span>
                <span className="text-center">Status</span>
                <span className="text-right">Date</span>
              </div>
              <div className="divide-y">
                {orders.data.map((order) => (
                  <div
                    key={order.id}
                    className="grid grid-cols-[140px_1fr_100px_120px_100px] gap-4 px-6 py-3 items-center hover:bg-muted/20 transition-colors"
                  >
                    <span className="text-sm font-mono font-medium text-primary truncate">
                      {order.orderCode}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.itemCount} item{order.itemCount !== 1 ? "s" : ""} · {order.paymentMethod}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground tabular-nums text-right">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <div className="flex justify-center">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          ORDER_STATUS_STYLE[order.status] ?? "bg-muted text-muted-foreground"
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground text-right tabular-nums">
                      {(() => {
                        try { return format(new Date(order.createdAt), "MMM d, HH:mm"); } catch { return order.createdAt; }
                      })()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
