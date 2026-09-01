"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle2, AlertTriangle, XCircle, Package } from "lucide-react";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";

export function formatStockStatus(status?: string): { label: string; className: string; icon: any } {
  const s = status || "IN_STOCK";
  const map: Record<string, { label: string; className: string; icon: any }> = {
    ENABLED: { label: "Available", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500", icon: CheckCircle2 },
    IN_STOCK: { label: "In Stock", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500", icon: CheckCircle2 },
    LOW_STOCK: { label: "Low Stock", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:border-amber-500", icon: AlertTriangle },
    OUT_OF_STOCK: { label: "Out of Stock", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:border-rose-500", icon: XCircle },
    DISABLED: { label: "Unavailable", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 hover:border-slate-500", icon: Package },
  };
  return map[s] ?? { label: s.replace(/_/g, " "), className: "bg-slate-500/10 text-slate-600 border-slate-500/30 hover:border-slate-500", icon: Package };
}

interface ProductDetailHeaderProps {
  product: ProductDetailResponseModel;
  displayPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  dollarPrice?: number;
}

export function ProductDetailHeader({
  product,
  displayPrice,
  originalPrice,
  hasDiscount,
  discountPercent,
  dollarPrice = 0,
}: ProductDetailHeaderProps) {
  const rawStatus = product.stockStatus || (product.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "IN_STOCK");
  const stockInfo = formatStockStatus(rawStatus);
  const StockIcon = stockInfo.icon;

  return (
    <div className="space-y-3">
      {/* Category, Brand, and Stock Status Badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        {product.categoryName && (
          <Link href={`/products?category=${encodeURIComponent(product.categoryName)}`}>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30 hover:border-primary px-2.5 py-0.5 text-[11px] font-semibold rounded-full transition-all cursor-pointer shadow-2xs"
            >
              {product.categoryName}
            </Badge>
          </Link>
        )}

        {product.brandName && (
          <Link href={`/products?brand=${encodeURIComponent(product.brandName)}`}>
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:border-amber-500 px-2.5 py-0.5 text-[11px] font-semibold rounded-full transition-all cursor-pointer shadow-2xs"
            >
              {product.brandName}
            </Badge>
          </Link>
        )}

        <Badge
          variant="outline"
          className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border transition-colors shadow-2xs ${stockInfo.className}`}
        >
          <StockIcon className="h-3 w-3 mr-1" />
          {stockInfo.label}
        </Badge>
      </div>

      {/* Title - Compact size matching product cards */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-snug">
        {product.name}
      </h1>

      {/* Dynamic Price Display */}
      <div className="flex flex-wrap items-baseline gap-2.5 pt-0.5">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            ${displayPrice.toFixed(2)}
          </span>
          <span className="text-[11px] font-bold text-muted-foreground uppercase">USD</span>
        </div>

        {hasDiscount && originalPrice > displayPrice && (
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base text-muted-foreground line-through font-medium">
              ${originalPrice.toFixed(2)}
            </span>
            <Badge
              variant="destructive"
              className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[11px] font-extrabold px-2 py-0.5 rounded-full transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/40 hover:scale-105 hover:shadow-xs cursor-default select-none"
            >
              Save ${(originalPrice - displayPrice).toFixed(2)}
            </Badge>
          </div>
        )}

        {dollarPrice > 0 && (
          <div className="w-full sm:w-auto flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground/80 bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
            <DollarSign className="h-3 w-3 text-emerald-500" />
            <span>Approx. ៛{(displayPrice * dollarPrice).toLocaleString()} KHR</span>
          </div>
        )}
      </div>

      {/* Description - Compact text */}
      {product.description && (
        <div className="pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>{product.description}</p>
        </div>
      )}
    </div>
  );
}
