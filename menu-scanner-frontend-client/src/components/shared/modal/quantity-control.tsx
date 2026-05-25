"use client";

import { memo } from "react";
import { Minus, Plus } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";

interface QuantityControlProps {
  quantity: number;
  currentQuantity: number;
  selectedSizeQuantity: number;
  onQuantityChange: (quantity: number) => void;
  onClear: () => void;
}

function QuantityControlComponent({
  quantity,
  currentQuantity,
  selectedSizeQuantity,
  onQuantityChange,
  onClear,
}: QuantityControlProps) {
  const showClearButton = currentQuantity > 0 || selectedSizeQuantity > 0;

  return (
    <div className="mb-4 p-3.5 bg-muted/30 rounded-xl border">
      <h4 className="font-semibold mb-3 text-sm text-foreground">Quantity</h4>
      <div className="flex items-center gap-2">
        <CustomButton
          size="icon"
          variant="outline"
          className={cn(
            "h-9 w-9 shrink-0 transition-all duration-150",
            quantity > 0
              ? "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
              : "opacity-40 cursor-not-allowed",
          )}
          onClick={() => quantity > 0 && onQuantityChange(quantity - 1)}
          disabled={quantity <= 0}
        >
          <Minus className="h-3.5 w-3.5" />
        </CustomButton>

        <div className="w-14 h-9 bg-primary/10 text-primary font-bold text-sm rounded-lg border border-primary/20 flex items-center justify-center select-none">
          {quantity}
        </div>

        <CustomButton
          size="icon"
          variant="outline"
          className="h-9 w-9 shrink-0 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-150"
          onClick={() => onQuantityChange(quantity + 1)}
        >
          <Plus className="h-3.5 w-3.5" />
        </CustomButton>

        {showClearButton && quantity === 0 && (
          <CustomButton
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-muted-foreground hover:text-destructive transition-colors text-xs"
            onClick={onClear}
            title="Remove this size from cart"
          >
            Remove
          </CustomButton>
        )}
      </div>
    </div>
  );
}

export const QuantityControl = memo(QuantityControlComponent);
