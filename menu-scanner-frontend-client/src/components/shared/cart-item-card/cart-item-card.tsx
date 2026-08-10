"use client";

import Link from "next/link";
import { Plus, Minus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { SmartImage } from "@/components/shared/image/smart-image";
import { formatCurrency } from "@/utils/common/currency-format";
import { getPromotionBadgeText } from "@/utils/common/promotion-format";

export interface CartItemCustomization {
  id: string;
  productCustomizationId: string;
  name: string;
  priceAdjustment: number;
}

export interface CartItemCardProps {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId?: string | null;
  sizeName?: string | null;
  customizations?: CartItemCustomization[];
  currentPrice: number;
  finalPrice: number;
  quantity: number;
  totalPrice: number;
  hasPromotion?: boolean | string;
  promotionType?: string | null;
  promotionValue?: number | null;

  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;

  showLink?: boolean;
  showControls?: boolean;
}

export function CartItemCard({
  id,
  productId,
  productName,
  productImageUrl,
  sizeName,
  customizations,
  currentPrice,
  finalPrice,
  quantity,
  totalPrice,
  hasPromotion,
  promotionType,
  promotionValue,
  onQuantityChange,
  onRemove,
  showLink = true,
  showControls = true,
}: CartItemCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded p-3 hover:shadow-md transition-all duration-200 relative">
      {/* Remove button */}
      <CustomButton
        size="icon"
        variant="ghost"
        className="absolute top-1.5 right-1.5 h-5 w-5 shrink-0 text-slate-300 hover:text-red-400 hover:bg-red-50"
        onClick={onRemove}
        title="Remove item"
      >
        <X className="h-3 w-3" />
      </CustomButton>

      <div className="flex gap-3">
        {/* Image */}
        <div className="relative w-[80px] h-[80px] rounded overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex-shrink-0 shadow-sm">
          {showLink ? (
            <Link href={`/products/${productId}`}>
              <SmartImage src={productImageUrl} alt={productName} fill />
            </Link>
          ) : (
            <SmartImage src={productImageUrl} alt={productName} fill />
          )}
          {hasPromotion && (
            <div className="absolute top-1 left-1 z-10 pointer-events-none">
              <Badge variant="destructive" className="text-[9px] font-bold px-1 py-0.5 shadow-md">
                {getPromotionBadgeText(
                  hasPromotion,
                  promotionType,
                  promotionValue
                )}
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pr-5">
          <h3 className="font-semibold text-xs leading-tight text-slate-900 line-clamp-1 mb-1">
            {productName}
          </h3>

          {/* Size + customization pills */}
          {(sizeName || (customizations && customizations.length > 0)) && (
            <div className="flex flex-wrap gap-1 mb-1">
              {sizeName && (
                <span className="text-xs font-medium text-primary bg-primary/5 px-1 py-1 rounded-full border border-primary/30 whitespace-nowrap">
                  {sizeName}
                </span>
              )}
              {customizations?.map((c) => (
                <span
                  key={c.productCustomizationId}
                  className="text-xs font-medium text-muted-foreground bg-muted px-1 py-1 rounded-full border border-border whitespace-nowrap"
                >
                  {c.name} (+{formatCurrency(c.priceAdjustment ?? 0)})
                </span>
              ))}
            </div>
          )}

          {/* Price + qty controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-xs text-slate-900">
                {formatCurrency(finalPrice)}
              </span>
              {hasPromotion && currentPrice > finalPrice && (
                <span className="text-[10px] text-slate-400 line-through">
                  {formatCurrency(currentPrice)}
                </span>
              )}
            </div>

            {showControls ? (
              <div className="flex items-center gap-1">
                <CustomButton
                  size="icon"
                  variant="outline"
                  className="h-5 w-5 shrink-0 border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                  onClick={() => {
                    const next = quantity - 1;
                    if (next === 0) onRemove();
                    else onQuantityChange(next);
                  }}
                >
                  <Minus className="h-2.5 w-2.5" />
                </CustomButton>
                <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 leading-none">
                  x{quantity}
                </span>
                <CustomButton
                  size="icon"
                  variant="outline"
                  className="h-5 w-5 shrink-0 border-slate-200 hover:border-primary hover:bg-primary/10 hover:text-primary"
                  onClick={() => onQuantityChange(quantity + 1)}
                >
                  <Plus className="h-2.5 w-2.5" />
                </CustomButton>
              </div>
            ) : (
              <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 leading-none">
                x{quantity}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
