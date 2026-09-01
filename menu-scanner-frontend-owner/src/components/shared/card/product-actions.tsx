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
    <div className="w-full pt-1">
      {isInCart ? (
        <div className="flex items-center gap-1 w-full p-0.5 rounded-xl bg-primary/10 border border-primary/20 shadow-2xs">
          <CustomButton
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg shrink-0 text-primary hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 active:scale-90"
            onClick={onDecrement}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </CustomButton>

          <div className="flex-1 text-center font-extrabold text-xs text-primary tracking-tight">
            {displayQuantity}
          </div>

          <CustomButton
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg shrink-0 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 active:scale-90"
            onClick={onIncrement}
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </CustomButton>
        </div>
      ) : (
        <CustomButton
          className="w-full gap-1.5 h-8 text-xs font-bold rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground shadow-2xs hover:shadow-md transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
          onClick={onAddToCart}
          disabled={isOutOfStock}
          size="sm"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Add to Cart</span>
        </CustomButton>
      )}
    </div>
  );
}

export const ProductActions = memo(ProductActionsComponent);
