"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";

interface ProductInfoProps {
  product: ProductDetailResponseModel;
}

function ProductInfoComponent({ product }: ProductInfoProps) {
  const hasPromo = Boolean(product.hasPromotion);

  return (
    <div className="flex flex-col justify-between flex-1 space-y-1.5">
      <h3
        title={product.name}
        className="font-bold text-xs sm:text-[13px] line-clamp-2 leading-snug text-foreground group-hover:text-primary transition-colors min-h-[34px] tracking-tight"
      >
        {product.name}
      </h3>

      <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
        <span
          className={cn(
            "text-xs font-extrabold tracking-tight",
            hasPromo ? "text-red-500 dark:text-red-400" : "text-primary font-black"
          )}
        >
          {formatCurrency(product.displayPrice)}
        </span>

        {hasPromo && product.displayOriginPrice && (
          <span className="text-[11px] font-medium text-muted-foreground/80 line-through">
            {formatCurrency(product.displayOriginPrice)}
          </span>
        )}
      </div>
    </div>
  );
}

export const ProductInfo = memo(ProductInfoComponent);
