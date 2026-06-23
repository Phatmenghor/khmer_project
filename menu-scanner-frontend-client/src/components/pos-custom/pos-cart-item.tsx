"use client";

import { Plus, Minus, X, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { SmartImage } from "@/components/shared/image/smart-image";
import { formatCurrency } from "@/utils/common/currency-format";

interface POSCartItemProps {
  id: string;
  productName: string;
  productImageUrl: string;
  sizeName?: string | null;
  currentPrice: number;
  finalPrice: number;
  quantity: number;
  hasPromotion?: boolean;
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
    <div className="bg-white border border-slate-200 rounded p-3 hover:shadow-md transition-all duration-200 relative group">
      {}
      <CustomButton
        size="icon"
        variant="outline"
        className="absolute top-2 right-2 h-5 w-5 shrink-0 text-red-600 hover:bg-red-100"
        onClick={onRemove}
        title="Remove item"
      >
        <X className="h-3 w-3" />
      </CustomButton>

      <div className="flex gap-3">
        {}
        <div className="relative w-[80px] h-[80px] rounded overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex-shrink-0 shadow-sm">
          <SmartImage src={productImageUrl} alt={productName} fill />

          {}
          {hasPromotion && (
            <div className="absolute top-1 left-1 z-10 pointer-events-none">
              <Badge variant="destructive" className="text-[9px] font-bold px-1 py-0.5 shadow-md">
                {promotionType === "PERCENTAGE"
                  ? `-${promotionValue}%`
                  : `-${formatCurrency(promotionValue || 0)}`}
              </Badge>
            </div>
          )}
        </div>

        {}
        <div className="flex-1 min-w-0 flex flex-col justify-between pr-1">
          {}
          <h3 className="font-semibold text-xs leading-tight text-slate-900 line-clamp-1 mb-1">
            {productName}
          </h3>

          {}
          <div className="mb-1 flex items-center gap-1">
            {sizeName && (
              <span className="text-xs font-medium text-primary bg-primary/5 px-1 py-1 rounded-full border border-primary/30 whitespace-nowrap">
                {sizeName}
              </span>
            )}
            {customizations && customizations.length > 0 && (
              <span className="text-xs font-medium text-green-700 bg-green-50 px-1 py-1 rounded-full border border-green-200 whitespace-nowrap">
                Add-ons ×{customizations.length}
              </span>
            )}
          </div>

          {}
          <div className="flex items-center justify-between gap-2">
            {}
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-xs text-slate-900">
                {formatCurrency(finalPrice)}
              </span>
              {hasPromotion && currentPrice > finalPrice && (
                <span className="text-xs text-slate-500 line-through font-medium">
                  {formatCurrency(currentPrice)}
                </span>
              )}
            </div>

            {}
            <div className="flex items-center gap-1">
              {}
              <CustomButton
                size="icon"
                variant="outline"
                className="h-5 w-5 shrink-0 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-primary"
                onClick={onEdit}
                title="Edit size"
              >
                <Edit2 className="h-2.5 w-2.5" />
              </CustomButton>

              {}
              <CustomButton
                size="icon"
                variant="outline"
                className="h-5 w-5 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onQuantityChange(-1)}
              >
                <Minus className="h-2 w-2" />
              </CustomButton>

              {}
              <div className="flex-1 text-center h-5 bg-primary/10 text-primary font-semibold text-xs rounded border border-primary/20 flex items-center justify-center w-7">
                {quantity}
              </div>

              {}
              <CustomButton
                size="icon"
                variant="outline"
                className="h-5 w-5 shrink-0 hover:bg-primary hover:text-primary-foreground"
                onClick={() => onQuantityChange(1)}
              >
                <Plus className="h-2 w-2" />
              </CustomButton>
            </div>
          </div>
        </div>
      </div>

      {}
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
