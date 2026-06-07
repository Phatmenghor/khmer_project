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

const STOCK_STATUS_CONFIG: Record<StockStatus, { label: string; textClass: string; barClass: string }> = {
  IN_STOCK:     { label: "In Stock",     textClass: "text-emerald-600 dark:text-emerald-400", barClass: "bg-emerald-400" },
  LOW_STOCK:    { label: "Low Stock",    textClass: "text-amber-600 dark:text-amber-400",    barClass: "bg-amber-400" },
  OUT_OF_STOCK: { label: "Out of Stock", textClass: "text-rose-500 dark:text-rose-400",      barClass: "bg-rose-300" },
};

interface InventoryStatusCardProps {
  stock: DashboardStockResponse | null;
  loading: boolean;
}

export function InventoryStatusCard({ stock, loading }: InventoryStatusCardProps) {
  const outCount = stock?.outOfStockCount ?? 0;
  const lowCount = stock?.lowStockCount ?? 0;
  const hasSummary = outCount > 0 || lowCount > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold">Inventory Status</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Items requiring attention
            </CardDescription>
          </div>
          <Link href={ROUTES.MANAGE_STOCK.STOCK_ITEMS}>
            <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs">
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Summary strip — moved out of the header so it doesn't crowd the title */}
        {hasSummary && !loading && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b bg-muted/20">
            {outCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                {outCount} out of stock
              </span>
            )}
            {lowCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {lowCount} low stock
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : !stock?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Package className="h-7 w-7 opacity-30" />
            <p className="text-sm">All items fully stocked</p>
          </div>
        ) : (
          <div className="divide-y">
            {stock.data.map((item) => {
              const cfg = STOCK_STATUS_CONFIG[item.status];
              // Progress against the alert threshold: 0 means at/below min, 100 means well-stocked.
              const pct = item.minStock > 0
                ? Math.min(100, Math.round((item.quantity / item.minStock) * 100))
                : 100;
              return (
                <div key={item.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                        <span className={cn("text-[10px] font-semibold shrink-0", cfg.textClass)}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                          {item.quantity} / {item.minStock} min
                        </p>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", cfg.barClass)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
