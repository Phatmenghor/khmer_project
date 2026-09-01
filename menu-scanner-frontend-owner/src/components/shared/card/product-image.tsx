"use client";

import { memo } from "react";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/shared/image/smart-image";
import { CustomButton } from "../button/custom-button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import { isPromotionActive } from "@/constants/status/status";

interface ProductImageProps {
  product: ProductDetailResponseModel;
  imageUrl: string;
  isOutOfStock: boolean;
  isFavorited?: boolean;
  loading?: "eager" | "lazy";
  onImageLoad?: () => void;
  onImageError?: () => void;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

function ProductImageComponent({
  product,
  imageUrl,
  isOutOfStock,
  isFavorited,
  loading = "lazy",
  onImageLoad,
  onImageError,
  onToggleFavorite,
}: ProductImageProps) {
  const hasPromo =
    isPromotionActive(product?.hasPromotion) &&
    typeof product?.displayOriginPrice === "number" &&
    product.displayOriginPrice > product.displayPrice &&
    (product?.displayPromotionValue ?? 0) > 0;

  return (
    <div className="relative aspect-square overflow-hidden bg-gradient-to-tr from-muted/40 via-muted/20 to-background">
      <SmartImage
        src={imageUrl}
        alt={product.name || "Product Image"}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        loading={loading}
        className="group-hover:scale-108 transition-transform duration-500 ease-out object-cover"
        onLoad={onImageLoad}
        onError={onImageError}
      />

      {/* Subtle image gradient overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />

      {/* Promotion Badge */}
      {hasPromo && (
        <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md border border-white/20 tracking-wider uppercase">
            {product.displayPromotionType === "PERCENTAGE"
              ? `-${product.displayPromotionValue}%`
              : `-${formatCurrency(product.displayPromotionValue)}`}
          </span>
        </div>
      )}

      {/* Out of Stock Overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none">
          <Badge variant="destructive" className="text-[11px] font-extrabold px-2.5 py-1 uppercase tracking-wider shadow-lg">
            Out of Stock
          </Badge>
        </div>
      )}



      {/* Sizes / Add-ons Pill Badges */}
      <div className="absolute bottom-1.5 left-1.5 z-10 pointer-events-none flex flex-wrap gap-1">
        {product.hasSizes && (
          <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-background/85 backdrop-blur-md text-foreground border border-border/60 shadow-2xs">
            Sizes
          </span>
        )}
        {product.customizations && product.customizations.length > 0 && (
          <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-background/85 backdrop-blur-md text-foreground border border-border/60 shadow-2xs">
            Add-ons
          </span>
        )}
      </div>
    </div>
  );
}

export const ProductImage = memo(ProductImageComponent);
