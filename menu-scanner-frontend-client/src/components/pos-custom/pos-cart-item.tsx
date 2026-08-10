"use client";

import { Plus, Minus, X, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { SmartImage } from "@/components/shared/image/smart-image";
import { formatCurrency } from "@/utils/common/currency-format";
import { PromotionType } from "@/constants/status/status";

interface POSCartItemProps {
  id: string;
  productName: string;
  productImageUrl: string;
  sizeName?: string | null;
  currentPrice: number;
  finalPrice: number;
  quantity: number;
  hasPromotion?: boolean | string;
  promotionType?: string | null;
  promotionValue?: number | null;

  customizations?: Array<{
    id: string;
    productCustomizationId: string;
    name: string;
    priceAdjustment: number;
  }>;

  originalPrice?: number;
  hadChangeFromPOS?: boolean;
  auditChangeType?: string;
  onQuantityChange: (delta: number) => void;
  onRemove: () => void;
  onEdit: () => void;
}

export function POSCartItem({
  id,
  productName,
  productImageUrl,
  sizeName,
  currentPrice,
  finalPrice,
  quantity,
  hasPromotion,
  promotionType,
  promotionValue,
  customizations,
  originalPrice,
  hadChangeFromPOS,
  auditChangeType,
  onQuantityChange,
  onRemove,
  onEdit,
}: POSCartItemProps) {
  const lineTotal = (finalPrice + (customizations?.reduce((s, c) => s + (c.priceAdjustment || 0), 0) || 0)) * quantity;

  return (
    <div className="bg-card border border-border/80 rounded-[12px] p-2.5 hover:border-primary/40 hover:shadow-xs transition-all duration-200 relative group">
      {/* Top-Right Remove X Button */}
      <CustomButton
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[6px] transition-colors z-10"
        onClick={onRemove}
        title="Remove item"
      >
        <X className="h-3.5 w-3.5" />
      </CustomButton>

      <div className="flex gap-2.5">
        {/* Product Image */}
        <div className="relative w-[72px] h-[72px] rounded-[10px] overflow-hidden bg-muted border border-border/70 flex-shrink-0 shadow-2xs">
          <SmartImage src={productImageUrl} alt={productName} fill />

          {/* Promotion Badge */}
          {hasPromotion && (promotionValue ?? 0) > 0 && (
            <div className="absolute top-0.5 left-0.5 z-10 pointer-events-none">
              <Badge variant="destructive" className="text-[9px] font-black px-1 py-0 shadow-xs">
                {promotionType === PromotionType.PERCENTAGE
                  ? `-${promotionValue}%`
                  : `-${formatCurrency(promotionValue || 0)}`}
              </Badge>
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Title */}
            <h3 className="font-extrabold text-xs leading-tight text-foreground truncate pr-6">
              {productName}
            </h3>

            {/* Size / Addons Badges */}
            <div className="flex items-center gap-1 flex-wrap my-1">
              {sizeName && sizeName.toLowerCase() !== "standard" && (
                <span className="text-[9.5px] font-extrabold text-primary bg-primary/10 px-2 py-0.3 rounded-full border border-primary/30 whitespace-nowrap">
                  {sizeName}
                </span>
              )}
              {customizations && customizations.length > 0 && (
                <span className="text-[9.5px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.3 rounded-full border border-emerald-500/20 whitespace-nowrap">
                  +{customizations.length} Addons
                </span>
              )}
            </div>

            {/* Add-ons List Detail Preview */}
            {customizations && customizations.length > 0 && (
              <div className="space-y-0.5 my-0.5 pr-2">
                {customizations.map((c, idx) => (
                  <p key={idx} className="text-[10px] text-muted-foreground truncate leading-tight">
                    + {c.name} {c.priceAdjustment > 0 ? `(+${formatCurrency(c.priceAdjustment)})` : ""}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Row: Price on Left, Control Bar Far-Right Under X Delete */}
          <div className="flex items-end justify-between gap-2 mt-2 pt-1.5 border-t border-border/50 w-full">
            {/* Left: Price Breakdown */}
            <div className="flex flex-col min-w-0 pb-0.5">
              <div className="flex items-baseline gap-1">
                <span className="font-black text-xs sm:text-sm text-foreground">
                  {formatCurrency(finalPrice)}
                </span>
                {hasPromotion && currentPrice > finalPrice && (
                  <span className="text-[10px] text-muted-foreground line-through font-semibold">
                    {formatCurrency(currentPrice)}
                  </span>
                )}
              </div>
              {quantity > 1 && (
                <span className="text-[10px] font-bold text-primary leading-none mt-0.5">
                  Total: {formatCurrency(lineTotal)}
                </span>
              )}
            </div>

            {/* Right: Control Bar Far-Right Under X Delete Button */}
            <div className="flex items-center gap-0.5 shrink-0 bg-muted/60 dark:bg-muted/30 p-0.5 rounded-[10px] border border-border/80 shadow-2xs ml-auto">
              <CustomButton
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-background rounded-[8px] transition-all"
                onClick={onEdit}
                title="Edit item options & price"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </CustomButton>

              <CustomButton
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[8px] transition-all"
                onClick={() => onQuantityChange(-1)}
                title="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </CustomButton>

              <div className="text-center h-7 px-2.5 bg-background text-primary font-black text-xs rounded-[8px] border border-primary/20 flex items-center justify-center min-w-[28px] shadow-3xs">
                {quantity}
              </div>

              <CustomButton
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[8px] transition-all"
                onClick={() => onQuantityChange(1)}
                title="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </CustomButton>
            </div>
          </div>
        </div>
      </div>

      {/* POS Audit Trail */}
      {hadChangeFromPOS && originalPrice && (
        <div className="mt-2.5 pt-2 border-t border-border/60">
          <div className="text-[10px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            POS Audit Trail
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex-1 bg-muted/40 rounded-[6px] p-1 border border-border/60 text-[10px]">
              <div className="text-muted-foreground font-semibold">Before</div>
              <div className="font-bold text-foreground">
                {formatCurrency(originalPrice)}
              </div>
            </div>

            <div className="text-muted-foreground font-bold text-xs">→</div>

            <div className="flex-1 bg-emerald-500/10 rounded-[6px] p-1 border border-emerald-500/20 text-[10px]">
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">After</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(finalPrice)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
