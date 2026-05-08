"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";

export interface CartItemCardProps {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId?: string | null;
  sizeName?: string | null;
  currentPrice: number;
  finalPrice: number;
  quantity: number;
  totalPrice: number;
  hasPromotion?: boolean;
  promotionType?: string | null;
  promotionValue?: number | null;
  // Handlers
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  // Options
  showLink?: boolean;
  showControls?: boolean;
  isUpdating?: boolean;
}

export function CartItemCard({
  id,
  productId,
  productName,
  productImageUrl,
  sizeName,
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
  isUpdating = false,
}: CartItemCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 relative group">
      {/* Delete Button - Top Right */}
      <CustomButton
        size="icon"
        variant="outline"
        className="absolute top-3 right-3 h-8 w-8 shrink-0 text-red-600 hover:bg-red-100"
        onClick={onRemove}
        title="Remove item"
      >
        <X className="h-4 w-4" />
      </CustomButton>

      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex-shrink-0 shadow-sm">
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

          {/* Promotion Badge - Top Left Corner */}
          {hasPromotion && (
            <div className="absolute top-1 left-1 z-10 pointer-events-none">
              <Badge variant="destructive" className="text-[9px] font-bold px-1.5 py-0.5 shadow-md">
                {promotionType === "PERCENTAGE"
                  ? `-${promotionValue}%`
                  : `-${formatCurrency(promotionValue || 0)}`}
              </Badge>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pr-2">
          {/* Name */}
          <h3 className="font-semibold text-sm leading-tight text-slate-900 line-clamp-1 mb-2">
            {productName}
          </h3>

          {/* Size Badge */}
          {sizeName && (
            <div className="mb-2">
              <span className="text-xs font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-full border border-primary/30 whitespace-nowrap">
                {sizeName}
              </span>
            </div>
          )}

          {/* Price & Quantity Controls */}
          {showControls && (
            <div className="flex items-center justify-between gap-3">
              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-base text-slate-900">
                  {formatCurrency(finalPrice)}
                </span>
                {hasPromotion && currentPrice > finalPrice && (
                  <span className="text-xs text-slate-500 line-through font-medium">
                    {formatCurrency(currentPrice)}
                  </span>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1">
                {/* Minus Button */}
                <CustomButton
                  size="icon"
                  variant="outline"
                  disabled={isUpdating}
                  className="h-8 w-8 shrink-0 hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    const newQuantity = quantity - 1;
                    if (newQuantity === 0) {
                      onRemove();
                    } else {
                      onQuantityChange(newQuantity);
                    }
                  }}
                >
                  {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Minus className="h-3 w-3" />}
                </CustomButton>

                {/* Quantity Display */}
                <div className={`flex-1 text-center h-8 font-semibold text-sm rounded-lg border flex items-center justify-center w-10 transition-all ${
                  isUpdating
                    ? "bg-muted border-muted-foreground/30 text-muted-foreground"
                    : "bg-primary/10 text-primary border-primary/20"
                }`}>
                  {quantity}
                </div>

                {/* Plus Button */}
                <CustomButton
                  size="icon"
                  variant="outline"
                  disabled={isUpdating}
                  className="h-8 w-8 shrink-0 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onQuantityChange(quantity + 1)}
                >
                  {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
