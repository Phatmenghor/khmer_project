"use client";

import { memo } from "react";
import Image from "next/image";
import { Ruler, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomButton } from "../button/custom-button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";

interface ProductImageProps {
  product: ProductDetailResponseModel;
  imageUrl: string;
  imageLoaded: boolean;
  imageError: boolean;
  isOutOfStock: boolean;
  isFavorited: boolean;
  loading?: "eager" | "lazy";
  onImageLoad: () => void;
  onImageError: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

function ProductImageComponent({
  product,
  imageUrl,
  imageLoaded,
  imageError,
  isOutOfStock,
  isFavorited,
  loading = "lazy",
  onImageLoad,
  onImageError,
  onToggleFavorite,
}: ProductImageProps) {
  return (
    <div className="relative aspect-square overflow-hidden bg-muted/30">
      {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}

      <Image
        src={imageError ? "/assets/image/no-image.png" : imageUrl}
        alt={product.name || "Product Image"}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        loading={loading}
        className={cn(
          "object-cover transition-all duration-300 group-hover:scale-105",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={onImageLoad}
        onError={onImageError}
      />

      {/* Promotion Badge */}
      {product?.hasPromotion && (
        <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
          <Badge variant="destructive" className="text-xs font-bold px-1.5 py-0.5 shadow-md">
            {product.displayPromotionType === "PERCENTAGE"
              ? `-${product.displayPromotionValue}%`
              : `-${formatCurrency(product.displayPromotionValue)}`}
          </Badge>
        </div>
      )}

      {/* Out of Stock */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center pointer-events-none">
          <Badge variant="secondary" className="text-xs font-semibold px-2 py-1">
            Out of Stock
          </Badge>
        </div>
      )}

      {/* Favorite Button */}
      <div className="absolute top-1.5 right-1.5 z-20">
        <CustomButton
          size="icon"
          variant="secondary"
          className={cn(
            "h-5 w-5 rounded-full shadow-md transition-all duration-150",
            isFavorited
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/90 hover:bg-red-50 hover:text-red-500"
          )}
          onClick={onToggleFavorite}
        >
          <svg
            className={cn("h-3 w-3 transition-all duration-150", isFavorited && "fill-current")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </CustomButton>
      </div>

      {/* Sizes/Add-ons Badge */}
      {(product.hasSizes || (product.customizations && product.customizations.length > 0)) && (
        <div className="absolute bottom-1.5 left-1.5 z-10 pointer-events-none">
          <Badge variant="secondary" className="text-xs font-medium px-1.5 py-0.5 shadow-sm bg-background/90 backdrop-blur-sm gap-1">
            {product.hasSizes ? (
              <>
                <Ruler className="h-2 w-2" />
                Sizes
              </>
            ) : (
              <>
                <Package className="h-2 w-2" />
                Add-ons
              </>
            )}
          </Badge>
        </div>
      )}
    </div>
  );
}

export const ProductImage = memo(ProductImageComponent);
