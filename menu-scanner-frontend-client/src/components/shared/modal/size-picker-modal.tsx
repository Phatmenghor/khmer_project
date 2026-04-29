"use client";
import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Check, Package, X, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { QuantitySelector } from "@/components/shared/input/quantity-selector";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductDetailResponseModel, ProductSize } from "@/redux/features/business/store/models/response/product-response";
import { appImages } from "@/constants/app-resource/icons/app-images";

interface SizePickerModalProps {
  product: ProductDetailResponseModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSizeSelect: (product: ProductDetailResponseModel, size?: ProductSize, quantity?: number) => void;
  isEditing?: boolean;
  // Initial quantities for each size (e.g., when editing existing cart item)
  initialQuantities?: Map<string, number>;
}

export function SizePickerModal({
  product,
  open,
  onOpenChange,
  onSizeSelect,
  isEditing = false,
  initialQuantities,
}: SizePickerModalProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Set<string>>(new Set());

  // Track pending quantities for each size: key = sizeId, value = quantity
  const [pendingQuantities, setPendingQuantities] = useState<Map<string, number>>(new Map());

  // Track original quantities for each size (for comparison to detect changes)
  const [originalQuantities, setOriginalQuantities] = useState<Map<string, number>>(new Map());

  // Track which sizes have been modified (differ from original)
  const [modifiedSizes, setModifiedSizes] = useState<Set<string>>(new Set());

  // Check if there are any unsaved changes
  const hasUnsavedChanges = modifiedSizes.size > 0;

  // Get original quantity for a size (like current cart quantity)
  const getQuantityForSize = useCallback(
    (sizeId: string) => {
      return originalQuantities.get(sizeId) ?? 0;
    },
    [originalQuantities],
  );

  // Get display quantity - shows pending edits if any, otherwise original
  const getDisplayQuantity = useCallback(
    (sizeId: string) => {
      // If user made unsaved edits, show those (pendingQuantity)
      if (pendingQuantities.has(sizeId)) {
        return pendingQuantities.get(sizeId)!;
      }
      // Otherwise show original quantity
      return getQuantityForSize(sizeId);
    },
    [pendingQuantities, getQuantityForSize],
  );

  // Current quantity for selected size
  const currentQuantity = selectedSize
    ? getDisplayQuantity(selectedSize.id)
    : 0;

  // Toggle customization selection
  const toggleCustomization = useCallback((customizationId: string) => {
    setSelectedCustomizations((prev) => {
      const next = new Set(prev);
      if (next.has(customizationId)) {
        next.delete(customizationId);
      } else {
        next.add(customizationId);
      }
      return next;
    });
  }, []);

  // Initialize when modal opens
  useEffect(() => {
    if (open && product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
      setPendingQuantities(new Map());
      setModifiedSizes(new Set());
      setSelectedCustomizations(new Set());

      // Initialize original quantities from prop or default to 0
      const origQties = new Map<string, number>();
      product.sizes.forEach((size) => {
        // Use initialQuantities if provided (when editing existing item)
        const initialQty = initialQuantities?.get(size.id) ?? 0;
        origQties.set(size.id, initialQty);
      });
      setOriginalQuantities(origQties);

      // Set initial quantity to first size's existing quantity
      const firstSizeQty = initialQuantities?.get(product.sizes[0].id) ?? 0;
      setQuantity(firstSizeQty);
    } else if (!open) {
      setSelectedSize(null);
      setQuantity(1);
      setPendingQuantities(new Map());
      setModifiedSizes(new Set());
      setOriginalQuantities(new Map());
      setSelectedCustomizations(new Set());
    }
  }, [open, product?.id, product?.sizes, initialQuantities]);

  // Handle quantity change - update pending and track if modified
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (!selectedSize) return;

      const sizeId = selectedSize.id;
      const originalQty = getQuantityForSize(sizeId);

      // Update pending quantity
      setPendingQuantities((prev) => {
        const next = new Map(prev);
        next.set(sizeId, newQuantity);
        return next;
      });

      // Track if this is actually different from original
      setModifiedSizes((prev) => {
        const next = new Set(prev);
        if (newQuantity === originalQty) {
          // Back to original state - remove from modified
          next.delete(sizeId);
        } else {
          // Different from original - add to modified
          next.add(sizeId);
        }
        return next;
      });

      // Update current quantity display
      setQuantity(newQuantity);
    },
    [selectedSize, getQuantityForSize],
  );

  // Clear size - set quantity to 0
  const handleClearSize = useCallback(() => {
    if (!selectedSize) return;

    const sizeId = selectedSize.id;
    const originalQty = getQuantityForSize(sizeId);

    // Set pending quantity to 0
    setPendingQuantities((prev) => {
      const next = new Map(prev);
      next.set(sizeId, 0);
      return next;
    });

    // Track if different from original
    setModifiedSizes((prev) => {
      const next = new Set(prev);
      if (originalQty === 0) {
        // Clearing when already 0 - not really modified
        next.delete(sizeId);
      } else {
        // Clearing when had qty - this is a modification
        next.add(sizeId);
      }
      return next;
    });

    setQuantity(0);
  }, [selectedSize, getQuantityForSize]);

  // Add to cart - only when sizes are modified
  const handleSelectSize = useCallback(() => {
    if (!product || !hasUnsavedChanges) return;

    // Loop through ALL modified sizes and add each one to cart
    for (const sizeId of modifiedSizes) {
      const size = product.sizes?.find((s) => s.id === sizeId);
      const qty = getDisplayQuantity(sizeId);

      // Only add if quantity > 0
      if (size && qty > 0) {
        onSizeSelect(product, size, qty);
      }
    }

    onOpenChange(false);
  }, [product, modifiedSizes, getDisplayQuantity, onSizeSelect, onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  if (!product) return null;

  const activeSizes = product?.sizes?.filter((s) => s.id) || [];

  const displayPrice = selectedSize?.finalPrice || product?.displayPrice || 0;
  const originalPrice = selectedSize?.hasPromotion
    ? selectedSize.price
    : product?.hasActivePromotion
    ? product?.displayOriginPrice
    : null;
  const hasDiscount = selectedSize
    ? selectedSize.hasPromotion
    : product?.hasActivePromotion;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <FormHeader
          title={isEditing ? "Edit Size" : "Choose Size"}
          description={product?.name}
          isCreate={isEditing === false}
          showAvatar={false}
        />

        {/* Body */}
        <FormBody contentClassName="space-y-4">
          {/* Product Info */}
          <div className="flex gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={product?.mainImageUrl || appImages.NoImage}
                alt={product?.name || "Product"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {product?.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(displayPrice)}
                </span>
                {hasDiscount && originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <Badge variant="destructive" className="text-xs mt-1">
                  {selectedSize?.hasPromotion
                    ? `-${Math.round(
                        ((selectedSize.price - selectedSize.finalPrice) /
                          selectedSize.price) *
                        100
                      )}%`
                    : product?.displayPromotionType === "PERCENTAGE"
                    ? `-${product?.displayPromotionValue}%`
                    : `-${formatCurrency(
                        product?.displayPromotionValue || 0
                      )}`}
                </Badge>
              )}
            </div>
          </div>

          {/* Size Selection */}
          {activeSizes.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-sm">Choose Size</h4>
              <div className="flex flex-wrap gap-2">
                {activeSizes.map((size) => {
                  const isActive = selectedSize?.id === size.id;
                  const sizeDisplayQty = getDisplayQuantity(size.id);
                  const sizeCartQty = getQuantityForSize(size.id);
                  const isModified = modifiedSizes.has(size.id) && sizeDisplayQty !== sizeCartQty;

                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "relative border-2 rounded-lg px-3 py-2 transition-all cursor-pointer hover:border-primary",
                        isActive
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border",
                        isModified && "ring-2 ring-amber-400/50"
                      )}
                    >
                      <div className="font-semibold text-xs">{size.name}</div>
                      <div className="text-primary font-bold text-sm">
                        {formatCurrency(size.finalPrice)}
                      </div>
                      {size.hasPromotion && (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatCurrency(size.price)}
                        </div>
                      )}
                      {isActive && (
                        <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                      )}
                      {/* Quantity badge on size button */}
                      {sizeDisplayQty > 0 && (
                        <div
                          className={cn(
                            "absolute -top-1.5 -left-1.5 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold",
                            isModified ? "bg-amber-500" : "bg-green-500"
                          )}
                        >
                          {sizeDisplayQty}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customizations Selection */}
          {product?.customizations && product.customizations.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-sm">Customizations</h4>
                {selectedCustomizations.size > 0 && (
                  <Badge variant="default" className="text-xs">
                    {selectedCustomizations.size} selected
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.customizations.map((customization) => {
                  const isSelected = selectedCustomizations.has(customization.id);
                  return (
                    <button
                      key={customization.id}
                      onClick={() => toggleCustomization(customization.id)}
                      className={cn(
                        "relative border-2 rounded-lg px-3 py-2 transition-all cursor-pointer hover:border-blue-500",
                        isSelected
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300/20"
                          : "border-border",
                      )}
                    >
                      <div className="font-semibold text-xs">{customization.name}</div>
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white rounded-full p-0.5">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector + Clear Button */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-sm">Quantity</h4>
            <div className="flex items-center gap-2">
              <QuantitySelector
                value={currentQuantity}
                onChange={handleQuantityChange}
                min={0}
                size="sm"
              />
              {/* Clear button for selected size */}
              {(currentQuantity > 0 || getQuantityForSize(selectedSize?.id || "")) > 0 && (
                <CustomButton
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleClearSize}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Clear
                </CustomButton>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-muted/30 rounded-lg p-4 border space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Price per item</span>
              <span className="font-semibold">
                {formatCurrency(displayPrice)}
              </span>
            </div>
            {hasDiscount && originalPrice && (
              <div className="flex justify-between items-center text-destructive">
                <span className="text-muted-foreground text-sm">Original price</span>
                <span className="text-sm line-through">
                  {formatCurrency(originalPrice)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-muted-foreground font-semibold text-sm">Total</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(displayPrice * currentQuantity)}
              </span>
            </div>
          </div>
        </FormBody>

        {/* Footer */}
        <FormFooter
          isSubmitting={false}
          isDirty={hasUnsavedChanges}
          isCreate={!isEditing}
          createMessage="Adding..."
          updateMessage="Saving..."
          noChangesMessage="No changes made"
        >
          <CancelButton onClick={handleClose} />
          <SubmitButton
            onClick={handleSelectSize}
            isLoading={false}
            disabled={!hasUnsavedChanges}
            text={isEditing ? "Save Changes" : "Add to Cart"}
            loadingText={isEditing ? "Saving..." : "Adding..."}
          />
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
