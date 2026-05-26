"use client";

import Link from "next/link";
import { Package, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DashboardStockResponse,
  StockStatus,
} from "@/features/dashboard/store/models/response/dashboard-response";
import { ROUTES } from "@/constants/app-routes/routes";

const STOCK_STATUS_CONFIG: Record<StockStatus, { label: string; badgeClass: string; barClass: string }> = {
  IN_STOCK:     { label: "In Stock",    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800", barClass: "bg-emerald-400" },
  LOW_STOCK:    { label: "Low Stock",   badgeClass: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",           barClass: "bg-amber-400" },
  OUT_OF_STOCK: { label: "Out of Stock",badgeClass: "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",                 barClass: "bg-rose-300" },
};

interface InventoryStatusCardProps {
  stock: DashboardStockResponse | null;
  loading: boolean;
}

export function InventoryStatusCard({ stock, loading }: InventoryStatusCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Inventory Status</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {stock?.outOfStockCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                {stock.outOfStockCount} out of stock
              </span>
            )}
            {stock?.lowStockCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                {stock.lowStockCount} low stock
              </span>
            )}
            <Link href={ROUTES.MANAGE_STOCK.STOCK_ITEMS}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
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
            {stock.data.map((item) => {
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
                          className={cn("h-full rounded-full transition-all", cfg.barClass)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", cfg.badgeClass)}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
