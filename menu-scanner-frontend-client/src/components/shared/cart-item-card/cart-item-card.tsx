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
  promotionType?: string | null;
  promotionValue?: number | null;
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
    <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <Image
        src={sanitizeImageUrl(productImageUrl, appImages.NoImage)}
        alt={productName}
        fill
        className="object-cover"
      />
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 relative group">
      {/* Delete Button - Top Right with hover effect */}
      <button
        className="absolute top-3 right-3 h-10 w-10 rounded-lg flex items-center justify-center bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all duration-200 flex-shrink-0 shadow-md hover:shadow-lg"
        onClick={onRemove}
        title="Remove item"
      >
        <Trash2 className="h-5 w-5" />
      </button>

      <div className="flex gap-4">
        {/* Thumbnail */}
        {showLink ? (
          <Link href={`/products/${productId}`} className="flex-shrink-0 group/link">
            {ImageComponent}
          </Link>
        ) : (
          ImageComponent
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pr-2">
          {/* Product Name + Promotion Badge */}
          <div className="flex items-center gap-2 min-w-0 mb-2">
            {showLink ? (
              <Link href={`/products/${productId}`}>
                <h3 className="font-semibold text-sm leading-tight text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                  {productName}
                </h3>
              </Link>
            ) : (
              <h3 className="font-semibold text-sm leading-tight text-slate-900 line-clamp-1">
                {productName}
              </h3>
            )}
            {hasPromotion && (
              <Badge className="text-[10px] px-2 py-0.5 leading-none flex-shrink-0 bg-red-100 text-red-700 border-0 font-semibold">
                {promotionType === "PERCENTAGE"
                  ? `-${promotionValue}%`
                  : `-${formatCurrency(promotionValue || 0)}`}
              </Badge>
            )}
          </div>

          {/* Size Badge */}
          {sizeName && (
            <div className="mb-2">
              <span className="text-xs font-medium text-slate-600 bg-blue-50 px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap inline-block border border-blue-200">
                {sizeName}
              </span>
            </div>
          )}

          {/* Price Info + Qty controls */}
          {showControls && (
            <div className="flex items-center justify-between gap-3">
              {/* Price Display */}
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-base text-slate-900">{formatCurrency(finalPrice)}</span>
                {hasPromotion && currentPrice > finalPrice && (
                  <span className="text-xs text-slate-500 line-through font-medium">{formatCurrency(currentPrice)}</span>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1">
                <CustomButton
                  size="icon"
                  className="h-8 w-8 shrink-0 bg-slate-100 text-slate-700 hover:bg-red-500 hover:text-white transition-all duration-200 border-0"
                  onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                  title="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </CustomButton>
                <div className="flex-1 text-center h-8 w-12 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 font-bold text-sm rounded-lg border border-blue-300 flex items-center justify-center shadow-sm">
                  {quantity}
                </div>
                <CustomButton
                  size="icon"
                  className="h-8 w-8 shrink-0 bg-slate-100 text-slate-700 hover:bg-blue-500 hover:text-white transition-all duration-200 border-0"
                  onClick={() => onQuantityChange(quantity + 1)}
                  title="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
