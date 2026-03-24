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
    <div className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md transition-all duration-200 flex items-center gap-2">
      {/* Edit Button - Left */}
      <CustomButton
        size="icon"
        variant="outline"
        className="h-8 w-8 shrink-0 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-primary"
        onClick={onEdit}
        title="Edit"
      >
        <Edit2 className="h-4 w-4" />
      </CustomButton>

      {/* Product Image */}
      <div className="relative w-[72px] h-[72px] rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex-shrink-0">
        <Image
          src={sanitizeImageUrl(productImageUrl, appImages.NoImage)}
          alt={productName}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Details - Center */}
      <div className="flex-1 min-w-0">
        {/* Name & Badge */}
        <div className="flex items-center gap-2 min-w-0 mb-1">
          <h3 className="font-semibold text-xs leading-tight text-slate-900 line-clamp-1">
            {productName}
          </h3>
          {hasPromotion && (
            <Badge className="text-[9px] px-1.5 py-0 leading-none flex-shrink-0 bg-red-100 text-red-700 border-0 font-semibold">
              {promotionType === "PERCENTAGE"
                ? `-${promotionValue}%`
                : `-${formatCurrency(promotionValue || 0)}`}
            </Badge>
          )}
        </div>

        {/* Size & Price Row */}
        <div className="flex items-center gap-2 mb-2">
          {sizeName && (
            <span className="text-[10px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/30 whitespace-nowrap">
              {sizeName}
            </span>
          )}
          <span className="text-sm font-bold text-slate-900">
            {formatCurrency(finalPrice)}
          </span>
          {hasPromotion && currentPrice > finalPrice && (
            <span className="text-xs text-slate-500 line-through font-medium">
              {formatCurrency(currentPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Quantity Controls - Right (Before Delete) */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <CustomButton
          size="icon"
          variant="outline"
          className="h-7 w-7 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => onQuantityChange(-1)}
          title="Decrease"
        >
          <Minus className="h-3 w-3" />
        </CustomButton>
        <div className="w-8 h-7 bg-primary/10 text-primary font-bold text-xs rounded border border-primary/20 flex items-center justify-center">
          {quantity}
        </div>
        <CustomButton
          size="icon"
          variant="outline"
          className="h-7 w-7 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground"
          onClick={() => onQuantityChange(1)}
          title="Increase"
        >
          <Plus className="h-3 w-3" />
        </CustomButton>
      </div>

      {/* Delete Button - Far Right */}
      <CustomButton
        size="icon"
        variant="outline"
        className="h-8 w-8 shrink-0 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
        onClick={onRemove}
        title="Remove"
      >
        <X className="h-4 w-4" />
      </CustomButton>
    </div>
  );
}
