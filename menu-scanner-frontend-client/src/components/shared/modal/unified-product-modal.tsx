"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Check, Package, X, Trash2, Loader2 } from "lucide-react";
import { buildCustomizationMapKey, getQuantityForCombo } from "@/utils/common/customization-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { QuantitySelector } from "@/components/shared/input/quantity-selector";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/redux/features/business/store/models/response/product-response";
import { showToast } from "@/components/shared/common/show-toast";

interface UnifiedProductModalProps {
  product: ProductDetailResponseModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Callback when user confirms selection
  // For public: should call API with (productId, sizeId, customizationIds, quantity)
  // For POS: should update Redux with local changes
  onConfirm: (
    product: ProductDetailResponseModel,
    size: ProductSize | null,
    customizations: string[],
    quantity: number
  ) => Promise<void>;
  isLoading?: boolean;
  mode?: "public" | "pos"; // "public" for API calls, "pos" for local storage
  cartItemQuantities?: Map<string, number>; // Existing cart quantities for this product
}

export function UnifiedProductModal({
  product,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  mode = "public",
  cartItemQuantities = new Map(),
}: UnifiedProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const hasSizes = product?.hasSizes && product.sizes && product.sizes.length > 0;
  const hasCustomizations = product?.customizations && product.customizations.length > 0;

  // Get quantity for a specific size + customization combo
  const getQuantityForCombo = useCallback(
    (sizeId: string | null, customizationIds: Set<string>) => {
      if (!sizeId && !hasCustomizations) return 0;

      const key = buildCustomizationMapKey(sizeId, customizationIds);
      return cartItemQuantities.get(key) ?? 0;
    },
    [cartItemQuantities, hasCustomizations]
  );

  // Initialize on modal open
  useEffect(() => {
    if (open && product) {
      // Set first size if product has sizes
      if (hasSizes) {
        setSelectedSize(product.sizes![0]);
      } else if (hasCustomizations) {
        // For products with only customizations, create a pseudo-size
        setSelectedSize({
          id: "__no_size__",
          name: "Default",
          price: product.price,
          finalPrice: product.displayPrice,
        } as ProductSize);
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
  }, [open, product, hasSizes, hasCustomizations]);

  // Update quantity when size or customizations change
  useEffect(() => {
    if (!selectedSize) return;

    const sizeId = selectedSize.id === "__no_size__" ? null : selectedSize.id;
    const qtyForCombo = getQuantityForCombo(sizeId, selectedCustomizations);

    if (qtyForCombo > 0) {
      // Combo exists in cart
      setQuantity(qtyForCombo);
    } else {
      // New combo
      setQuantity(1);
    }
  }, [selectedSize?.id, selectedCustomizations, getQuantityForCombo]);

  // Toggle customization
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

  // Handle confirm/add to cart
  const handleConfirm = useCallback(async () => {
    if (!product || !selectedSize) {
      showToast.error("Please select a size");
      return;
    }

    setIsSaving(true);
    try {
      const sizeId = selectedSize.id === "__no_size__" ? null : selectedSize.id;
      const customizationIds = Array.from(selectedCustomizations);

      await onConfirm(product, selectedSize, customizationIds, quantity);

      onOpenChange(false);
      showToast.success("Updated successfully");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update");
    } finally {
      setIsSaving(false);
    }
  }, [product, selectedSize, selectedCustomizations, quantity, onConfirm, onOpenChange]);

  // Get current price
  const currentPrice = useMemo(() => {
    if (!selectedSize) return product?.price || 0;
    if (selectedSize.id === "__no_size__") return product?.price || 0;
    return selectedSize.price || 0;
  }, [selectedSize, product?.price]);

  // Get final price (after promotion)
  const finalPrice = useMemo(() => {
    if (!selectedSize) return product?.displayPrice || product?.price || 0;
    if (selectedSize.id === "__no_size__") return product?.displayPrice || product?.price || 0;
    return selectedSize.finalPrice || selectedSize.price || 0;
  }, [selectedSize, product?.displayPrice, product?.price]);

  // Check if has promotion
  const hasPromotion = useMemo(() => {
    if (!selectedSize) return product?.hasPromotion;
    if (selectedSize.id === "__no_size__") return product?.hasPromotion;
    return selectedSize.hasPromotion;
  }, [selectedSize, product?.hasPromotion]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Options</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base">{product.name}</h3>

            {/* Prices */}
            <div className="flex flex-col gap-1">
              <span className={cn("text-sm text-muted-foreground line-through", !hasPromotion && "invisible")}>
                {formatCurrency(currentPrice)}
              </span>
              <span className={cn("text-lg font-bold", hasPromotion ? "text-red-500" : "text-primary")}>
                {formatCurrency(finalPrice)}
              </span>
            </div>
          </div>

          {/* Sizes */}
          {hasSizes && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Select Size</label>
              <div className="grid grid-cols-2 gap-2">
                {product.sizes!.map((size) => (
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

          {/* Customizations */}
          {hasCustomizations && (
            <div className="space-y-3">
              <label className="text-sm font-semibold">Add-ons</label>
              <div className="space-y-2">
                {product.customizations!.map((customization) => (
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
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0",
                          selectedCustomizations.has(customization.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {selectedCustomizations.has(customization.id) && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-left">{customization.name}</span>
                    </div>
                    {customization.price > 0 && (
                      <span className="text-sm font-semibold flex-shrink-0">+{formatCurrency(customization.price)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Quantity</label>
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={setQuantity}
              min={1}
              max={100}
            />
          </div>

          {/* Total */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unit Price:</span>
              <span className="font-medium">{formatCurrency(finalPrice)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(finalPrice * quantity)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <CustomButton
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSaving || isLoading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              className="flex-1"
              onClick={handleConfirm}
              disabled={isSaving || isLoading || !selectedSize}
              isLoading={isSaving}
            >
              {quantity > 0 ? "Update" : "Add to Cart"}
            </CustomButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
