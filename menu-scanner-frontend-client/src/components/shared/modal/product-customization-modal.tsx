"use client";

import { Messages } from "@/constants/messages";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Check, Loader2, ShoppingCart, X, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { QuantitySelector } from "@/components/shared/input/quantity-selector";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import {
  ProductDetailResponseModel,
  ProductSize,
  Customization,
} from "@/features/business/store/models/response/product-response";
import { showToast } from "@/components/shared/common/show-toast";

interface ProductCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDetailResponseModel | null;
  currentQuantity?: number;
  onAddToCart: (
    productId: string,
    productSizeId: string | null,
    customizationIds: string[],
    quantity: number
  ) => Promise<void>;
  isLoading?: boolean;
}

export function ProductCustomizationModal({
  open,
  onOpenChange,
  product,
  currentQuantity = 0,
  onAddToCart,
  isLoading = false,
}: ProductCustomizationModalProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    if (open && product) {

      if (product.hasSizes && product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize(null);
      }
      setSelectedCustomizations(new Set());
      setQuantity(1);
    }

    if (!open) {
      setSelectedSize(null);
      setSelectedCustomizations(new Set());
      setQuantity(1);
      setIsSaving(false);
    }
  }, [open, product]);


  const currentPrice = useMemo(() => {
    if (selectedSize) {
      return selectedSize.price || 0;
    }
    return product?.price || 0;
  }, [selectedSize, product]);


  const finalPrice = useMemo(() => {
    if (selectedSize) {
      return selectedSize.finalPrice || selectedSize.price || 0;
    }
    return product?.displayPrice || product?.price || 0;
  }, [selectedSize, product]);


  const hasPromotion = useMemo(() => {
    if (selectedSize) {
      return selectedSize.hasPromotion;
    }
    return product?.hasPromotion;
  }, [selectedSize, product]);


  const handleCustomizationToggle = useCallback(
    (customizationId: string) => {
      setSelectedCustomizations((prev) => {
        const next = new Set(prev);
        if (next.has(customizationId)) {
          next.delete(customizationId);
        } else {
          next.add(customizationId);
        }
        return next;
      });
    },
    []
  );


  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    if (product.hasSizes && !selectedSize) {
      showToast.error(Messages.product.selectSize);
      return;
    }

    setIsSaving(true);
    try {
      const customizationIds = Array.from(selectedCustomizations);
      await onAddToCart(
        product.id,
        selectedSize?.id || null,
        customizationIds,
        quantity
      );


      onOpenChange(false);
      showToast.success(Messages.cart.added);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || "Failed to add to cart");
    } finally {
      setIsSaving(false);
    }
  }, [product, selectedSize, selectedCustomizations, quantity, onAddToCart, onOpenChange]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Options</DialogTitle>
        </DialogHeader>

        {}
        <div className="space-y-3">
          <h3 className="font-semibold text-base">{product.name}</h3>

          {}
          <div className="flex flex-col gap-1">
            <span className={cn("text-sm text-muted-foreground line-through", !hasPromotion && "invisible")}>
              {formatCurrency(currentPrice)}
            </span>
            <span className={cn("text-lg font-bold", hasPromotion ? "text-red-500" : "text-primary")}>
              {formatCurrency(finalPrice)}
            </span>
          </div>
        </div>

        {}
        {product.hasSizes && product.sizes && product.sizes.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-semibold">Select Size</label>
            <div className="grid grid-cols-2 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "p-3 rounded-lg border transition-all text-sm font-medium",
                    selectedSize?.id === size.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div>{size.name}</div>
                  {size.price && <div className="text-xs text-muted-foreground">{formatCurrency(size.price)}</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {}
        {product.customizations && product.customizations.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-semibold">Add-ons</label>
            <div className="space-y-2">
              {product.customizations.map((customization) => (
                <button
                  key={customization.id}
                  onClick={() => handleCustomizationToggle(customization.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                    selectedCustomizations.has(customization.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-all",
                        selectedCustomizations.has(customization.id)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      )}
                    >
                      {selectedCustomizations.has(customization.id) && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{customization.name}</span>
                  </div>
                  {customization.price > 0 && (
                    <span className="text-sm font-semibold">+{formatCurrency(customization.price)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Quantity</label>
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={setQuantity}
            min={1}
            max={100}
          />
        </div>

        {}
        <div className="bg-muted/50 p-3 rounded-lg space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Item Price:</span>
            <span className="font-medium">{formatCurrency(finalPrice)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{formatCurrency(finalPrice * quantity)}</span>
          </div>
        </div>

        {}
        <CustomButton
          onClick={handleAddToCart}
          disabled={isSaving || isLoading || (product.hasSizes && !selectedSize)}
          isLoading={isSaving}
          className="w-full"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </CustomButton>
      </DialogContent>
    </Dialog>
  );
}
