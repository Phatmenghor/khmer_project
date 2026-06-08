"use client";

import { Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/common/currency-format";
import { DashboardPromotionsResponse } from "@/features/dashboard/store/models/response/dashboard-response";

interface PromotionPerformanceCardProps {
  promotions: DashboardPromotionsResponse | null;
  loading: boolean;
}

export function PromotionPerformanceCard({ promotions, loading }: PromotionPerformanceCardProps) {
  const activePromoCount = promotions?.data?.length ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs">Promotion Performance</CardTitle>
            <CardDescription className="text-xs">Discount impact today</CardDescription>
          </div>
          {activePromoCount > 0 && (
            <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
              {activePromoCount} active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-3 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-2 w-14" />
                </div>
                <Skeleton className="h-2.5 w-11" />
                <Skeleton className="h-3 w-10 rounded-full" />
              </div>
            ))}
          </div>
        ) : !promotions?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-7 text-muted-foreground gap-1">
            <Tag className="h-5 w-5 opacity-30" />
            <p className="text-xs">No promotions today</p>
          </div>
        ) : (
          <div className="divide-y">
            {promotions.data.map((promo) => (
              <div key={promo.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{promo.name}</p>
                  <p className="text-xs text-muted-foreground">{promo.type} · ×{promo.timesUsed} used</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(promo.revenueGenerated)}</p>
                  <p className="text-xs text-rose-400 tabular-nums">-{formatCurrency(promo.discountGiven)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
