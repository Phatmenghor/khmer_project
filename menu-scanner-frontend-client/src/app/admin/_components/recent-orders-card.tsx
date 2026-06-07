"use client";

import Link from "next/link";
import { ShoppingCart, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import { DashboardOrdersResponse } from "@/features/dashboard/store/models/response/dashboard-response";
import { OrderStatus } from "@/enums/order-status.enum";
import { ROUTES } from "@/constants/app-routes/routes";

const ORDER_STATUS_STYLE: Record<string, string> = {
  [OrderStatus.PENDING]:   "text-amber-600 dark:text-amber-400",
  [OrderStatus.CONFIRMED]: "text-sky-600 dark:text-sky-400",
  [OrderStatus.COMPLETED]: "text-emerald-600 dark:text-emerald-400",
  [OrderStatus.CANCELLED]: "text-rose-500 dark:text-rose-400",
};

interface RecentOrdersCardProps {
  orders: DashboardOrdersResponse | null;
  loading: boolean;
}

function safeRelativeTime(iso: string | undefined | null): string {
  if (!iso || iso === "null" || iso === "undefined") return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function RecentOrdersCard({ orders, loading }: RecentOrdersCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {orders?.totalElements
                ? `${orders.totalElements} total orders this period`
                : "Latest transactions"}
            </CardDescription>
          </div>
          <Link href={ROUTES.ADMIN.ORDERS}>
            <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs">
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="divide-y">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24 flex-1" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : !orders?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <ShoppingCart className="h-7 w-7 opacity-30" />
            <p className="text-sm">No orders for this period</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[140px_1fr_90px_110px_120px] gap-3 px-4 py-2 bg-muted/30 border-b text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Order</span>
              <span>Customer</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Created At</span>
              <span className="text-center">Status</span>
            </div>
            <div className="divide-y">
              {orders.data.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-[140px_1fr_90px_110px_120px] gap-3 px-4 py-2.5 items-center hover:bg-muted/20 transition-colors"
                >
                  <span className="text-xs font-mono font-medium text-primary truncate">
                    {order.orderCode}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{order.customerName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {order.itemCount} item{order.itemCount !== 1 ? "s" : ""} · {order.paymentMethod}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-foreground tabular-nums text-right">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-right truncate">
                    {safeRelativeTime(order.createdAt)}
                  </span>
                  <div className="flex justify-center">
                    <span className={cn(
                      "text-[10px] font-semibold",
                      ORDER_STATUS_STYLE[order.status] ?? "text-muted-foreground"
                    )}>
                      {order.status}
                    </span>
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
