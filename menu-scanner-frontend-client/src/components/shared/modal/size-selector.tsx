"use client";

import { memo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductSize } from "@/features/business/store/models/response/product-response";

interface SizeSelectorProps {
  sizes: ProductSize[];
  selectedSize: ProductSize | null;
  onSizeSelect: (size: ProductSize) => void;
  getDisplayQuantity: (sizeId: string) => number;
  getQuantityForSize: (sizeId: string) => number;
  getTotalQuantityForSize?: (sizeId: string) => number;
  modifiedSizes: Set<string>;
}

function SizeSelectorComponent({
  sizes,
  selectedSize,
  onSizeSelect,
  getDisplayQuantity,
  getQuantityForSize,
  getTotalQuantityForSize,
  modifiedSizes,
}: SizeSelectorProps) {
  if (sizes.length === 0) return null;

  return (
    <div className="mb-3">
      <h4 className="font-semibold mb-2 text-xs text-foreground">Choose Size</h4>
      <div className="flex flex-wrap gap-1">
        {sizes.map((size) => {
          const isActive = selectedSize?.id === size.id;
          const isModified = modifiedSizes.has(size.id);
          const badgeQty = getTotalQuantityForSize ? getTotalQuantityForSize(size.id) : getDisplayQuantity(size.id);

          return (
            <button
              key={size.id}
              onClick={() => onSizeSelect(size)}
              className={cn(
                "relative border-2 rounded px-2.5 py-1 transition-all duration-200 cursor-pointer text-left min-w-[72px]",
                isActive
                  ? "border-primary bg-primary/8 shadow-md ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm",
                isModified && !isActive && "ring-2 ring-amber-400/50",
              )}
            >
              {/* Selected checkmark */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center shadow-sm z-10">
                  <Check className="h-2 w-2 text-white" />
                </div>
              )}

              {/* Cart quantity badge */}
              {badgeQty > 0 && (
                <div
                  className={cn(
                    "absolute -top-1 -left-1 min-w-[20px] h-3 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1 shadow-sm z-10",
                    isModified ? "bg-amber-500" : "bg-emerald-500",
                  )}
                >
                  {badgeQty}
                </div>
              )}

              <div className="font-semibold text-xs">{size.name}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className={cn("font-bold text-xs", isActive ? "text-primary" : "text-foreground")}>
                  {formatCurrency(size.finalPrice)}
                </div>
                {size.hasPromotion && (
                  <div className="text-[10px] text-muted-foreground/70 line-through">
                    {formatCurrency(size.price)}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const SizeSelector = memo(SizeSelectorComponent);
