"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
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
             <CustomButton variant="unstyled" size="unstyled"
              key={size.id}
              onClick={() => onSizeSelect(size)}
              className={cn(
                "relative border rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer text-left min-w-[80px] shadow-2xs hover:shadow-xs hover:scale-[1.02]",
                isActive
                  ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary/30"
                  : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/10",
                isModified && !isActive && "ring-1.5 ring-amber-400/50 border-amber-300",
              )}
            >
              {/* Selected checkmark */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center shadow-xs z-10">
                  <Check className="h-2 w-2 text-white stroke-[3px]" />
                </div>
              )}

              {/* Cart quantity badge */}
              {badgeQty > 0 && (
                <div
                  className={cn(
                    "absolute -top-1 -left-1 min-w-[18px] h-4 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold px-1 shadow-xs z-10 leading-none",
                    isModified ? "bg-amber-500" : "bg-emerald-500",
                  )}
                >
                  {badgeQty}
                </div>
              )}

              <div className="flex items-center justify-between gap-1">
                <div className="font-semibold text-xs">{size.name}</div>
                {size.totalStock !== undefined && size.totalStock <= 0 && (
                  <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1 py-0.2 rounded border border-red-200">
                    Out of Stock
                  </span>
                )}
              </div>
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
            </CustomButton>
          );
        })}
      </div>
    </div>
  );
}

export const SizeSelector = memo(SizeSelectorComponent);
