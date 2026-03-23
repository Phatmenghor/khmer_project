"use client";

import { useState } from "react";
import { Check, Package, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductDetailResponseModel, ProductSize } from "@/redux/features/business/store/models/response/product-response";

interface SizePickerModalProps {
  product: ProductDetailResponseModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSizeSelect: (product: ProductDetailResponseModel, size?: ProductSize) => void;
  isEditing?: boolean;
}

export function SizePickerModal({
  product,
  open,
  onOpenChange,
  onSizeSelect,
  isEditing = false,
}: SizePickerModalProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);

  const handleSelectSize = (size: ProductSize) => {
    if (product) {
      onSizeSelect(product, size);
      setSelectedSize(null);
      onOpenChange(false);
    }
  };

  const handleSelectRegular = () => {
    if (product) {
      onSizeSelect(product);
      setSelectedSize(null);
      onOpenChange(false);
    }
  };

  if (!product) return null;

  const activeSizes = product.sizes?.filter((s) => s.id) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Package className="w-5 h-5" />
            {isEditing ? "Edit Size" : "Select Size"} - {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Choose Size Label */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Choose Size
            </p>

            {/* Option: Add base product without size */}
            {parseFloat(String(product.price || 0)) > 0 && (
              <button
                onClick={handleSelectRegular}
                className={cn(
                  "w-full relative border-2 rounded-xl px-4 py-3 text-left transition-all mb-2",
                  !selectedSize
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-muted/40"
                )}
              >
                {!selectedSize && (
                  <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                )}
                <div className="font-semibold text-sm">Regular</div>
                <div className="text-primary font-bold text-sm">
                  {formatCurrency(
                    product.displayPrice ||
                      parseFloat(String(product.price || 0))
                  )}
                </div>
              </button>
            )}

            {/* Size options */}
            <div className="flex flex-wrap gap-2">
              {activeSizes.map((size) => {
                const isActive = selectedSize?.id === size.id;
                return (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "relative border-2 rounded-xl px-4 py-2.5 text-left min-w-[76px] transition-all",
                      isActive
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/40"
                    )}
                  >
                    {isActive && (
                      <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                    <div className="font-semibold text-sm">{size.name}</div>
                    <div className="text-primary font-bold text-sm">
                      {formatCurrency(size.finalPrice)}
                    </div>
                    {size.hasPromotion && (
                      <div className="text-[10px] text-muted-foreground line-through">
                        {formatCurrency(size.price)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-1.5"
              disabled={!selectedSize}
              onClick={() => {
                if (selectedSize) {
                  handleSelectSize(selectedSize);
                }
              }}
            >
              Select
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
