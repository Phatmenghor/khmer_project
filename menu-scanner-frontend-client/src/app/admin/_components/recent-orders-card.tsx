"use client";

import Link from "next/link";
import { ShoppingCart, ArrowUpRight } from "lucide-react";
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
  [OrderStatus.PENDING]:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  [OrderStatus.CONFIRMED]:
    "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
  [OrderStatus.COMPLETED]:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  [OrderStatus.CANCELLED]:
    "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
};

interface RecentOrdersCardProps {
  orders: DashboardOrdersResponse | null;
  loading: boolean;
}

export function RecentOrdersCard({ orders, loading }: RecentOrdersCardProps) {
  return (
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
        {loading ? (
          <div className="divide-y">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-20 rounded-full" />
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
            <div className="grid grid-cols-[140px_1fr_100px_120px] gap-4 px-6 py-2.5 bg-muted/30 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Order</span>
              <span>Customer</span>
              <span className="text-right">Amount</span>
              <span className="text-center">Status</span>
            </div>
            <div className="divide-y">
              {orders.data.map((order) => (
                <div key={order.id} className="grid grid-cols-[140px_1fr_100px_120px] gap-4 px-6 py-3 items-center hover:bg-muted/20 transition-colors">
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
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
