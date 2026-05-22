"use client";

import { memo } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductSize } from "@/features/business/store/models/response/product-response";

interface SizeSelectorProps {
  sizes: ProductSize[];
  selectedSize: ProductSize | null;
  onSizeSelect: (size: ProductSize) => void;
  getDisplayQuantity: (sizeId: string) => number;
  getQuantityForSize: (sizeId: string) => number;
  modifiedSizes: Set<string>;
}

function SizeSelectorComponent({
  sizes,
  selectedSize,
  onSizeSelect,
  getDisplayQuantity,
  getQuantityForSize,
  modifiedSizes,
}: SizeSelectorProps) {
  if (sizes.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="font-semibold mb-2 text-sm">Choose Size</h4>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isActive = selectedSize?.id === size.id;
          const sizeDisplayQty = getDisplayQuantity(size.id);
          const sizeCartQty = getQuantityForSize(size.id);
          const isModified = modifiedSizes.has(size.id) && sizeDisplayQty !== sizeCartQty;

          return (
            <button
              key={size.id}
              onClick={() => onSizeSelect(size)}
              className={cn(
                "relative border-2 rounded-lg px-3 py-2 transition-all cursor-pointer hover:border-primary",
                isActive
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border",
                isModified && "ring-2 ring-amber-400/50"
              )}
            >
              <div className="font-semibold text-xs">{size.name}</div>
              <div className="text-primary font-bold text-sm">
                {formatCurrency(size.finalPrice)}
              </div>
              {size.hasPromotion && (
                <div className="text-xs text-muted-foreground line-through">
                  {formatCurrency(size.price)}
                </div>
              )}
              {isActive && (
                <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
              {sizeDisplayQty > 0 && (
                <div
                  className={cn(
                    "absolute -top-1.5 -left-1.5 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold",
                    isModified ? "bg-amber-500" : "bg-green-500"
                  )}
                >
                  {sizeDisplayQty}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const SizeSelector = memo(SizeSelectorComponent);
