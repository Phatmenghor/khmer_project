"use client";

import { memo, useCallback } from "react";
import { useAppSelector } from "@/store";
import { ShoppingCart, Plus, Minus, Ruler, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/shared/image/smart-image";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { CustomButton } from "../button/custom-button";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import { selectPOSProductQuantity } from "@/features/business/store/selectors/pos-cart-selectors";

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

  const isOutOfStock = product.status === "OUT_OF_STOCK";

  const handleCardClick = useCallback(() => {
    const hasCustomizations = product.customizations && product.customizations.length > 0;
    if (product.hasSizes || hasCustomizations) {
      // If product has sizes or customizations, open the modal
      onAddClick(product);
    } else if (quantity === 0) {
      // For new simple products, use onAddClick to add to cart
      onAddClick(product);
    } else {
      // For existing items, directly increment quantity with +
      onQuantityChange(product.id, 1);
    }
  }, [product, onAddClick, onQuantityChange, quantity]);

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative bg-card rounded border border-border hover:border-primary/30 hover:shadow-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer hover:scale-[1.02]",
        quantity > 0 && "ring-1 ring-primary/30 border-primary/50",
        product.hasPromotion && "ring-1 ring-amber-500/20",
        isOutOfStock && "opacity-60"
      )}
    >
      {}
      <div className={cn("relative aspect-square overflow-hidden bg-muted/30")}>
        {(product.mainImage?.md || product.mainImage?.sm) ? (
          <SmartImage
            src={product.mainImage?.md || product.mainImage?.sm}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Package className="w-5 h-5 opacity-30" />
          </div>
        )}

        {}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center pointer-events-none">
            <Badge variant="secondary" className="text-xs font-semibold px-2 py-1">Out of Stock</Badge>
          </div>
        )}

        {}
        {product.hasPromotion && (
          <div className="absolute top-1 left-1 z-10 pointer-events-none">
            <Badge variant="destructive" className="text-xs font-bold px-1 py-0.5 shadow-md">
              {product.displayPromotionType === "PERCENTAGE"
                ? `-${product.displayPromotionValue}%`
                : `-${formatCurrency(product.displayPromotionValue)}`}
            </Badge>
          </div>
        )}

        {}
        {(product.hasSizes || (product.customizations && product.customizations.length > 0)) && (
          <div className="absolute bottom-1 left-1 z-10 pointer-events-none">
            <Badge variant="secondary" className="text-xs font-medium px-1 py-0.5 shadow-sm bg-background/90 backdrop-blur-sm gap-1">
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

      {}
      <div className="p-2 flex flex-col flex-1">
        {}
        <h3 className="font-medium text-xs line-clamp-2 mb-1 leading-snug min-h-[40px]">
          {product.name}
        </h3>

        <div className="mt-auto">
          {}
          <div className="flex flex-col mb-1">
            <span className={cn("text-xs text-muted-foreground line-through", !product.hasPromotion && "invisible")}>
              {formatCurrency(product.displayOriginPrice)}
            </span>
            <span className={cn("text-xs font-bold", product.hasPromotion ? "text-red-500" : "text-primary")}>
              {formatCurrency(product.displayPrice || parseFloat(String(product.price || 0)))}
            </span>
          </div>

          {}
          {quantity > 0 ? (
            <div className="flex items-center gap-1 w-full">
              <CustomButton
                size="icon"
                variant="outline"
                className="h-5 w-5 shrink-0 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={handleDecrement}
              >
                <Minus className="h-2 w-2" />
              </CustomButton>
              <div className="flex-1 text-center h-5 bg-primary/10 text-primary font-semibold text-xs rounded border border-primary/20 flex items-center justify-center">
                {quantity}
              </div>
              <CustomButton
                size="icon"
                variant="outline"
                className="h-5 w-5 shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={handleIncrement}
              >
                <Plus className="h-2 w-2" />
              </CustomButton>
            </div>
          ) : (
            <CustomButton
              className="w-full gap-1 h-5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const hasCustomizations = product.customizations && product.customizations.length > 0;
                if (product.hasSizes || hasCustomizations) {
                  onAddClick(product);
                } else if (quantity === 0) {
                  // For new simple products, use onAddClick to add to cart
                  onAddClick(product);
                } else {
                  // For existing items, directly increment quantity
                  onQuantityChange(product.id, 1);
                }
              }}
              disabled={isOutOfStock}
              size="sm"
            >
              <ShoppingCart className="h-2.5 w-2.5" />
              Add to Cart
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
}

export const POSProductCard = memo(POSProductCardComponent);
