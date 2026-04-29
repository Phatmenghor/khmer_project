"use client";

import { memo, useCallback } from "react";
import { useSelector } from "react-redux";
import { Heart, ShoppingCart, Plus, Minus, Ruler, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { CustomButton } from "../button/custom-button";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { RootState } from "@/redux/store";

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
  // Get quantity from Redux cart state (only this product's quantity)
  // This ensures card only re-renders when THIS product's quantity changes
  const quantity = useSelector((state: RootState) => {
    return state.posPage.cartItems
      .filter((item) => item.productId === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);
  });
  const handleIncrement = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // For sized products, always open modal to select size
    // Modal will fetch full product details if sizes not loaded
    if (product.hasSizes) {
      onAddClick(product);
      return;
    }
    // For non-sized products, directly increment
    onQuantityChange(product.id, 1);
  }, [product, onAddClick, onQuantityChange]);

  const handleDecrement = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // For sized products, always open modal to select size
    // Modal will fetch full product details if sizes not loaded
    if (product.hasSizes) {
      onAddClick(product);
      return;
    }
    // For non-sized products, directly decrement
    onQuantityChange(product.id, -1);
  }, [product, onAddClick, onQuantityChange]);

  const isOutOfStock = product.status === "OUT_OF_STOCK";

  return (
    <div
      onClick={() => onAddClick(product)}
      className={cn(
        "group relative bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer hover:scale-[1.02]",
        quantity > 0 && "ring-1 ring-primary/30 border-primary/50",
        product.hasActivePromotion && "ring-1 ring-amber-500/20",
        isOutOfStock && "opacity-60"
      )}
    >
      {/* Image Container */}
      <div className={cn("relative aspect-square overflow-hidden bg-muted/30")}>
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Package className="w-8 h-8 opacity-30" />
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center pointer-events-none">
            <Badge variant="secondary" className="text-xs font-semibold px-3 py-1">Out of Stock</Badge>
          </div>
        )}

        {/* Promotion Badge - Top Left */}
        {product.hasActivePromotion && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <Badge variant="destructive" className="text-xs font-bold px-2 py-0.5 shadow-md">
              {product.displayPromotionType === "PERCENTAGE"
                ? `-${product.displayPromotionValue}%`
                : `-${formatCurrency(product.displayPromotionValue)}`}
            </Badge>
          </div>
        )}

        {/* Sizes Badge - Bottom Left */}
        {product.hasSizes && (
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <Badge variant="secondary" className="text-xs font-medium px-1.5 py-0.5 shadow-sm bg-background/90 backdrop-blur-sm gap-1">
              <Ruler className="h-3 w-3" />
              Sizes
            </Badge>
          </div>
        )}

        {/* Quantity Badge - Top Right */}
        {quantity > 0 && (
          <div className="absolute -top-2 -right-2 z-20 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow-md">
            {quantity}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Product Name */}
        <h3 className="font-medium text-sm line-clamp-2 mb-2 leading-snug min-h-[40px]">
          {product.name}
        </h3>

        <div className="mt-auto">
          {/* Prices */}
          <div className="flex flex-col mb-2.5">
            <span className={cn("text-xs text-muted-foreground line-through", !product.hasActivePromotion && "invisible")}>
              {formatCurrency(product.displayOriginPrice)}
            </span>
            <span className="text-base font-bold text-primary">
              {formatCurrency(product.displayPrice || parseFloat(String(product.price || 0)))}
            </span>
          </div>

          {/* Add/Cart Controls */}
          {quantity > 0 ? (
            <div className="flex items-center gap-1.5 w-full">
              <CustomButton
                size="icon"
                variant="outline"
                className="h-8 w-8 shrink-0 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={handleDecrement}
              >
                <Minus className="h-3 w-3" />
              </CustomButton>
              <div className="flex-1 text-center h-8 bg-primary/10 text-primary font-semibold text-sm rounded-lg border border-primary/20 flex items-center justify-center">
                {quantity}
              </div>
              <CustomButton
                size="icon"
                variant="outline"
                className="h-8 w-8 shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={handleIncrement}
              >
                <Plus className="h-3 w-3" />
              </CustomButton>
            </div>
          ) : (
            <CustomButton
              className="w-full gap-1.5 h-8 text-xs font-semibold"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddClick(product);
              }}
              disabled={isOutOfStock}
              size="sm"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
}

export const POSProductCard = memo(POSProductCardComponent);
