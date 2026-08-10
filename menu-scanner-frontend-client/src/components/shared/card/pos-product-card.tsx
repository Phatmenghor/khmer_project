"use client";

import { memo, useCallback, useState } from "react";
import { useAppSelector } from "@/store";
import { ShoppingCart, Plus, Minus, Ruler, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/shared/image/smart-image";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { getPromotionBadgeText } from "@/utils/common/promotion-format";
import { CustomButton } from "../button/custom-button";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import { PromotionType, PromotionStatus } from "@/constants/status/status";
import { selectPOSProductQuantity } from "@/features/business/store/selectors/pos-cart-selectors";

import { appImages } from "@/constants/app-resource/icons/app-images";

interface POSProductCardProps {
  product: ProductDetailResponseModel;
  onAddClick: (product: ProductDetailResponseModel) => void;
  onQuantityChange: (productId: string, delta: number) => void;
}

function POSProductCardComponent({
  product,
  onAddClick,
  onQuantityChange,
}: POSProductCardProps) {
  const productId = product?.id;

  const quantity = useAppSelector((state) =>
    selectPOSProductQuantity(state, productId || "")
  );

  const handleIncrement = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const hasCustomizations = product.customizations && product.customizations.length > 0;
    if (product.hasSizes || hasCustomizations) {
      onAddClick(product);
      return;
    }

    onQuantityChange(product.id, 1);
  }, [product, onAddClick, onQuantityChange]);

  const handleDecrement = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const hasCustomizations = product.customizations && product.customizations.length > 0;
    if (product.hasSizes || hasCustomizations) {
      onAddClick(product);
      return;
    }

    onQuantityChange(product.id, -1);
  }, [product, onAddClick, onQuantityChange]);

  const businessSettings = useAppSelector((state) => state.businessSettings.data);
  const isStockEnabled = businessSettings?.enableStock === "ENABLED";
  const isProductStockTracked = isStockEnabled && product.stockStatus !== "DISABLED";

  const totalStock = product.totalStock ?? 0;
  const isOutOfStock =
    product.status === "OUT_OF_STOCK" ||
    (isProductStockTracked && totalStock <= 0);

  const handleCardClick = useCallback(() => {
    const hasCustomizations = product.customizations && product.customizations.length > 0;
    if (product.hasSizes || hasCustomizations) {
      onAddClick(product);
    } else if (quantity === 0) {
      onAddClick(product);
    } else {
      onQuantityChange(product.id, 1);
    }
  }, [product, onAddClick, onQuantityChange, quantity]);

  const imageUrl = product.mainImage?.md || product.mainImage?.sm || product.mainImage?.o || "";
  const displayPrice = product.displayPrice || parseFloat(String(product.price || 0));

  // Pure backend PromotionStatus enum check
  const hasPromotion = product.hasPromotion === PromotionStatus.ACTIVE;

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative bg-card rounded-[10px] border border-border/80 hover:border-primary/50 hover:shadow-md overflow-hidden transition-all duration-200 flex flex-col cursor-pointer",
        quantity > 0 && "ring-1.5 ring-primary border-primary bg-primary/5",
        hasPromotion && "ring-1 ring-amber-500/30"
      )}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/30 shrink-0">
        <SmartImage
          src={imageUrl}
          alt={product.name}
          fill
          fallbackSrc={appImages.noImage}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <Badge variant="destructive" className="text-[10px] font-bold px-2.5 py-1 bg-red-600/95 text-white border-0 shadow-md backdrop-blur-xs uppercase tracking-wider">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Promotion Badge - Driven directly by product.hasPromotion */}
        {hasPromotion && (
          <div className="absolute top-1.5 left-1.5 z-10">
            <Badge variant="destructive" className="text-[10px] font-black px-2 py-0.5 shadow-sm bg-red-600 text-white border-0 uppercase">
              {getPromotionBadgeText(
                hasPromotion,
                product.displayPromotionType,
                product.displayPromotionValue
              )}
            </Badge>
          </div>
        )}

        {/* Has Sizes or Add-ons Badge */}
        <div className="absolute bottom-1.5 left-1.5 z-10 flex flex-wrap gap-1">
          {product.hasSizes && (
            <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 shadow-2xs bg-background/90 backdrop-blur-sm gap-1 border-border/60">
              <Ruler className="h-3 w-3 text-primary" />
              Options
            </Badge>
          )}
          {product.customizations && product.customizations.length > 0 && (
            <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 shadow-2xs bg-background/90 backdrop-blur-sm gap-1 border-border/60">
              <Package className="h-3 w-3 text-emerald-500" />
              Add-ons
            </Badge>
          )}
        </div>
      </div>

      {/* Content Body - Scaled +5% larger */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-1.5">
        {/* Product Name */}
        <h3 className="font-extrabold text-xs sm:text-xs leading-snug text-foreground line-clamp-2 min-h-[30px]" title={product.name}>
          {product.name}
        </h3>

        <div>
          {/* Price Row */}
          <div className="flex items-baseline justify-between gap-1 mb-2">
            <span className={cn("text-xs sm:text-sm font-black", hasPromotion ? "text-red-500 font-extrabold" : "text-primary")}>
              {formatCurrency(displayPrice)}
            </span>
            {hasPromotion && product.displayOriginPrice && (
              <span className="text-[10px] sm:text-[11px] text-muted-foreground line-through font-semibold">
                {formatCurrency(product.displayOriginPrice)}
              </span>
            )}
          </div>

          {/* Action Buttons - Centered button at bottom */}
          {quantity > 0 ? (
            <div className="flex items-center gap-1.5 w-full">
              <CustomButton
                size="icon"
                variant="outline"
                className="h-[28px] w-[28px] shrink-0 hover:bg-destructive hover:text-destructive-foreground rounded-[6px]"
                onClick={handleDecrement}
              >
                <Minus className="h-3 w-3" />
              </CustomButton>
              <div className="flex-1 text-center h-[28px] bg-primary/10 text-primary font-bold text-xs rounded-[6px] border border-primary/20 flex items-center justify-center">
                {quantity}
              </div>
              <CustomButton
                size="icon"
                variant="outline"
                className="h-[28px] w-[28px] shrink-0 hover:bg-primary hover:text-primary-foreground rounded-[6px]"
                onClick={handleIncrement}
              >
                <Plus className="h-3 w-3" />
              </CustomButton>
            </div>
          ) : (
            <CustomButton
              className="w-full gap-1.5 h-[28px] text-[11px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-3xs rounded-[6px]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCardClick();
              }}
              size="sm"
            >
              <ShoppingCart className="h-3 w-3" />
              Add to Cart
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
}

export const POSProductCard = memo(POSProductCardComponent);
