"use client";

import Image from "next/image";
import { Plus, Minus, X, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";

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
  onQuantityChange,
  onRemove,
  onEdit,
}: POSCartItemProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 relative group">
      {/* Delete Button */}
      <CustomButton
        size="icon"
        variant="outline"
        className="absolute top-3 right-3 h-8 w-8 shrink-0 text-red-600 hover:bg-red-100"
        onClick={onRemove}
        title="Remove item"
      >
        <X className="h-4 w-4" />
      </CustomButton>

      {/* Edit Button */}
      <CustomButton
        size="icon"
        variant="outline"
        className="absolute top-3 right-14 h-8 w-8 shrink-0 text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onEdit}
        title="Edit size"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </CustomButton>

      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex-shrink-0 shadow-sm">
          <Image
            src={sanitizeImageUrl(productImageUrl, appImages.NoImage)}
            alt={productName}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pr-2">
          {/* Name & Badge */}
          <div className="flex items-center gap-2 min-w-0 mb-2">
            <h3 className="font-semibold text-sm leading-tight text-slate-900 line-clamp-1">
              {productName}
            </h3>
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
              <span className="text-xs font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-full inline-block border border-primary/30 whitespace-nowrap">
                {sizeName}
              </span>
            </div>
          )}

          {/* Price & Quantity */}
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
              <CustomButton
                size="icon"
                variant="outline"
                className="h-8 w-8 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onQuantityChange(-1)}
              >
                <Minus className="h-3 w-3" />
              </CustomButton>
              <div className="flex-1 text-center h-8 bg-primary/10 text-primary font-semibold text-sm rounded-lg border border-primary/20 flex items-center justify-center w-10">
                {quantity}
              </div>
              <CustomButton
                size="icon"
                variant="outline"
                className="h-8 w-8 shrink-0 hover:bg-primary hover:text-primary-foreground"
                onClick={() => onQuantityChange(1)}
              >
                <Plus className="h-3 w-3" />
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
