"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";

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
  hasPromotion?: boolean;
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
    <div className="bg-white border border-slate-100 rounded-lg px-2.5 py-2 hover:border-slate-200 hover:shadow-sm transition-all duration-150 relative">
      {/* Remove button */}
      <CustomButton
        size="icon"
        variant="ghost"
        className="absolute top-1.5 right-1.5 h-4 w-4 shrink-0 text-slate-300 hover:text-red-400 hover:bg-red-50"
        onClick={onRemove}
        title="Remove item"
      >
        <X className="h-2.5 w-2.5" />
      </CustomButton>

      <div className="flex gap-2">
        {/* Image */}
        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
          {showLink ? (
            <Link href={`/products/${productId}`}>
              <Image
                src={sanitizeImageUrl(productImageUrl, appImages.NoImage)}
                alt={productName}
                fill
                className="object-cover"
              />
            </Link>
          ) : (
            <Image
              src={sanitizeImageUrl(productImageUrl, appImages.NoImage)}
              alt={productName}
              fill
              className="object-cover"
            />
          )}
          {hasPromotion && (
            <div className="absolute top-0.5 left-0.5 z-10 pointer-events-none">
              <Badge variant="destructive" className="text-[8px] font-bold px-1 py-0 leading-4 shadow-sm">
                {promotionType === "PERCENTAGE"
                  ? `-${promotionValue}%`
                  : `-${formatCurrency(promotionValue || 0)}`}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-5">
          {/* Name + quantity badge */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-semibold text-[11px] leading-tight text-slate-800 line-clamp-1 flex-1">
              {productName}
            </h3>
            <span className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 leading-none">
              x{quantity}
            </span>
          </div>

          {/* Size + customizations */}
          {(sizeName || (customizations && customizations.length > 0)) && (
            <div className="flex flex-wrap gap-1 mb-1">
              {sizeName && (
                <span className="text-[9px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100 whitespace-nowrap leading-none">
                  {sizeName}
                </span>
              )}
              {customizations?.map((c) => (
                <span
                  key={c.productCustomizationId}
                  className="text-[9px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 whitespace-nowrap leading-none"
                >
                  {c.name}{c.priceAdjustment > 0 ? ` +${formatCurrency(c.priceAdjustment)}` : ""}
                </span>
              ))}
            </div>
          )}

          {/* Price row + qty controls */}
          {showControls && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-[11px] text-slate-900">
                  {formatCurrency(totalPrice)}
                </span>
                {hasPromotion && currentPrice > finalPrice && (
                  <span className="text-[9px] text-slate-400 line-through">
                    {formatCurrency(currentPrice * quantity)}
                  </span>
                )}
                <span className="text-[9px] text-slate-400">
                  ({formatCurrency(finalPrice)} ea)
                </span>
              </div>

              {/* Qty stepper */}
              <div className="flex items-center gap-0.5">
                <CustomButton
                  size="icon"
                  variant="outline"
                  className="h-4 w-4 shrink-0 border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                  onClick={() => {
                    const next = quantity - 1;
                    if (next === 0) onRemove();
                    else onQuantityChange(next);
                  }}
                >
                  <Minus className="h-2 w-2" />
                </CustomButton>

                <div className="h-4 w-6 bg-primary text-primary-foreground font-bold text-[10px] rounded flex items-center justify-center">
                  {quantity}
                </div>

                <CustomButton
                  size="icon"
                  variant="outline"
                  className="h-4 w-4 shrink-0 border-slate-200 hover:border-primary hover:bg-primary/10 hover:text-primary"
                  onClick={() => onQuantityChange(quantity + 1)}
                >
                  <Plus className="h-2 w-2" />
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
