"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
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
  Users,
  Target,
  Tag,
  ScanLine,
  ClipboardList,
  ArrowUpRight,
  Flame,
  RotateCcw,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/common/currency-format";
import { showToast } from "@/components/shared/common/show-toast";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { useDashboardState } from "@/features/dashboard/store/state/dashboard-state";
import { useExchangeRateState } from "@/features/master-data/store/state/exchange-rate-state";
import { fetchAllMyBusinessExchangeRateService } from "@/features/master-data/store/thunks/exchange-rate-thunks";
import { setPeriod, resetState } from "@/features/dashboard/store/slice/dashboard-slice";
import {
  fetchDashboardSummaryService,
  fetchDashboardSalesService,
  fetchDashboardPaymentsService,
  fetchDashboardStockService,
  fetchDashboardOrdersService,
  fetchDashboardBranchesService,
  fetchDashboardTopProductsService,
  fetchDashboardHourlySalesService,
  fetchDashboardCustomerStatsService,
  fetchDashboardTargetService,
  fetchDashboardPromotionsService,
} from "@/features/dashboard/store/thunks/dashboard-thunks";
import {
  DashboardPeriod,
  StockStatus,
} from "@/features/dashboard/store/models/response/dashboard-response";
import { OrderStatus } from "@/enums/order-status.enum";
import { ROUTES } from "@/constants/app-routes/routes";
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

const STOCK_STATUS_CONFIG: Record<
  StockStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  IN_STOCK: { label: "In Stock", variant: "default" },
  LOW_STOCK: { label: "Low Stock", variant: "outline" },
  OUT_OF_STOCK: { label: "Out of Stock", variant: "destructive" },
};

const ORDER_STATUS_STYLE: Record<string, string> = {
  [OrderStatus.PENDING]:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  [OrderStatus.CONFIRMED]:
    "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
  [OrderStatus.COMPLETED]:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  [OrderStatus.CANCELLED]:
    "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
};

const QUICK_ACTIONS = [
  { label: "POS Terminal", href: ROUTES.ADMIN.POS, icon: ScanLine, color: "text-primary bg-primary/10" },
  { label: "Pending Orders", href: ROUTES.ADMIN.ORDERS_PENDING, icon: ClipboardList, color: "text-amber-600 bg-amber-100 dark:bg-amber-950/40" },
  { label: "All Orders", href: ROUTES.ADMIN.ORDERS, icon: ShoppingCart, color: "text-sky-600 bg-sky-100 dark:bg-sky-950/40" },
  { label: "Products", href: ROUTES.ADMIN.PRODUCTS, icon: Package, color: "text-violet-600 bg-violet-100 dark:bg-violet-950/40" },
  { label: "Promotions", href: ROUTES.ADMIN.PRODUCTS_PROMOTION, icon: Tag, color: "text-rose-600 bg-rose-100 dark:bg-rose-950/40" },
  { label: "Stock", href: ROUTES.MANAGE_STOCK.PRODUCTS_STOCK, icon: Store, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40" },
];

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

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
    <div
      className="flex items-center justify-center bg-muted/20 rounded-lg"
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <BarChart2 className="h-8 w-8 opacity-30" />
        <span className="text-sm">Loading chart…</span>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

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
            <span className={cn(
              "text-xs font-medium",
              isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {isPositive ? "+" : ""}{change.toFixed(1)}% vs yesterday
            </span>
          </div>
        )}
        {description && change === undefined && (
          <p className="text-xs text-muted-foreground mt-1.5">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Tooltip helpers ──────────────────────────────────────────────────────────

function SalesTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-xl shadow-lg px-4 py-3 text-sm space-y-1">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      <p className="text-primary">
        Revenue: <span className="font-bold">{formatCurrency(payload[0]?.value ?? 0)}</span>
      </p>
      <p className="text-muted-foreground">
        Orders: <span className="font-medium text-foreground">{payload[1]?.value ?? 0}</span>
      </p>
    </div>
  );
}

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

// ─── Hourly label helper ──────────────────────────────────────────────────────

function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
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
    topProducts,
    hourlySales,
    customerStats,
    target,
    promotions,
    loading,
    error,
    dispatch,
  } = useDashboardState();

  const { exchangeRateContent, dispatch: erDispatch } = useExchangeRateState();
  const activeRate = exchangeRateContent?.find((r) => r.status === "ACTIVE") ?? exchangeRateContent?.[0];

  const fetchAll = useCallback(
    (p: DashboardPeriod) => {
      dispatch(fetchDashboardSummaryService({ period: p }));
      dispatch(fetchDashboardSalesService({ period: p }));
      dispatch(fetchDashboardPaymentsService({ period: p }));
      dispatch(fetchDashboardStockService());
      dispatch(fetchDashboardOrdersService({ period: p }));
      dispatch(fetchDashboardBranchesService({ period: p }));
      dispatch(fetchDashboardTopProductsService({ period: p }));
      dispatch(fetchDashboardHourlySalesService({ period: p }));
      dispatch(fetchDashboardCustomerStatsService({ period: p }));
      dispatch(fetchDashboardTargetService({ period: p }));
      dispatch(fetchDashboardPromotionsService({ period: p }));
    },
    [dispatch]
  );

  useEffect(() => {
    fetchAll(period);
    erDispatch(fetchAllMyBusinessExchangeRateService({ pageNo: 1, pageSize: 5 }));
  }, [period, fetchAll, erDispatch]);

  useEffect(() => {
    if (error) showToast.error(error);
  }, [error]);

  const handlePeriodChange = (p: DashboardPeriod) => dispatch(setPeriod(p));
  const handleRefresh = () => fetchAll(period);

  const today = format(new Date(), "EEEE, MMM d yyyy");

  // Revenue target %
  const targetPct = target
    ? Math.min(Math.round(target.percentage), 100)
    : 0;
  const targetOver = target ? target.percentage > 100 : false;

  // Hourly data with hour labels
  const hourlyData = hourlySales?.data.map((d) => ({
    ...d,
    label: formatHour(d.hour),
  })) ?? [];

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl border bg-card hover:shadow-md transition-all duration-150 cursor-pointer group">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.color)}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                {action.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Revenue Target ── */}
      {(loading.target || target) && (
        <Card>
          <CardContent className="p-6">
            {loading.target ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-48" />
              </div>
            ) : target ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Revenue Target</span>
                      <Badge
                        variant={targetOver ? "default" : "outline"}
                        className={cn(
                          "text-xs",
                          targetOver
                            ? "bg-emerald-500 text-white border-0"
                            : "text-muted-foreground"
                        )}
                      >
                        {target.daysRemaining > 0
                          ? `${target.daysRemaining}d left`
                          : "Period ended"}
                      </Badge>
                    </div>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {formatCurrency(target.currentRevenue)}
                      <span className="text-muted-foreground font-normal"> / {formatCurrency(target.targetRevenue)}</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        targetOver ? "bg-emerald-500" : targetPct >= 75 ? "bg-primary" : targetPct >= 50 ? "bg-amber-500" : "bg-rose-500"
                      )}
                      style={{ width: `${targetPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {targetOver
                      ? `🎉 Target exceeded by ${formatCurrency(target.currentRevenue - target.targetRevenue)}`
                      : `${formatCurrency(target.targetRevenue - target.currentRevenue)} remaining to hit target`}
                  </p>
                </div>
                <div className="text-center shrink-0">
                  <p className={cn(
                    "text-3xl font-bold tabular-nums",
                    targetOver ? "text-emerald-500" : targetPct >= 75 ? "text-primary" : "text-amber-500"
                  )}>
                    {target.percentage.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">achieved</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading.summary || loading.customerStats ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
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
              title="Avg Order Value"
              value={formatCurrency(summary?.avgOrderValue ?? 0)}
              icon={<ArrowUpRight className="h-4 w-4 text-violet-600" />}
              iconBg="bg-violet-100 dark:bg-violet-950/40"
              description="Per transaction"
            />
            <KpiCard
              title="Return Customers"
              value={`${customerStats?.returnRate?.toFixed(0) ?? 0}%`}
              icon={<RotateCcw className="h-4 w-4 text-emerald-600" />}
              iconBg="bg-emerald-100 dark:bg-emerald-950/40"
              description={`${customerStats?.returningCustomers ?? 0} returning`}
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

      {/* ── Sales chart + Payment pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Sales Analytics</CardTitle>
                <CardDescription>Revenue &amp; orders over time</CardDescription>
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
                    <Pie data={payments.data} dataKey="amount" nameKey="method" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                      {payments.data.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend iconSize={8} iconType="circle" formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {payments.data.slice(0, 3).map((item, i) => (
                    <div key={item.method} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
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

      {/* ── Top Products + Exchange Rate ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-rose-500" />
              <div>
                <CardTitle className="text-base">Top Selling Products</CardTitle>
                <CardDescription>Best performers this period</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading.topProducts ? (
              <ChartSkeleton height={260} />
            ) : !topProducts?.data?.length ? (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                No product data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topProducts.data.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
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

        {/* Exchange Rate + Customer Stats */}
        <div className="flex flex-col gap-4">
          {/* Exchange Rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Exchange Rates</CardTitle>
              <CardDescription>Active rates</CardDescription>
            </CardHeader>
            <CardContent>
              {!activeRate ? (
                <div className="flex flex-col items-center justify-center py-4 text-muted-foreground gap-1.5">
                  <DollarSign className="h-7 w-7 opacity-30" />
                  <p className="text-sm">No active rate</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "USD → KHR", value: activeRate.usdToKhrRate, unit: "KHR" },
                    { label: "USD → CNY", value: activeRate.usdToCnyRate, unit: "CNY" },
                    { label: "USD → VND", value: activeRate.usdToVndRate, unit: "VND" },
                  ].map((rate) => (
                    <div key={rate.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{rate.label}</span>
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {rate.value?.toLocaleString()} {rate.unit}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <Badge variant="default" className="text-xs bg-emerald-500 text-white border-0">
                      Active
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Stats */}
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Customers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading.customerStats ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              ) : customerStats ? (
                <div className="space-y-3">
                  {[
                    { label: "Total Customers", value: customerStats.totalCustomers, color: "text-foreground" },
                    { label: "New", value: customerStats.newCustomers, color: "text-sky-600 dark:text-sky-400" },
                    { label: "Returning", value: customerStats.returningCustomers, color: "text-emerald-600 dark:text-emerald-400" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className={cn("text-sm font-semibold tabular-nums", row.color)}>{row.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Return rate</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {customerStats.returnRate?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(customerStats.returnRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No data</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Hourly Sales Heatmap ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Hourly Sales Pattern</CardTitle>
              <CardDescription>Revenue distribution by hour of day</CardDescription>
            </div>
            {hourlySales?.peakHour !== undefined && (
              <Badge variant="outline" className="gap-1.5 text-xs">
                <Flame className="h-3 w-3 text-rose-500" />
                Peak: {formatHour(hourlySales.peakHour)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading.hourlySales ? (
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
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval={1}
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
                  fill="hsl(var(--primary))"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Inventory + Branch Performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    <Badge variant="destructive" className="text-xs">{stock.outOfStockCount} out</Badge>
                  )}
                  {stock.lowStockCount > 0 && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">{stock.lowStockCount} low</Badge>
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
                      <Badge variant={cfg.variant} className="text-xs shrink-0">{cfg.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

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
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                        i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40" :
                        i === 1 ? "bg-slate-100 text-slate-600 dark:bg-slate-800" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {i < 3
                          ? <Award className={cn("h-3.5 w-3.5", medalColors[i])} />
                          : <span className="text-xs">{i + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{branch.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">{branch.orders} orders</p>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(branch.revenue)}</p>
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

      {/* ── Promotion Performance ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-rose-500" />
            <div>
              <CardTitle className="text-base">Promotion Performance</CardTitle>
              <CardDescription>Active promotions impact this period</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading.promotions ? (
            <div className="divide-y">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : !promotions?.data?.length ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Tag className="h-8 w-8 opacity-30" />
              <p className="text-sm">No active promotions this period</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_80px_120px_120px_80px] gap-4 px-6 py-2.5 bg-muted/30 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Promotion</span>
                <span className="text-center">Used</span>
                <span className="text-right">Revenue</span>
                <span className="text-right">Discount Given</span>
                <span className="text-center">Status</span>
              </div>
              <div className="divide-y">
                {promotions.data.map((promo) => (
                  <div key={promo.id} className="grid grid-cols-[1fr_80px_120px_120px_80px] gap-4 px-6 py-3 items-center hover:bg-muted/20 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{promo.name}</p>
                      <p className="text-xs text-muted-foreground">{promo.type}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground text-center tabular-nums">{promo.timesUsed}×</span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 text-right tabular-nums">
                      {formatCurrency(promo.revenueGenerated)}
                    </span>
                    <span className="text-sm text-rose-500 text-right tabular-nums">
                      -{formatCurrency(promo.discountGiven)}
                    </span>
                    <div className="flex justify-center">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        promo.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {promo.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
            <Link href={ROUTES.ADMIN.ORDERS}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
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
              <div className="grid grid-cols-[140px_1fr_100px_120px_100px] gap-4 px-6 py-2.5 bg-muted/30 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Order</span>
                <span>Customer</span>
                <span className="text-right">Amount</span>
                <span className="text-center">Status</span>
                <span className="text-right">Date</span>
              </div>
              <div className="divide-y">
                {orders.data.map((order) => (
                  <div key={order.id} className="grid grid-cols-[140px_1fr_100px_120px_100px] gap-4 px-6 py-3 items-center hover:bg-muted/20 transition-colors">
                    <span className="text-sm font-mono font-medium text-primary truncate">{order.orderCode}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.itemCount} item{order.itemCount !== 1 ? "s" : ""} · {order.paymentMethod}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground tabular-nums text-right">{formatCurrency(order.totalAmount)}</span>
                    <div className="flex justify-center">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        ORDER_STATUS_STYLE[order.status] ?? "bg-muted text-muted-foreground"
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground text-right tabular-nums">
                      {(() => { try { return format(new Date(order.createdAt), "MMM d, HH:mm"); } catch { return order.createdAt; } })()}
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
