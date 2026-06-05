"use client";

import { Messages } from "@/constants/messages";
import { useState, useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import { buildCustomizationMapKey, getQuantityForCombo } from "@/utils/common/customization-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductDetailResponseModel, ProductSize } from "@/features/business/store/models/response/product-response";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { showToast } from "@/components/shared/common/show-toast";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";
import { SizeSelector } from "./size-selector";
import { SizeCustomization } from "./size-customization";
import { QuantityControl } from "./quantity-control";

interface SizePickerModalProps {
  product: ProductDetailResponseModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSizeSelect: (product: ProductDetailResponseModel, size?: ProductSize, quantity?: number, customizationIds?: string[]) => void;
  isEditing?: boolean;
  editingId?: string;

  initialQuantities?: Map<string, number>;

  initialCustomizations?: string[];

  cartItems?: PosPageCartItem[];
}

export function SizePickerModal({
  product,
  open,
  onOpenChange,
  onSizeSelect,
  isEditing = false,
  editingId,
  initialQuantities,
  initialCustomizations,
  cartItems = [],
}: SizePickerModalProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customizationsBySize, setCustomizationsBySize] = useState<Map<string, Set<string>>>(new Map());

  const [pendingQuantities, setPendingQuantities] = useState<Map<string, number>>(new Map());

  const [originalQuantities, setOriginalQuantities] = useState<Map<string, number>>(new Map());

  const [modifiedSizes, setModifiedSizes] = useState<Set<string>>(new Set());

  const hasUnsavedChanges = modifiedSizes.size > 0 || !!(selectedSize && (customizationsBySize.get(selectedSize.id)?.size ?? 0) > 0);

  const getQuantityForSize = useCallback(
    (sizeId: string, customizationIds?: Set<string>) => {
      const mapKey = buildCustomizationMapKey(sizeId, customizationIds);
      const hasCustomizations = customizationIds ? customizationIds.size > 0 : false;
      return getQuantityForCombo(mapKey, sizeId, hasCustomizations, originalQuantities);
    },
    [originalQuantities],
  );

  const getDisplayQuantity = useCallback(
    (sizeId: string) => {

      if (pendingQuantities.has(sizeId)) {
        return pendingQuantities.get(sizeId)!;
      }

      return getQuantityForSize(sizeId);
    },
    [pendingQuantities, getQuantityForSize],
  );

  // Returns the total qty for a size across ALL customization combos.
  // Used for the size button badge so it reflects the full in-cart qty for that size.
  const getTotalQuantityForSize = useCallback(
    (sizeId: string): number => {
      let total = 0;
      originalQuantities.forEach((qty, key) => {
        if (key === sizeId || key.startsWith(`${sizeId}-`)) {
          total += qty;
        }
      });

      // If user has a pending change for this size, swap out the original combo qty
      if (pendingQuantities.has(sizeId)) {
        const pendingQty = pendingQuantities.get(sizeId)!;
        const customs = customizationsBySize.get(sizeId) ?? new Set<string>();
        const originalComboQty = getQuantityForSize(sizeId, customs.size > 0 ? customs : undefined);
        total = total - originalComboQty + pendingQty;
      }

      return Math.max(0, total);
    },
    [originalQuantities, pendingQuantities, customizationsBySize, getQuantityForSize],
  );

  const currentQuantity = selectedSize
    ? getDisplayQuantity(selectedSize.id)
    : 0;

  // Ref so handleSizeButtonClick can read pendingQuantities without stale closure
  const pendingQuantitiesRef = useRef(pendingQuantities);
  pendingQuantitiesRef.current = pendingQuantities;

  const toggleCustomization = useCallback((customizationId: string) => {
    if (!selectedSize) return;

    const sizeId = selectedSize.id;
    const currentCustoms = customizationsBySize.get(sizeId) ?? new Set<string>();

    // Compute new set synchronously so quantity can be synced in the same batch
    const newSizeCustoms = new Set(currentCustoms);
    if (newSizeCustoms.has(customizationId)) {
      newSizeCustoms.delete(customizationId);
    } else {
      newSizeCustoms.add(customizationId);
    }

    setCustomizationsBySize((prev) => {
      const next = new Map(prev);
      if (newSizeCustoms.size > 0) {
        next.set(sizeId, newSizeCustoms);
      } else {
        next.delete(sizeId);
      }
      return next;
    });

    // Sync quantity for the new combo — replaces Effect 1 (customization-toggle path)
    const qtyForNewCombo = getQuantityForSize(sizeId, newSizeCustoms.size > 0 ? newSizeCustoms : undefined);
    if (qtyForNewCombo > 0) {
      setQuantity(qtyForNewCombo);
      setPendingQuantities((prev) => {
        const next = new Map(prev);
        next.delete(sizeId);
        return next;
      });
    } else {
      setQuantity(0);
    }
  }, [selectedSize, customizationsBySize, getQuantityForSize]);

  // Handles size button click — replaces Effects 1, 2, 3 by syncing customizations
  // and quantity in the same event-handler batch (no cascading re-renders).
  const handleSizeButtonClick = useCallback((size: ProductSize) => {
    const sizeId = size.id;
    setSelectedSize(size);

    // Load cart customizations for this size (replaces Effect 2)
    let newCustoms = new Set<string>();
    if (product?.customizations && product.customizations.length > 0) {
      const cartItem = cartItems?.find(
        (item) =>
          item.productId === product!.id &&
          (item.productSizeId === sizeId ||
            (sizeId === "__no_size__" && item.productSizeId === null)),
      );
      if (cartItem?.customizations && cartItem.customizations.length > 0) {
        newCustoms = new Set(cartItem.customizations.map((c) => c.productCustomizationId));
      }
    }

    setCustomizationsBySize((prev) => {
      const next = new Map(prev);
      if (newCustoms.size > 0) {
        next.set(sizeId, newCustoms);
      } else {
        next.delete(sizeId);
      }
      return next;
    });

    // Sync quantity for the new size + its customizations (replaces Effects 1 & 3)
    const qtyForCombo = getQuantityForSize(sizeId, newCustoms.size > 0 ? newCustoms : undefined);
    if (qtyForCombo > 0) {
      setQuantity(qtyForCombo);
      setPendingQuantities((prev) => {
        const next = new Map(prev);
        next.delete(sizeId);
        return next;
      });
    } else {
      const pendingQty = pendingQuantitiesRef.current.get(sizeId);
      setQuantity(pendingQty !== undefined ? pendingQty : 0);
    }
  }, [product, cartItems, getQuantityForSize]);

  // Track previous open state so initialization only runs on open transition
  const prevOpenRef = useRef(false);

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    prevOpenRef.current = open;

    if (!justOpened || !product) return;

    const hasSizes = product.sizes && product.sizes.length > 0;
    const hasCustomizations = product.customizations && product.customizations.length > 0;

    let editingItem = null;
    if (isEditing && editingId) {
      editingItem = cartItems?.find((item) => item.id === editingId);
    }

    // Find the first cart item for this product to auto-select size/customizations
    const firstCartItem = !editingItem
      ? cartItems?.find((item) => item.productId === product.id)
      : null;

    if (hasSizes) {
      // Priority: editing item > first cart item > first size
      let selectedSizeForInit = product.sizes![0];
      if (editingItem?.productSizeId) {
        const s = product.sizes!.find((s) => s.id === editingItem.productSizeId);
        if (s) selectedSizeForInit = s;
      } else if (firstCartItem?.productSizeId) {
        const s = product.sizes!.find((s) => s.id === firstCartItem.productSizeId);
        if (s) selectedSizeForInit = s;
      }

      setSelectedSize(selectedSizeForInit);
      setPendingQuantities(new Map());
      setModifiedSizes(new Set());

      const customsBySize = new Map<string, Set<string>>();
      const sourceItem = editingItem || firstCartItem;
      const sourceCustomizations = initialCustomizations && initialCustomizations.length > 0
        ? initialCustomizations
        : sourceItem?.customizations?.map((c) => c.productCustomizationId);

      if (sourceCustomizations && sourceCustomizations.length > 0) {
        const targetSizeId = sourceItem?.productSizeId || selectedSizeForInit.id;
        customsBySize.set(targetSizeId, new Set(sourceCustomizations));
      }
      setCustomizationsBySize(customsBySize);

      const origQties = new Map(initialQuantities || new Map());
      setOriginalQuantities(origQties);

      const selectedSizeId = selectedSizeForInit.id;
      const initCustomSet = sourceCustomizations && sourceCustomizations.length > 0
        ? new Set(sourceCustomizations)
        : undefined;
      const initMapKey = buildCustomizationMapKey(selectedSizeId, initCustomSet);
      const sizeQty = initialQuantities?.get(initMapKey) ?? 0;
      setQuantity(sizeQty);
    } else if (hasCustomizations) {
      const noSizeId = "__no_size__";
      const newSize = { id: noSizeId, name: "Default", price: product.price, finalPrice: product.displayPrice } as unknown as ProductSize;
      setSelectedSize(newSize);
      setPendingQuantities(new Map());
      setModifiedSizes(new Set([noSizeId]));

      const customsBySize = new Map<string, Set<string>>();
      const sourceItem = editingItem || firstCartItem;
      const sourceCustomizations = initialCustomizations && initialCustomizations.length > 0
        ? initialCustomizations
        : sourceItem?.customizations?.map((c) => c.productCustomizationId);

      if (sourceCustomizations && sourceCustomizations.length > 0) {
        customsBySize.set(noSizeId, new Set(sourceCustomizations));
      }
      setCustomizationsBySize(customsBySize);

      const origQties = new Map(initialQuantities || new Map());
      setOriginalQuantities(origQties);

      const noSizeCustomSet = sourceCustomizations && sourceCustomizations.length > 0
        ? new Set(sourceCustomizations)
        : undefined;
      const noSizeMapKey = buildCustomizationMapKey(noSizeId, noSizeCustomSet);
      const initialQty = initialQuantities?.get(noSizeMapKey) ?? 0;
      setQuantity(initialQty);
    } else {
      // Plain product — no sizes, no customizations
      const noSizeId = "__no_size__";
      const plainSize = { id: noSizeId, name: "Default", price: product.price, finalPrice: product.displayPrice } as unknown as ProductSize;
      setSelectedSize(plainSize);
      setPendingQuantities(new Map());
      setModifiedSizes(new Set([noSizeId]));
      setCustomizationsBySize(new Map());
      const origQties = new Map(initialQuantities || new Map());
      setOriginalQuantities(origQties);
      const plainQty = initialQuantities?.get(noSizeId) ?? 0;
      setQuantity(plainQty);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  // Reset all local state when the modal closes — kept separate so cart item
  // updates don't re-trigger this cleanup via the broader dep array above.
  useEffect(() => {
    if (!open) {
      setSelectedSize(null);
      setQuantity(0);
      setPendingQuantities(new Map());
      setModifiedSizes(new Set());
      setOriginalQuantities(new Map());
      setCustomizationsBySize(new Map());
      setIsSubmitting(false);
    }
  }, [open]);

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (!selectedSize) return;

      const sizeId = selectedSize.id;

      const selectedSizeCustoms = customizationsBySize.get(sizeId) ?? new Set();
      const originalQty = getQuantityForSize(sizeId, selectedSizeCustoms);

      setPendingQuantities((prev) => {
        const next = new Map(prev);
        next.set(sizeId, newQuantity);
        return next;
      });

      setModifiedSizes((prev) => {
        const next = new Set(prev);
        if (newQuantity === originalQty) {

          next.delete(sizeId);
        } else {

          next.add(sizeId);
        }
        return next;
      });

      setQuantity(newQuantity);
    },
    [selectedSize, getQuantityForSize, customizationsBySize],
  );

  const handleClearSize = useCallback(() => {
    if (!selectedSize) return;

    const sizeId = selectedSize.id;
    const originalQty = getQuantityForSize(sizeId);

    setPendingQuantities((prev) => {
      const next = new Map(prev);
      next.set(sizeId, 0);
      return next;
    });

    setCustomizationsBySize((prev) => {
      const next = new Map(prev);
      next.delete(sizeId);
      return next;
    });

    setModifiedSizes((prev) => {
      const next = new Set(prev);
      if (originalQty === 0) {

        next.delete(sizeId);
      } else {

        next.add(sizeId);
      }
      return next;
    });

    setQuantity(0);
  }, [selectedSize, getQuantityForSize]);

  const handleSelectSize = useCallback(() => {
    if (!product || !hasUnsavedChanges) {
      return;
    }

    const sizesToUpdate = new Set(modifiedSizes);
    customizationsBySize.forEach((_, sizeId) => {
      sizesToUpdate.add(sizeId);
    });

    // Paint loading state immediately before running any logic
    flushSync(() => setIsSubmitting(true));

    // Validate — if fails, reset loading and keep modal open
    for (const sizeId of sizesToUpdate) {
      const customs = customizationsBySize.get(sizeId) ?? new Set();
      const isModified = modifiedSizes.has(sizeId);
      if (!isModified && customs.size > 0) {
        const qtyForCombo = getQuantityForSize(sizeId, customs);
        if (qtyForCombo === 0) {
          showToast.error(Messages.cart.setQuantity);
          setIsSubmitting(false);
          return;
        }
      }
    }

    for (const sizeId of sizesToUpdate) {
      const qty = getDisplayQuantity(sizeId);

      if (qty > 0 || modifiedSizes.has(sizeId)) {
        let sizeCustomizations: string[];
        if (qty === 0 && isEditing) {
          if (initialCustomizations && initialCustomizations.length > 0) {
            sizeCustomizations = initialCustomizations;
          } else if (editingId && cartItems) {
            const originalItem = cartItems.find((item) => item.id === editingId);
            sizeCustomizations = originalItem?.customizations?.map((c) => c.productCustomizationId) ?? [];
          } else {
            sizeCustomizations = [];
          }
        } else {
          sizeCustomizations = Array.from(customizationsBySize.get(sizeId) ?? new Set());
        }

        if (sizeId === "__no_size__") {
          onSizeSelect(product, undefined, qty, sizeCustomizations);
        } else {
          const size = product.sizes?.find((s) => s.id === sizeId);
          if (size) {
            onSizeSelect(product, size, qty, sizeCustomizations);
          }
        }
      }
    }

    onOpenChange(false);
    // isSubmitting resets to false via the useEffect that watches open
  }, [product, hasUnsavedChanges, modifiedSizes, customizationsBySize, getQuantityForSize, getDisplayQuantity, onSizeSelect, onOpenChange, isEditing, editingId, cartItems, initialCustomizations]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  if (!product) return null;

  const hasSizes = product?.sizes && product.sizes.length > 0;
  const hasCustomizations = product?.customizations && product.customizations.length > 0;
  const activeSizes = hasSizes ? product.sizes!.filter((s) => s.id) : [];

  const displayPrice = selectedSize?.finalPrice || product?.displayPrice || 0;

  const selectedSizeCustoms: Set<string> = selectedSize
    ? (customizationsBySize.get(selectedSize.id) ?? new Set<string>())
    : new Set<string>();
  const customizationTotal = Array.from(selectedSizeCustoms).reduce((sum: number, customId) => {
    const custom = product?.customizations?.find((c) => c.id === customId);
    return sum + (custom?.priceAdjustment || 0);
  }, 0);

  const priceWithCustomizations = displayPrice + customizationTotal;

  const originalPrice = selectedSize?.hasPromotion
    ? selectedSize.price
    : product?.hasPromotion
    ? product?.displayOriginPrice
    : null;
  const hasDiscount = selectedSize
    ? selectedSize.hasPromotion
    : product?.hasPromotion;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden" aria-describedby="size-picker-description">
        <DialogDescription id="size-picker-description" className="sr-only">
          {product?.name}
        </DialogDescription>
        <FormHeader
          title={
            isEditing
              ? hasSizes
                ? "Edit Size"
                : "Customize Product"
              : hasSizes
              ? "Choose Size"
              : "Customize & Select Quantity"
          }
          description={product?.name}
          isCreate={isEditing === false}
          showAvatar={false}
        />

        {}
        <FormBody contentClassName="space-y-3">
          {}
          <div className="flex gap-3 mb-3">
            <div className="relative w-14 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={product?.mainImageUrl || appImages.NoImage}
                alt={product?.name || "Product"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xs line-clamp-2 mb-1">
                {product?.name}
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(priceWithCustomizations)}
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
                    ? selectedSize.promotionType === "PERCENTAGE"
                      ? `-${selectedSize.promotionValue}%`
                      : `-${formatCurrency(selectedSize.promotionValue || 0)}`
                    : product?.displayPromotionType === "PERCENTAGE"
                    ? `-${product?.displayPromotionValue}%`
                    : `-${formatCurrency(
                        product?.displayPromotionValue || 0
                      )}`}
                </Badge>
              )}
            </div>
          </div>

          {}
          {activeSizes.length > 0 && (
            <SizeSelector
              sizes={activeSizes}
              selectedSize={selectedSize}
              onSizeSelect={handleSizeButtonClick}
              getDisplayQuantity={getDisplayQuantity}
              getQuantityForSize={getQuantityForSize}
              getTotalQuantityForSize={getTotalQuantityForSize}
              modifiedSizes={modifiedSizes}
            />
          )}

          {}
          <QuantityControl
            quantity={quantity}
            currentQuantity={currentQuantity}
            selectedSizeQuantity={getQuantityForSize(selectedSize?.id || "")}
            onQuantityChange={handleQuantityChange}
            onClear={handleClearSize}
          />

          {}
          {product?.customizations && product.customizations.length > 0 && (
            <SizeCustomization
              product={product}
              selectedSizeCustoms={selectedSizeCustoms}
              onToggleCustomization={toggleCustomization}
            />
          )}

          {}
          <div className="bg-muted/30 rounded p-3 border space-y-1">
            {customizationTotal > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Base price</span>
                  <span className="font-semibold">
                    {formatCurrency(displayPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-yellow-600 dark:text-yellow-500">
                  <span className="text-muted-foreground text-xs">Add-ons</span>
                  <span className="font-semibold">
                    +{formatCurrency(customizationTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-1">
                  <span className="text-muted-foreground text-xs">Price per item</span>
                  <span className="font-semibold">
                    {formatCurrency(priceWithCustomizations)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Price per item</span>
                <span className="font-semibold">
                  {formatCurrency(displayPrice)}
                </span>
              </div>
            )}
            {hasDiscount && originalPrice && (
              <div className="flex justify-between items-center text-destructive">
                <span className="text-muted-foreground text-xs">Original price</span>
                <span className="text-xs line-through">
                  {formatCurrency(originalPrice)}
                </span>
              </div>
            )}
            {(currentQuantity > 1 || customizationTotal > 0) && (
              <>
                <div className="flex justify-between items-center text-muted-foreground text-xs pt-1">
                  <span>Base subtotal ({currentQuantity}×)</span>
                  <span>{formatCurrency(displayPrice * currentQuantity)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center border-t pt-1">
              <span className="text-muted-foreground font-semibold text-xs">Total</span>
              <span className="text-sm font-bold text-primary">
                {formatCurrency(priceWithCustomizations * currentQuantity)}
              </span>
            </div>
          </div>
        </FormBody>

        {}
        <FormFooter
          isSubmitting={isSubmitting}
          isDirty={hasUnsavedChanges}
          isCreate={!isEditing}
          createMessage="Adding..."
          updateMessage="Saving..."
          noChangesMessage="No changes made"
        >
          <CancelButton onClick={handleClose} disabled={isSubmitting} />
          <SubmitButton
            onClick={handleSelectSize}
            isSubmitting={isSubmitting}
            disabled={!hasUnsavedChanges || isSubmitting}
            isCreate={!isEditing}
            createText="Add to Cart"
            updateText="Save Changes"
          />
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
