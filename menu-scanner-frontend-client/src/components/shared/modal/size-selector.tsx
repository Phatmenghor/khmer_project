"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { memo } from "react";
import { Check, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductSize } from "@/features/business/store/models/response/product-response";
import { Badge } from "@/components/ui/badge";

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
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" /> Choose Size
        </h4>
        {selectedSize && (
          <span className="text-[11px] font-bold text-primary truncate">
            {selectedSize.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sizes.map((size) => {
          const isActive = selectedSize?.id === size.id;
          const isModified = modifiedSizes.has(size.id);
          const badgeQty = getTotalQuantityForSize ? getTotalQuantityForSize(size.id) : getDisplayQuantity(size.id);
          const isOutOfStock = size.totalStock !== undefined && size.totalStock <= 0;

          return (
            <CustomButton
              variant="unstyled"
              size="unstyled"
              key={size.id}
              onClick={() => onSizeSelect(size)}
              className={cn(
                "relative border rounded-xl p-2.5 transition-all duration-200 cursor-pointer text-left shadow-2xs hover:shadow-xs hover:scale-[1.01] flex flex-col justify-between overflow-hidden min-h-[58px]",
                isActive
                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/25 shadow-xs"
                  : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30 text-foreground",
                isModified && !isActive && "ring-1.5 ring-amber-400/50 border-amber-300",
                isOutOfStock && "opacity-60 bg-muted/40 cursor-not-allowed"
              )}
            >
              {/* Selected checkmark badge */}
              {isActive && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-2xs z-10">
                  <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />
                </div>
              )}

              {/* Cart quantity badge */}
              {badgeQty > 0 && (
                <div
                  className={cn(
                    "absolute -top-1 -left-1 min-w-[18px] h-4 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold px-1 shadow-xs z-10 leading-none",
                    isModified ? "bg-amber-500" : "bg-emerald-500"
                  )}
                >
                  {badgeQty}
                </div>
              )}

              <div className="flex items-center justify-between gap-1 w-full">
                <span className="font-extrabold text-xs truncate pr-3">{size.name}</span>
                {isOutOfStock && (
                  <Badge variant="destructive" className="text-[9px] font-bold px-1.5 py-0">
                    Sold Out
                  </Badge>
                )}
              </div>

              <div className="flex items-baseline gap-1 mt-1">
                <span className={cn("font-extrabold text-xs", isActive ? "text-primary" : "text-foreground")}>
                  {formatCurrency(size.finalPrice)}
                </span>
                {size.hasPromotion && size.price > size.finalPrice && (
                  <span className="text-[10px] text-muted-foreground/70 line-through">
                    {formatCurrency(size.price)}
                  </span>
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
