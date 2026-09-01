"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";

interface ProductStickyBarProps {
  product: ProductDetailResponseModel;
  displayPrice: number;
  customizationExtraCost: number;
  pageQuantity: number;
  onIncrementQuantity: () => void;
  onDecrementQuantity: () => void;
  isOutOfStock: boolean;
  isAddingToCart: boolean;
  onAddToCart: () => void;
}

export function ProductStickyBar({
  product,
  displayPrice,
  customizationExtraCost,
  pageQuantity,
  onIncrementQuantity,
  onDecrementQuantity,
  isOutOfStock,
  isAddingToCart,
  onAddToCart,
}: ProductStickyBarProps) {
  const totalPrice = (displayPrice + customizationExtraCost) * pageQuantity;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/80 p-3 sm:hidden shadow-lg">
      <div className="flex items-center gap-3 max-w-md mx-auto">
        {/* Quantity control */}
        <div className="flex items-center border border-border/60 rounded-lg bg-card p-1 shadow-2xs">
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={onDecrementQuantity}
            disabled={pageQuantity <= 1 || isOutOfStock}
            className="h-8 w-8 rounded-md hover:bg-muted text-foreground cursor-pointer disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" />
          </CustomButton>

          <span className="w-8 text-center text-xs font-extrabold text-foreground">
            {pageQuantity}
          </span>

          <CustomButton
            variant="ghost"
            size="icon"
            onClick={onIncrementQuantity}
            disabled={isOutOfStock}
            className="h-8 w-8 rounded-md hover:bg-muted text-foreground cursor-pointer disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" />
          </CustomButton>
        </div>

        {/* Add to Cart button */}
        <CustomButton
          variant="default"
          size="default"
          onClick={onAddToCart}
          disabled={isOutOfStock || isAddingToCart}
          className="flex-1 gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-xs py-2.5 shadow-md cursor-pointer"
        >
          <ShoppingCart className="h-4 w-4" />
          {isOutOfStock
            ? "Out of Stock"
            : isAddingToCart
              ? "Updating..."
              : `Add • $${totalPrice.toFixed(2)}`}
        </CustomButton>
      </div>
    </div>
  );
}
