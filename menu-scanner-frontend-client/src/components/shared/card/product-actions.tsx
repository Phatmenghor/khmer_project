"use client";

import { memo } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { CustomButton } from "../button/custom-button";

interface ProductActionsProps {
  displayQuantity: number;
  isInCart: boolean;
  isOutOfStock: boolean;
  onAddToCart: (e: React.MouseEvent) => void;
  onIncrement: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDecrement: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function ProductActionsComponent({
  displayQuantity,
  isInCart,
  isOutOfStock,
  onAddToCart,
  onIncrement,
  onDecrement,
}: ProductActionsProps) {
  return (
    <div>
      {isInCart ? (
        <div className="flex items-center gap-1.5 w-full">
          <CustomButton
            size="icon"
            variant="outline"
            className="h-5 w-5 shrink-0 hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={onDecrement}
          >
            <Minus className="h-2 w-2" />
          </CustomButton>
          <div className="flex-1 text-center h-5 bg-primary/10 text-primary font-semibold text-xs rounded border border-primary/20 flex items-center justify-center">
            {displayQuantity}
          </div>
          <CustomButton
            size="icon"
            variant="outline"
            className="h-5 w-5 shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={onIncrement}
          >
            <Plus className="h-2 w-2" />
          </CustomButton>
        </div>
      ) : (
        <CustomButton
          className="w-full gap-1.5 h-5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onAddToCart}
          disabled={isOutOfStock}
          size="sm"
        >
          <ShoppingCart className="h-2.5 w-2.5" />
          Add to Cart
        </CustomButton>
      )}
    </div>
  );
}

export const ProductActions = memo(ProductActionsComponent);
