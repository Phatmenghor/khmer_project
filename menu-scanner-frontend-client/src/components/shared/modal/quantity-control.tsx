"use client";

import { memo } from "react";
import { Trash2 } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { QuantitySelector } from "@/components/shared/input/quantity-selector";

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
      <div className="flex items-center gap-3">
        <QuantitySelector
          value={quantity}
          onChange={onQuantityChange}
          min={0}
          size="sm"
        />
        {showClearButton && (
          <CustomButton
            variant="outline"
            size="sm"
            className="h-9 px-3 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/30 transition-colors gap-1.5"
            onClick={onClear}
            title="Remove this size and customizations from cart"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </CustomButton>
        )}
      </div>
    </div>
  );
}

export const QuantityControl = memo(QuantityControlComponent);
