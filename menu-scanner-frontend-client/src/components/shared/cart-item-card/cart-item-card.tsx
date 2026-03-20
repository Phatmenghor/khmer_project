"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2 } from "lucide-react";
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
  promotionType?: string;
  promotionValue?: number;
  // Handlers
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  // Options
  showLink?: boolean;
  showControls?: boolean;
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
}: CartItemCardProps) {
  const ImageComponent = (
    <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden bg-muted border flex-shrink-0">
      <Image
        src={sanitizeImageUrl(productImageUrl, appImages.NoImage)}
        alt={productName}
        fill
        className="object-cover"
      />
    </div>
  );

  return (
    <div className="bg-card border rounded-2xl p-3 sm:p-4 hover:shadow-sm transition-shadow">
      <div className="flex gap-3">
        {/* Thumbnail */}
        {showLink ? (
          <Link href={`/products/${productId}`} className="flex-shrink-0">
            {ImageComponent}
          </Link>
        ) : (
          ImageComponent
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Product Name + Size + Promotion */}
          <div className="flex items-center gap-2 min-w-0 mb-2">
            {showLink ? (
              <Link href={`/products/${productId}`}>
                <h3 className="font-medium text-sm leading-snug hover:text-primary transition-colors line-clamp-1">
                  {productName}
                </h3>
              </Link>
            ) : (
              <h3 className="font-medium text-sm leading-snug line-clamp-1">
                {productName}
              </h3>
            )}
            {sizeName && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
                {sizeName}
              </span>
            )}
            {hasPromotion && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 leading-none flex-shrink-0">
                {promotionType === "PERCENTAGE"
                  ? `-${promotionValue}%`
                  : `-${formatCurrency(promotionValue || 0)}`}
              </Badge>
            )}
          </div>

          {/* Price Info */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-sm text-primary">{formatCurrency(finalPrice)}</span>
            {hasPromotion && currentPrice > finalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatCurrency(currentPrice)}</span>
            )}
          </div>

          {/* Qty controls + Total + Delete */}
          {showControls && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 w-full max-w-[140px]">
                <CustomButton
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                >
                  <Minus className="h-3 w-3" />
                </CustomButton>
                <div className="flex-1 text-center h-8 bg-primary/10 text-primary font-semibold text-sm rounded-lg border border-primary/20 flex items-center justify-center">
                  {quantity}
                </div>
                <CustomButton
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shrink-0 hover:bg-primary hover:text-primary-foreground"
                  onClick={() => onQuantityChange(quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </CustomButton>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold whitespace-nowrap">{formatCurrency(totalPrice)}</span>
                <button
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
                  onClick={onRemove}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
