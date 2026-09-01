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
    <div className="bg-card border border-border/80 hover:border-primary/40 rounded-2xl p-3 sm:p-3.5 shadow-2xs hover:shadow-md transition-all duration-300 relative group">
      {/* Remove button */}
      <CustomButton
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
        onClick={onRemove}
        title="Remove item"
      >
        <X className="h-3.5 w-3.5" />
      </CustomButton>

      <div className="flex gap-3">
        {/* Image */}
        <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden bg-gradient-to-br from-muted/40 via-muted/20 to-card border border-border/60 flex-shrink-0 shadow-2xs">
          {showLink ? (
            <Link href={`/products/${productId}`}>
              <SmartImage src={productImageUrl} alt={productName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            </Link>
          ) : (
            <SmartImage src={productImageUrl} alt={productName} fill className="object-cover" />
          )}
          {hasPromotion && (
            <div className="absolute top-1 left-1 z-10 pointer-events-none">
              <Badge variant="destructive" className="text-[9px] font-extrabold px-1.5 py-0.5 shadow-md">
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
          <div>
            <h3 className="font-extrabold text-xs sm:text-xs leading-tight text-foreground line-clamp-1 mb-1">
              {productName}
            </h3>

            {/* Size + customization pills */}
            {(sizeName || (customizations && customizations.length > 0)) && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {sizeName && (
                  <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 whitespace-nowrap">
                    {sizeName}
                  </span>
                )}
                {customizations?.map((c) => (
                  <span
                    key={c.productCustomizationId}
                    className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/60 whitespace-nowrap"
                  >
                    {c.name} (+{formatCurrency(c.priceAdjustment ?? 0)})
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Price + qty controls */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-xs text-foreground">
                {formatCurrency(finalPrice)}
              </span>
              {hasPromotion && currentPrice > finalPrice && (
                <span className="text-[10px] text-muted-foreground line-through">
                  {formatCurrency(currentPrice)}
                </span>
              )}
            </div>

            {showControls ? (
              <div className="flex items-center gap-1 bg-muted/30 p-0.5 rounded-xl border border-border/50">
                <CustomButton
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-lg hover:bg-muted text-foreground cursor-pointer"
                  onClick={() => {
                    const next = quantity - 1;
                    if (next === 0) onRemove();
                    else onQuantityChange(next);
                  }}
                >
                  <Minus className="h-3 w-3" />
                </CustomButton>

                <span className="w-6 text-center text-xs font-extrabold text-primary">
                  {quantity}
                </span>

                <CustomButton
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-lg hover:bg-muted text-foreground cursor-pointer"
                  onClick={() => onQuantityChange(quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </CustomButton>
              </div>
            ) : (
              <span className="text-xs font-extrabold text-primary bg-primary/10 border border-primary/20 rounded-lg px-2 py-0.5">
                x{quantity}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
