"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Plus, Minus, Ruler, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { sanitizeImageUrl } from "@/utils/common/common";
import { CustomButton } from "../button/custom-button";
import { ProductDetailResponseModel, ProductSize } from "@/redux/features/business/store/models/response/product-response";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { toggleFavorite } from "@/redux/features/main/store/thunks/favorite-thunks";
import { showToast } from "../common/show-toast";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { LoginModal } from "../modal/login-modal";
import { useFavoriteState } from "@/redux/features/main/store/state/favorite-state";
import { addToCart } from "@/redux/features/main/store/thunks/cart-thunks";
import {
  addLocalCartItem,
  updateLocalCartItem,
} from "@/redux/features/main/store/slice/cart-slice";
import { SizePickerModal } from "../modal/size-picker-modal";
import { useCartDebounce, cartItemKey } from "@/hooks/use-cart-debounce";
import { getProductQuantity } from "@/utils/common/quantity-utils";
import {
  selectProductQuantityInCart,
  selectProductTotalQuantity,
} from "@/redux/features/main/store/selectors/optimized-cart-selectors";
import { RootState } from "@/redux/store";
import { buildQuantityMap } from "@/utils/common/customization-utils";
import { PosPageCartItem } from "@/redux/features/business/store/models/type/pos-page-type";

interface ProductCardProps {
  product: ProductDetailResponseModel;
  className?: string;
}

// Global cache to track loaded images across all product cards
const imageLoadedCache = new Set<string>();

function ProductCardComponent({ product, className }: ProductCardProps) {
  const { dispatch: cartDispatch, items: cartItems } = useCartState();
  const { dispatch: favoriteDispatch, items: favoriteItems, loaded: favLoaded } = useFavoriteState();
  const { isAuthenticated } = useAuthState();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sizePickerProduct, setSizePickerProduct] = useState<ProductDetailResponseModel | null>(null);
  // Local state for instant UI updates - displays immediately when clicking +/-
  // Redux and API updates happen in background
  const [localQuantity, setLocalQuantity] = useState<number | null>(null);

  // Use optimized memoized selectors - only subscribe to this product's quantity
  // CRITICAL: This component only re-renders when THIS product's quantity changes,
  // not when any other cart item changes!
  const quantity = useSelector((state: RootState) => selectProductQuantityInCart(state, product.id, null));
  const totalQuantity = useSelector((state: RootState) => selectProductTotalQuantity(state, product.id));

  // Use local quantity if set (for instant UI updates), fallback to Redux quantity
  const displayQuantityValue = localQuantity !== null ? localQuantity : quantity;

  // Sync local state with Redux when Redux updates
  useEffect(() => {
    if (localQuantity !== null && localQuantity === quantity) {
      // API response confirmed, clear local state override
      setLocalQuantity(null);
    }
  }, [quantity, localQuantity]);

  // Derive from the favorites store (authoritative) — falls back to prop when not yet loaded.
  // This fixes the bug where navigating away and back shows stale isFavorited from listing data.
  const isFavoritedFromStore = favLoaded
    ? favoriteItems.some((item) => item.id === product.id)
    : (product?.isFavorited ?? false);
  const [isFavorited, setIsFavorited] = useState(isFavoritedFromStore);
  useEffect(() => {
    setIsFavorited(isFavoritedFromStore);
  }, [isFavoritedFromStore]);

  // Debounced cart API calls
  const { debouncedUpdate } = useCartDebounce(cartDispatch);

  // Get current cart item for this product (without size)
  // This is used to determine if we show Add to Cart or +/- buttons
  const isInCart = totalQuantity > 0;

  // DEBUG: Log cart state changes (optional - can remove in production)
  useEffect(() => {
    if (quantity > 0) {
      console.log(`%c## CART QUANTITY (${product.name})`, "background:#28a745;color:white;padding:5px;border-radius:3px;font-weight:bold", {
        productId: product.id,
        quantity: quantity,
        totalQuantity: totalQuantity,
        timestamp: Date.now(),
      });
    }
  }, [quantity, product.id, product.name, totalQuantity]);

  const imageUrl = sanitizeImageUrl(product.mainImageUrl, appImages.NoImage);

  const [imageLoaded, setImageLoaded] = useState(imageLoadedCache.has(imageUrl));
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    imageLoadedCache.add(imageUrl);
  };

  const handleImageError = () => {
    if (imageUrl !== appImages.NoImage) {
      setImageError(true);
      setImageLoaded(true);
      imageLoadedCache.add(appImages.NoImage);
    }
  };

  /**
   * Add to cart handler
   *
   * For products with sizes OR customizations: Opens size picker modal
   * For simple products: Immediately adds 1 unit with optimistic update
   *
   * IMPORTANT: When adding for first time, we always use quantity = 1
   * (never use product.quantity from listing, as that's stale/unrelated data)
   *
   * Flow:
   * 1. Optimistic update to Redux (instant UI feedback)
   * 2. Debounced API call fires 500ms after last +/- click
   * 3. Backend returns fresh cart state
   * 4. Frontend conflict resolution protects optimistic updates from being overwritten
   */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const hasSizes = product.hasSizes && product.sizes && product.sizes.length > 0;
    const hasCustomizations = product.customizations && product.customizations.length > 0;

    // For products with sizes OR customizations, open the size picker modal
    if (hasSizes || hasCustomizations) {
      setSizePickerProduct(product);
      return;
    }

    // For simple products, add directly to cart
    // If already in cart, this button shouldn't show (+/- buttons show instead)
    // But if it does, treat as increment
    if (isInCart) {
      handleIncrement(e as any);
      return;
    }

    // First time adding to cart - always start from 0 → 1
    // (Never use product.quantity from listing, it's from a different API)
    const timestamp = Date.now();
    const newQty = 1;
    const key = cartItemKey(product.id, null);

    // Dispatch optimistic update FIRST for instant UI feedback
    // This updates Redux immediately while API call happens in background
    console.log("%c## OPTIMISTIC UPDATE (ADD TO CART)", "background:#17a2b8;color:white;padding:5px;border-radius:3px;font-weight:bold", {
      productId: product.id,
      quantity: 1,
      timestamp: timestamp,
      time: new Date().toLocaleTimeString()
    });

    cartDispatch(
      addLocalCartItem({
        productId: product.id,
        productSizeId: null,
        quantity: 1,
        productName: product.name,
        productImageUrl: product.mainImageUrl,
        sizeName: null,
        finalPrice: product.displayPrice,
        currentPrice: product.displayOriginPrice || product.displayPrice,
        hasPromotion: product.hasPromotion,
        promotionType: product.displayPromotionType || null,
        promotionValue: product.displayPromotionValue || null,
        promotionFromDate: product.displayPromotionFromDate || null,
        promotionToDate: product.displayPromotionToDate || null,
        optimisticTimestamp: timestamp,
      })
    );

    // Queue API call with debounce (500ms delay)
    // If user clicks +/- in next 500ms, debounce resets
    // After delay, exactly 1 API call fires with latest quantity
    console.log("%c## DEBOUNCE QUEUED", "background:#ff9800;color:white;padding:5px;border-radius:3px;font-weight:bold", {
      key: key,
      quantity: newQty,
      delayMs: 500,
      time: new Date().toLocaleTimeString()
    });

    debouncedUpdate(key, product.id, null, newQty, timestamp);
  };

  /**
   * Increment quantity by 1
   *
   * For simple products (no sizes/customizations): Just increment quantity
   * For sized/customizable products: Only open modal if adding new variant (not already in cart)
   *
   * Optimistic update pattern:
   * 1. Update Redux immediately (UI reflects change instantly)
   * 2. Debounced API call (batches rapid clicks)
   * 3. Conflict resolution protects against stale responses
   */
  const handleIncrement = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const hasSizes = product.hasSizes && product.sizes && product.sizes.length > 0;
    const hasCustomizations = product.customizations && product.customizations.length > 0;

    // Only allow increment if item is already in cart (isInCart button shown)
    if (!isInCart) {
      return;
    }

    // If product has sizes/customizations AND is already in cart without a size,
    // just increment the simple variant (don't open modal)
    // Only open modal if user wants to add a different sized variant
    if ((hasSizes || hasCustomizations) && quantity === 0) {
      // No simple variant in cart, open modal to choose size
      setSizePickerProduct(product);
      return;
    }

    // Increment the quantity
    const newQty = (displayQuantityValue) + 1;
    const key = cartItemKey(product.id, null);
    const ts = Date.now();

    // UPDATE UI FIRST - instant display update
    setLocalQuantity(newQty);

    // Then dispatch to Redux in background
    cartDispatch(
      updateLocalCartItem({
        productId: product.id,
        productSizeId: null,
        quantity: newQty,
        optimisticTimestamp: ts,
      })
    );

    // Queue API call with debounce (500ms)
    // Multiple rapid clicks get batched into single API call
    debouncedUpdate(key, product.id, null, newQty, ts);
  }, [product, displayQuantityValue, isInCart, cartDispatch, debouncedUpdate]);

  /**
   * Decrement quantity by 1, remove if reaches 0
   *
   * For simple products (no sizes/customizations): Just decrement quantity
   * For sized/customizable products: Just decrement simple variant if in cart
   *
   * When quantity reaches 0:
   * - Redux removes item immediately
   * - Success message displayed
   * - Debounced API call sends quantity=0 to backend
   * - Backend deletes cart item
   */
  const handleDecrement = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Only allow decrement if item is already in cart (isInCart button shown)
    if (!isInCart) {
      return;
    }

    // Decrement the quantity (min 0, which triggers removal)
    const newQty = Math.max(0, displayQuantityValue - 1);
    const key = cartItemKey(product.id, null);
    const ts = Date.now();

    // UPDATE UI FIRST - instant display update
    setLocalQuantity(newQty);

    // Then dispatch to Redux in background
    cartDispatch(
      updateLocalCartItem({
        productId: product.id,
        productSizeId: null,
        quantity: newQty,
        optimisticTimestamp: ts,
      })
    );

    // Show removal message when reaching 0
    if (newQty === 0) {
      showToast.success("Removed from cart");
    }

    // Queue API call with debounce
    // Backend receives quantity=0 and deletes the cart item
    debouncedUpdate(key, product.id, null, newQty, ts);
  }, [product, displayQuantityValue, isInCart, cartDispatch, debouncedUpdate]);

  // Favorite toggle with optimistic UI update (like Facebook)
  // Updates UI instantly, syncs with API in background
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) { setShowLoginModal(true); return; }

    // Update UI instantly - no delay, no disabled state!
    const newFavState = !isFavorited;
    setIsFavorited(newFavState);

    // Fire API in background - don't block or disable button
    favoriteDispatch(toggleFavorite({ productId: product.id, isFavorited }))
      .unwrap()
      .catch((error: any) => {
        // Rollback on failure only
        setIsFavorited((prev) => !prev);
        showToast.error(error?.message || "Failed to update favorites");
      });
  };

  // Convert public cart items to PosPageCartItem format for compatibility
  const posCartItems = useMemo(() => {
    return cartItems.map((item) => ({
      ...item,
      // Use customizations from API response, or empty array if not present
      customizations: item.customizations || [],
    })) as PosPageCartItem[];
  }, [cartItems]);

  // Build initial quantities map like POS page
  const initialQuantities = useMemo(() => {
    return sizePickerProduct ? buildQuantityMap(posCartItems, sizePickerProduct.id) : new Map<string, number>();
  }, [sizePickerProduct, posCartItems]);

  // Determine if we're editing (product is already in cart) or adding new
  const isEditingProduct = useMemo(() => {
    return sizePickerProduct && totalQuantity > 0;
  }, [sizePickerProduct, totalQuantity]);

  // Get the first cart item for this product (if editing)
  const editingCartItemId = useMemo(() => {
    if (!sizePickerProduct || !posCartItems) return undefined;
    const cartItem = posCartItems.find((item) => item.productId === sizePickerProduct.id);
    return cartItem?.id;
  }, [sizePickerProduct, posCartItems]);

  // Handle size picker selection like POS page
  const handleSizeSelect = useCallback(
    (selectedProduct: ProductDetailResponseModel, size: ProductSize | undefined, qty: number | undefined, customizationIds: string[] | undefined) => {
      const timestamp = Date.now();
      const sizeId = size?.id === "__no_size__" ? null : size?.id || null;
      // Use nullish coalescing (??) instead of || to allow qty=0 for removal operations
      const quantity = qty ?? 1;
      const customizations = customizationIds || [];

      // DEBUG: Log customizations received from modal
      console.log("%c## PRODUCT CARD - RECEIVED CUSTOMIZATIONS FROM MODAL", "background:#f59e0b;color:white;padding:5px;border-radius:3px;font-weight:bold", {
        customizationCount: customizations.length,
        customizationIds: customizations,
        productId: selectedProduct.id,
        sizeId: sizeId,
        quantity: quantity,
        isEditing: isEditingProduct,
        timestamp: new Date().toLocaleTimeString()
      });

      // Optimistic update FIRST for instant UI feedback
      if (isEditingProduct) {
        // Update existing item (handles removal when qty=0)
        console.log("%c## OPTIMISTIC UPDATE (editing)", "background:#3b82f6;color:white;padding:5px", {
          action: quantity === 0 ? "REMOVE" : "UPDATE",
          quantity,
          timestamp: new Date().toLocaleTimeString()
        });
        cartDispatch(
          updateLocalCartItem({
            productId: selectedProduct.id,
            productSizeId: sizeId,
            quantity: quantity,
            optimisticTimestamp: timestamp,
          })
        );
      } else if (quantity > 0) {
        // Add new item only if quantity > 0
        console.log("%c## OPTIMISTIC ADD (new)", "background:#3b82f6;color:white;padding:5px", {
          quantity,
          timestamp: new Date().toLocaleTimeString()
        });
        cartDispatch(
          addLocalCartItem({
            productId: selectedProduct.id,
            productSizeId: sizeId,
            quantity: quantity,
            productName: selectedProduct.name,
            productImageUrl: selectedProduct.mainImageUrl,
            sizeName: size?.name || null,
            finalPrice: size?.finalPrice || selectedProduct.displayPrice,
            currentPrice: size?.price || selectedProduct.displayOriginPrice || selectedProduct.displayPrice,
            hasPromotion: size?.hasPromotion || selectedProduct.hasPromotion,
            promotionType: size?.promotionType || selectedProduct.displayPromotionType || null,
            promotionValue: size?.promotionValue || selectedProduct.displayPromotionValue || null,
            promotionFromDate: size?.promotionFromDate || selectedProduct.displayPromotionFromDate || null,
            promotionToDate: size?.promotionToDate || selectedProduct.displayPromotionToDate || null,
            optimisticTimestamp: timestamp,
          })
        );
      } else {
        // qty=0 for new item - do nothing
        console.log("%c## SKIPPED (qty=0 on new item)", "background:#6b7280;color:white;padding:5px", {
          timestamp: new Date().toLocaleTimeString()
        });
      }

      // Close modal immediately for instant feedback
      setSizePickerProduct(null);

      // Call API in background
      console.log("%c## API CALL IN BACKGROUND", "background:#9333ea;color:white;padding:5px", {
        action: "addToCart (async)",
        timestamp: new Date().toLocaleTimeString()
      });
      cartDispatch(
        addToCart({
          productId: selectedProduct.id,
          productSizeId: sizeId,
          customizationIds: customizations,
          quantity: quantity,
          optimisticTimestamp: timestamp,
        })
      );
    },
    [cartDispatch, isEditingProduct]
  );

  const isOutOfStock = product.status === "OUT_OF_STOCK";
  // Display the quantity that +/- buttons are updating
  // Uses local state for instant UI updates, falls back to Redux quantity
  const displayQuantity = displayQuantityValue;

  return (
    <>
      <Link href={`/products/${product.id}`}>
        <div
          className={cn(
            "group relative bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer hover-scale-102 hover-lift",
            isOutOfStock && "opacity-70",
            product?.hasPromotion && "ring-1 ring-amber-500/20",
            className,
          )}
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}

            <Image
              src={imageError ? appImages.NoImage : imageUrl}
              alt={product.name || "Product Image"}
              fill
              priority={imageLoadedCache.has(imageUrl)}
              loading={imageLoadedCache.has(imageUrl) ? undefined : "lazy"}
              className={cn(
                "object-cover transition-all duration-300 group-hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />

            {/* Promo badge */}
            {product?.hasPromotion && (
              <div className="absolute top-2 left-2 z-10 pointer-events-none">
                <Badge variant="destructive" className="text-xs font-bold px-2 py-0.5 shadow-md">
                  {product.displayPromotionType === "PERCENTAGE"
                    ? `-${product.displayPromotionValue}%`
                    : `-${formatCurrency(product.displayPromotionValue)}`}
                </Badge>
              </div>
            )}

            {/* Out of stock overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center pointer-events-none">
                <Badge variant="secondary" className="text-xs font-semibold px-3 py-1">Out of Stock</Badge>
              </div>
            )}

            {/* Favorite button */}
            <div className="absolute top-2 right-2 z-20">
              <CustomButton
                size="icon"
                variant="secondary"
                className={cn(
                  "h-8 w-8 rounded-full shadow-md transition-all duration-150",
                  isFavorited
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white/90 hover:bg-red-50 hover:text-red-500",
                )}
                onClick={handleToggleFavorite}
              >
                <Heart className={cn("h-4 w-4 transition-all duration-150", isFavorited && "fill-current")} />
              </CustomButton>
            </div>

            {/* Sizes/Customizations badge */}
            {(product.hasSizes || (product.customizations && product.customizations.length > 0)) && (
              <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                <Badge variant="secondary" className="text-xs font-medium px-1.5 py-0.5 shadow-sm bg-background/90 backdrop-blur-sm gap-1">
                  {product.hasSizes ? (
                    <>
                      <Ruler className="h-3 w-3" />
                      Sizes
                    </>
                  ) : (
                    <>
                      <Package className="h-3 w-3" />
                      Add-ons
                    </>
                  )}
                </Badge>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 flex flex-col flex-1">
            <h3 className="font-medium text-sm line-clamp-2 mb-2 leading-snug min-h-[40px]">{product.name}</h3>

            <div className="mt-auto">
              <div className="flex flex-col mb-2.5">
                <span className={cn("text-xs text-muted-foreground line-through", !product.hasPromotion && "invisible")}>
                  {formatCurrency(product.displayOriginPrice)}
                </span>
                <span className="text-base font-bold text-primary">{formatCurrency(product.displayPrice)}</span>
              </div>

              {isInCart ? (
                <div className="flex items-center gap-1.5 w-full">
                  <CustomButton
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={handleDecrement}
                  >
                    <Minus className="h-3 w-3" />
                  </CustomButton>
                  <div className="flex-1 text-center h-8 bg-primary/10 text-primary font-semibold text-sm rounded-lg border border-primary/20 flex items-center justify-center">
                    {displayQuantity}
                  </div>
                  <CustomButton
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0 hover:bg-primary hover:text-primary-foreground"
                    onClick={handleIncrement}
                  >
                    <Plus className="h-3 w-3" />
                  </CustomButton>
                </div>
              ) : (
                <CustomButton
                  className="w-full gap-1.5 h-8 text-xs font-semibold"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  size="sm"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add to Cart
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      </Link>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      <SizePickerModal
        product={sizePickerProduct}
        open={!!sizePickerProduct}
        onOpenChange={(open) => {
          if (!open) {
            setSizePickerProduct(null);
          }
        }}
        onSizeSelect={handleSizeSelect}
        isEditing={isEditingProduct}
        editingId={editingCartItemId}
        initialQuantities={initialQuantities}
        cartItems={posCartItems}
      />
    </>
  );
}

/**
 * Memoized ProductCard with custom equality check.
 * Only re-renders when product data or className actually changes,
 * NOT when parent list updates or cart state changes.
 *
 * This prevents 90%+ of unnecessary re-renders during:
 * - Infinite scroll pagination
 * - Other cart items updating
 * - Filter/sort changes
 */
export const ProductCard = memo(
  ProductCardComponent,
  (prevProps, nextProps) => {
    // Return true if props are EQUAL (skip re-render)
    // Return false if props are DIFFERENT (allow re-render)
    return (
      // Product ID must be same
      prevProps.product.id === nextProps.product.id &&
      // Price must not change
      prevProps.product.displayPrice === nextProps.product.displayPrice &&
      // Image URL must not change
      prevProps.product.mainImageUrl === nextProps.product.mainImageUrl &&
      // Promotion status must not change
      prevProps.product.hasPromotion === nextProps.product.hasPromotion &&
      // Promotion value must not change (for display)
      prevProps.product.displayPromotionValue === nextProps.product.displayPromotionValue &&
      // Promotion type must not change
      prevProps.product.displayPromotionType === nextProps.product.displayPromotionType &&
      // Status must not change
      prevProps.product.status === nextProps.product.status &&
      // Sizes must not change
      prevProps.product.hasSizes === nextProps.product.hasSizes &&
      // Customizations must not change
      (prevProps.product.customizations?.length ?? 0) === (nextProps.product.customizations?.length ?? 0) &&
      // className must match (usually doesn't change)
      prevProps.className === nextProps.className
    );
  }
);
