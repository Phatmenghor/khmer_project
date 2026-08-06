"use client";

import { Plus, Minus, X, Edit2 } from "lucide-react";
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
  return (
    <div className="bg-card border border-border/80 rounded-[8px] p-2 hover:shadow-sm transition-all duration-200 relative group">
      {/* Remove Button */}
      <CustomButton
        size="icon"
        variant="ghost"
        className="absolute top-1.5 right-1.5 h-6 w-6 shrink-0 text-destructive hover:bg-destructive/10 rounded-[4px]"
        onClick={onRemove}
        title="Remove item"
      >
        <X className="h-3.5 w-3.5" />
      </CustomButton>

      <div className="flex gap-2">
        {/* Product Image */}
        <div className="relative w-[72px] h-[72px] rounded-[6px] overflow-hidden bg-muted border border-border/70 flex-shrink-0 shadow-2xs">
          <SmartImage src={productImageUrl} alt={productName} fill />

          {/* Promotion Badge */}
          {hasPromotion && (
            <div className="absolute top-0.5 left-0.5 z-10 pointer-events-none">
              <Badge variant="destructive" className="text-[9px] font-black px-1 py-0 shadow-xs">
                {promotionType === PromotionType.PERCENTAGE
                  ? `-${promotionValue}%`
                  : `-${formatCurrency(promotionValue || 0)}`}
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pr-4">
          {/* Title */}
          <h3 className="font-extrabold text-[11px] sm:text-xs leading-tight text-foreground truncate">
            {productName}
          </h3>

          {/* Size / Addons */}
          <div className="flex items-center gap-1 flex-wrap my-0.5">
            {sizeName && (
              <span className="text-[9px] font-extrabold text-primary bg-primary/10 px-1.5 py-0.2 rounded-full border border-primary/30 whitespace-nowrap">
                {sizeName}
              </span>
            )}
            {customizations && customizations.length > 0 && (
              <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20 whitespace-nowrap">
                +Addons ({customizations.length})
              </span>
            )}
          </div>

          {/* Bottom Price & Qty */}
          <div className="flex items-center justify-between gap-1 mt-0.5">
            {/* Price */}
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="font-black text-[11px] sm:text-xs text-foreground truncate">
                {formatCurrency(finalPrice)}
              </span>
              {hasPromotion && currentPrice > finalPrice && (
                <span className="text-[9px] text-muted-foreground line-through font-semibold hidden sm:inline">
                  {formatCurrency(currentPrice)}
                </span>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-0.5 shrink-0">
              <CustomButton
                size="icon"
                variant="outline"
                className="h-6 w-6 shrink-0 border-border/70 hover:bg-muted rounded-[4px]"
                onClick={onEdit}
                title="Edit size"
              >
                <Edit2 className="h-3 w-3" />
              </CustomButton>

              <CustomButton
                size="icon"
                variant="outline"
                className="h-6 w-6 shrink-0 hover:bg-destructive hover:text-destructive-foreground rounded-[4px]"
                onClick={() => onQuantityChange(-1)}
              >
                <Minus className="h-3 w-3" />
              </CustomButton>

              <div className="text-center h-6 px-1.5 bg-primary/10 text-primary font-black text-[11px] rounded-[4px] border border-primary/20 flex items-center justify-center min-w-[24px]">
                {quantity}
              </div>

              <CustomButton
                size="icon"
                variant="outline"
                className="h-6 w-6 shrink-0 hover:bg-primary hover:text-primary-foreground rounded-[4px]"
                onClick={() => onQuantityChange(1)}
              >
                <Plus className="h-3 w-3" />
              </CustomButton>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      {hadChangeFromPOS && originalPrice && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-orange-500"></span>
            POS Audit Trail
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            {}
            <div className="flex-1 bg-slate-50 rounded p-1 border border-slate-200">
              <div className="text-slate-500 font-medium mb-1">Before</div>
              <div className="font-semibold text-slate-900">
                {formatCurrency(originalPrice)}
              </div>
              {auditChangeType && (
                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">
                  {auditChangeType}
                </div>
              )}
            </div>

            {}
            <div className="text-slate-400 font-bold">→</div>

            {}
            <div className="flex-1 bg-green-50 rounded p-1 border border-green-200">
              <div className="text-green-700 font-medium mb-1">After</div>
              <div className="font-semibold text-green-900">
                {formatCurrency(finalPrice)}
              </div>
              <div className="text-[10px] text-green-600 mt-1 font-semibold">
                Saved: {formatCurrency(Math.max(0, originalPrice - finalPrice))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
