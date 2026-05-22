"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";

interface ProductInfoProps {
  product: ProductDetailResponseModel;
}

function ProductInfoComponent({ product }: ProductInfoProps) {
  return (
    <div>
      <h3 className="font-medium text-sm line-clamp-2 mb-2 leading-snug min-h-[40px]">
        {product.name}
      </h3>

      <div className="flex flex-col">
        <span
          className={cn(
            "text-xs text-muted-foreground line-through",
            !product.hasPromotion && "invisible"
          )}
        >
          {formatCurrency(product.displayOriginPrice)}
        </span>
        <span className="text-base font-bold text-primary">
          {formatCurrency(product.displayPrice)}
        </span>
      </div>
    </div>
  );
}

export const ProductInfo = memo(ProductInfoComponent);
