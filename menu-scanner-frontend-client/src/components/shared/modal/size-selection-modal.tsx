"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Check, Loader2, ShoppingCart, X, Trash2 } from "lucide-react";
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
} from "@/redux/features/business/store/models/response/product-response";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import {
  addToCart,
  updateCartItem,
} from "@/redux/features/main/store/thunks/cart-thunks";
import {
  addLocalCartItem,
  updateLocalCartItem,
} from "@/redux/features/main/store/slice/cart-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { fetchPublicProductById } from "@/redux/features/main/store/thunks/public-product-thunks";
import { usePublicProductState } from "@/redux/features/main/store/state/public-product-state";

interface SizeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDetailResponseModel | null;
  onSuccess?: () => void;
}

export function SizeSelectionModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: SizeSelectionModalProps) {
  const { dispatch, items: cartItems } = useCartState();
  const { dispatch: productDispatch } = usePublicProductState();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [fullProduct, setFullProduct] =
    useState<ProductDetailResponseModel | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clearingSize, setClearingSize] = useState<string | null>(null);

  // Local pending quantities: key = sizeId (or "no_size"), value = quantity
  const [pendingQuantities, setPendingQuantities] = useState<
    Map<string, number>
  >(new Map());

  // Track which sizes have been modified
  const [modifiedSizes, setModifiedSizes] = useState<Set<string>>(new Set());

  // The product to display
  const displayProduct = fullProduct || product;

  // Get cart quantity for a specific size from actual cart state
  const getCartQuantityForSize = useCallback(
    (sizeId: string | null) => {
      if (!displayProduct) return 0;
      const cartItem = cartItems.find(
        (item) =>
          item.productId === displayProduct.id &&
          item.productSizeId === sizeId,
      );
      return cartItem?.quantity || 0;
    },
    [cartItems, displayProduct],
  );

  // Get the display quantity (pending if modified, otherwise cart)
  const getDisplayQuantity = useCallback(
    (sizeId: string | null) => {
      const key = sizeId || "no_size";
      if (pendingQuantities.has(key)) {
        return pendingQuantities.get(key)!;
      }
      return getCartQuantityForSize(sizeId);
    },
    [pendingQuantities, getCartQuantityForSize],
  );

  // Check if there are any unsaved changes
  const hasUnsavedChanges = modifiedSizes.size > 0;

  // Current quantity for selected size
  const currentQuantity = selectedSize
    ? getDisplayQuantity(selectedSize.id)
    : displayProduct
      ? getDisplayQuantity(null)
      : 0;

  // Initialize when modal opens
  useEffect(() => {
    if (open && product) {
      const needsFetch =
        product.hasSizes && (!product.sizes || product.sizes.length === 0);

      if (needsFetch) {
        setIsLoadingDetail(true);
        setFullProduct(null);
        setSelectedSize(null);

        productDispatch(fetchPublicProductById(product.id))
          .unwrap()
          .then((detail: ProductDetailResponseModel) => {
            setFullProduct(detail);
            if (detail.sizes && detail.sizes.length > 0) {
              setSelectedSize(detail.sizes[0]);
            }
          })
          .catch(() => {
            showToast.error("Failed to load product details");
          })
          .finally(() => {
            setIsLoadingDetail(false);
          });
      } else {
        setFullProduct(null);
        if (product.sizes && product.sizes.length > 0) {
          setSelectedSize(product.sizes[0]);
        } else {
          setSelectedSize(null);
        }
      }
    }

    if (!open) {
      setFullProduct(null);
      setSelectedSize(null);
      setIsLoadingDetail(false);
      setPendingQuantities(new Map());
      setModifiedSizes(new Set());
      setIsSaving(false);
    }
  }, [open, product, productDispatch]);

  // Handle local quantity change (no API call)
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (!displayProduct) return;

      const sizeId = selectedSize?.id || null;
      const key = sizeId || "no_size";
      const originalQty = getCartQuantityForSize(sizeId);

      setPendingQuantities((prev) => {
        const next = new Map(prev);
        next.set(key, newQuantity);
        return next;
      });

      // Track if this is actually different from cart
      setModifiedSizes((prev) => {
        const next = new Set(prev);
        if (newQuantity === originalQty) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    },
    [displayProduct, selectedSize, getCartQuantityForSize],
  );

  // Clear a specific size from cart - calls API immediately
  const handleClearSize = useCallback(
    async (sizeId: string | null) => {
      if (!displayProduct) return;

      const key = sizeId || "no_size";
      const currentQty = getCartQuantityForSize(sizeId);

      // If already 0 in cart and just pending, just reset the pending state
      if (currentQty === 0) {
        setPendingQuantities((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
        setModifiedSizes((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        return;
      }

      // Optimistic local update
      dispatch(
        updateLocalCartItem({
          productId: displayProduct.id,
          productSizeId: sizeId,
          quantity: 0,
        }),
      );

      // Clear any pending state for this size since we're syncing directly
      setPendingQuantities((prev) => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
      setModifiedSizes((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });

      // Call API immediately
      setClearingSize(key);
      try {
        await dispatch(
          updateCartItem({
            productId: displayProduct.id,
            productSizeId: sizeId,
            quantity: 0,
          }),
        ).unwrap();
        showToast.success("Removed from cart");
      } catch (error: any) {
        showToast.error(error?.message || "Failed to remove from cart");
      } finally {
        setClearingSize(null);
      }
    },
    [displayProduct, dispatch, getCartQuantityForSize],
  );

  // Discard all pending changes
  const handleDiscard = useCallback(() => {
    setPendingQuantities(new Map());
    setModifiedSizes(new Set());
    onOpenChange(false);
  }, [onOpenChange]);

  // Save all pending changes to API
  const handleAddToCart = useCallback(async () => {
    if (!displayProduct || modifiedSizes.size === 0) return;

    setIsSaving(true);

    try {
      const promises: Promise<any>[] = [];

      for (const key of modifiedSizes) {
        const sizeId = key === "no_size" ? null : key;
        const newQty = pendingQuantities.get(key) ?? getCartQuantityForSize(sizeId);
        const originalQty = getCartQuantityForSize(sizeId);

        if (newQty === originalQty) continue;

        // Optimistic local update
        if (originalQty === 0 && newQty > 0) {
          const size = displayProduct.sizes?.find((s) => s.id === sizeId);
          const itemFinalPrice =
            size?.finalPrice || displayProduct.displayPrice || 0;
          const itemCurrentPrice = size?.hasPromotion
            ? size.price
            : displayProduct.displayOriginPrice || itemFinalPrice;
          const hasDiscount = size
            ? size.hasPromotion
            : displayProduct.hasActivePromotion;

          dispatch(
            addLocalCartItem({
              productId: displayProduct.id,
              productSizeId: sizeId,
              quantity: newQty,
              productName: displayProduct.name,
              productImageUrl: displayProduct.mainImageUrl,
              sizeName: size?.name || null,
              finalPrice: itemFinalPrice,
              currentPrice: itemCurrentPrice,
              hasPromotion: hasDiscount,
            }),
          );
        } else {
          dispatch(
            updateLocalCartItem({
              productId: displayProduct.id,
              productSizeId: sizeId,
              quantity: newQty,
            }),
          );
        }

        // API call
        if (newQty > 0) {
          promises.push(
            dispatch(
              addToCart({
                productId: displayProduct.id,
                productSizeId: sizeId,
                quantity: newQty,
              }),
            ).unwrap(),
          );
        } else {
          promises.push(
            dispatch(
              updateCartItem({
                productId: displayProduct.id,
                productSizeId: sizeId,
                quantity: 0,
              }),
            ).unwrap(),
          );
        }
      }

      await Promise.all(promises);
      showToast.success("Cart updated");
      setPendingQuantities(new Map());
      setModifiedSizes(new Set());
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update cart");
    } finally {
      setIsSaving(false);
    }
  }, [
    displayProduct,
    modifiedSizes,
    pendingQuantities,
    dispatch,
    getCartQuantityForSize,
    onOpenChange,
    onSuccess,
  ]);

  if (!product) return null;

  const displayPrice =
    selectedSize?.finalPrice || displayProduct?.displayPrice || 0;
  const originalPrice = selectedSize?.hasPromotion
    ? selectedSize.price
    : displayProduct?.hasActivePromotion
      ? displayProduct?.displayOriginPrice
      : null;
  const hasDiscount = selectedSize
    ? selectedSize.hasPromotion
    : displayProduct?.hasActivePromotion;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-bold">Choose Size</DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-2">
          {/* Loading State */}
          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                Loading product details...
              </p>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="flex gap-4 mb-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={displayProduct?.mainImageUrl || appImages.NoImage}
                    alt={displayProduct?.name || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {displayProduct?.name}
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
                              100,
                          )}%`
                        : displayProduct?.displayPromotionType === "PERCENTAGE"
                          ? `-${displayProduct?.displayPromotionValue}%`
                          : `-${formatCurrency(
                              displayProduct?.displayPromotionValue || 0,
                            )}`}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              {displayProduct?.hasSizes &&
                displayProduct?.sizes &&
                displayProduct.sizes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-sm">Choose Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {displayProduct.sizes.map((size) => {
                        const sizeDisplayQty = getDisplayQuantity(size.id);
                        const sizeCartQty = getCartQuantityForSize(size.id);
                        const isModified =
                          modifiedSizes.has(size.id) &&
                          sizeDisplayQty !== sizeCartQty;
                        return (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              "relative border-2 rounded-lg px-3 py-2 transition-all cursor-pointer hover:border-primary",
                              selectedSize?.id === size.id
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border",
                              isModified && "ring-2 ring-amber-400/50",
                            )}
                          >
                            <div className="font-semibold text-xs">
                              {size.name}
                            </div>
                            <div className="text-primary font-bold text-sm">
                              {formatCurrency(size.finalPrice)}
                            </div>
                            {size.hasPromotion && (
                              <div className="text-xs text-muted-foreground line-through">
                                {formatCurrency(size.price)}
                              </div>
                            )}
                            {selectedSize?.id === size.id && (
                              <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                                <Check className="h-2.5 w-2.5" />
                              </div>
                            )}
                            {/* Show quantity badge */}
                            {sizeDisplayQty > 0 && (
                              <div
                                className={cn(
                                  "absolute -top-1.5 -left-1.5 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold",
                                  isModified ? "bg-amber-500" : "bg-green-500",
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

              {/* Quantity Selector + Clear button */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">Quantity</h4>
                <div className="flex items-center gap-2">
                  <QuantitySelector
                    value={currentQuantity}
                    onChange={handleQuantityChange}
                    min={0}
                    size="sm"
                  />
                  {/* Clear button for selected size - calls API immediately */}
                  {(currentQuantity > 0 || getCartQuantityForSize(selectedSize?.id || null) > 0) && (
                    <CustomButton
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                      disabled={clearingSize === (selectedSize?.id || "no_size")}
                      onClick={() =>
                        handleClearSize(selectedSize?.id || null)
                      }
                    >
                      {clearingSize === (selectedSize?.id || "no_size") ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      Clear
                    </CustomButton>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-3 border-t mb-4">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(displayPrice * currentQuantity)}
                </span>
              </div>

              {/* Action buttons: Discard & Add to Cart */}
              <div className="flex gap-3">
                <CustomButton
                  variant="outline"
                  className="flex-1"
                  onClick={handleDiscard}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Discard
                </CustomButton>
                <CustomButton
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isSaving || !hasUnsavedChanges}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-1.5" />
                      Add to Cart
                    </>
                  )}
                </CustomButton>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
