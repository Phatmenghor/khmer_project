"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Plus, Minus, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { sanitizeImageUrl } from "@/utils/common/common";
import { CustomButton } from "../button/custom-button";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
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
import { SizeSelectionModal } from "../modal/size-selection-modal";
import { useCartDebounce, cartItemKey } from "@/hooks/use-cart-debounce";
import { getProductQuantity } from "@/utils/common/quantity-utils";

interface ProductCardProps {
  product: ProductDetailResponseModel;
  className?: string;
}

// Global cache to track loaded images across all product cards
const imageLoadedCache = new Set<string>();

export function ProductCard({ product, className }: ProductCardProps) {
  const { dispatch: cartDispatch, items: cartItems } = useCartState();
  const { dispatch: favoriteDispatch, items: favoriteItems, loaded: favLoaded } = useFavoriteState();
  const { isAuthenticated } = useAuthState();

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Derive from the favorites store (authoritative) — falls back to prop when not yet loaded.
  // This fixes the bug where navigating away and back shows stale isFavorited from listing data.
  const isFavoritedFromStore = favLoaded
    ? favoriteItems.some((item) => item.id === product.id)
    : (product?.isFavorited ?? false);
  const [isFavorited, setIsFavorited] = useState(isFavoritedFromStore);
  useEffect(() => {
    setIsFavorited(isFavoritedFromStore);
  }, [isFavoritedFromStore]);

  // Debounced cart API calls (aborts stale in-flight requests)
  const { debouncedUpdate } = useCartDebounce(cartDispatch);

  // Get current cart item for this product (without size)
  const cartItem = cartItems.find(
    (item) => item.productId === product.id && !item.productSizeId,
  );

  // Quantity logic: Trust Redux if it has the item, otherwise use API data
  // Once Redux has the item, always use Redux (never revert to API)
  // This prevents rollbacks while showing correct initial state
  const quantity = useMemo(() => {
    if (cartItem) {
      // Redux has the item - trust Redux completely (optimistic updates)
      return cartItem.quantity;
    }
    // Redux doesn't have item yet - use API value for initial display
    return getProductQuantity(product);
  }, [cartItem, product.id]);

  // Total quantity in cart including all sizes for this product
  const cartItemsTotal = useMemo(() => {
    return cartItems
      .filter((item) => item.productId === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems, product.id]);

  // Total: ALWAYS use Redux if we have items, NEVER fallback to stale API data
  // This ensures the UI stays in sync with cart state
  const totalQuantity = cartItemsTotal > 0 ? cartItemsTotal : getProductQuantity(product);

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

  // Add to cart (opens size modal if product has sizes)
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // For sized products, open the size selection modal
    if (product.hasSizes) {
      setShowSizeModal(true);
      return;
    }

    // For non-sized products, add directly to cart
    const timestamp = Date.now();
    const currentQty = quantity; // Current quantity from Redux or API fallback
    const newQty = currentQty + 1;

    // Dispatch optimistic update FIRST for instant UI feedback
    cartDispatch(
      addLocalCartItem({
        productId: product.id,
        productSizeId: null,
        quantity: 1, // Add 1 item optimistically
        productName: product.name,
        productImageUrl: product.mainImageUrl,
        sizeName: null,
        finalPrice: product.displayPrice,
        currentPrice: product.displayOriginPrice || product.displayPrice,
        hasPromotion: product.hasActivePromotion,
        promotionType: product.displayPromotionType || null,
        promotionValue: product.displayPromotionValue || null,
        promotionFromDate: product.displayPromotionFromDate || null,
        promotionToDate: product.displayPromotionToDate || null,
        optimisticTimestamp: timestamp,
      })
    );

    setIsAddingToCart(true);
    // Dispatch API call (async)
    cartDispatch(
      addToCart({
        productId: product.id,
        quantity: newQty,
        optimisticTimestamp: timestamp,
      })
    )
      .unwrap()
      .then(() => {
        showToast.success("Added to cart");
        setIsAddingToCart(false);
      })
      .catch((error: any) => {
        showToast.error(error?.message || "Failed to add to cart");
        setIsAddingToCart(false);
      });
  };

  const handleIncrement = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // For sized products, open the size modal to select size
    if (product.hasSizes) {
      setShowSizeModal(true);
      return;
    }

    // Only allow increment if item is already in cart (isInCart button shown)
    if (!cartItem) {
      return;
    }

    // Increment the quantity
    const newQty = quantity + 1;
    const key = cartItemKey(product.id, null);
    const ts = Date.now();

    // Dispatch optimistic update to Redux immediately
    cartDispatch(
      updateLocalCartItem({
        productId: product.id,
        productSizeId: null,
        quantity: newQty,
        optimisticTimestamp: ts,
      })
    );

    // Debounce the API call (send after 500ms)
    debouncedUpdate(key, product.id, null, newQty, ts);
  }, [product, quantity, cartItem, cartDispatch, debouncedUpdate, setShowSizeModal]);

  const handleDecrement = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // For sized products, open the size modal to select size
    if (product.hasSizes) {
      setShowSizeModal(true);
      return;
    }

    // Only allow decrement if item is already in cart (isInCart button shown)
    if (!cartItem) {
      return;
    }

    // Decrement the quantity
    const newQty = Math.max(0, quantity - 1);
    const key = cartItemKey(product.id, null);
    const ts = Date.now();

    // Dispatch optimistic update to Redux immediately
    cartDispatch(
      updateLocalCartItem({
        productId: product.id,
        productSizeId: null,
        quantity: newQty,
        optimisticTimestamp: ts,
      })
    );

    // Show removal toast AFTER state update
    if (quantity === 1) {
      showToast.success("Removed from cart");
    }

    // Debounce the API call (send after 500ms)
    debouncedUpdate(key, product.id, null, newQty, ts);
  }, [product, quantity, cartItem, cartDispatch, debouncedUpdate, setShowSizeModal]);

  // Favorite toggle with optimistic UI update (fixes the bug)
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) { setShowLoginModal(true); return; }

    setIsFavorited((prev) => !prev); // optimistic
    setIsTogglingFavorite(true);
    try {
      await favoriteDispatch(toggleFavorite({ productId: product.id, isFavorited })).unwrap();
    } catch (error: any) {
      setIsFavorited((prev) => !prev); // rollback
      showToast.error(error?.message || "Failed to update favorites");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const isOutOfStock = product.status === "OUT_OF_STOCK";
  const isInCart = product.hasSizes ? totalQuantity > 0 : quantity > 0;
  const displayQuantity = product.hasSizes ? totalQuantity : quantity;

  return (
    <>
      <Link href={`/products/${product.id}`}>
        <div
          className={cn(
            "group relative bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md overflow-hidden transition-all duration-200 flex flex-col",
            isOutOfStock && "opacity-70",
            product?.hasActivePromotion && "ring-1 ring-amber-500/20",
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
            {product?.hasActivePromotion && (
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
                  "h-8 w-8 rounded-full shadow-md transition-all duration-200",
                  isFavorited
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white/90 hover:bg-red-50 hover:text-red-500",
                )}
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
              >
                <Heart className={cn("h-4 w-4 transition-transform duration-200", isFavorited && "fill-current scale-110")} />
              </CustomButton>
            </div>

            {/* Sizes badge */}
            {product.hasSizes && (
              <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                <Badge variant="secondary" className="text-xs font-medium px-1.5 py-0.5 shadow-sm bg-background/90 backdrop-blur-sm gap-1">
                  <Ruler className="h-3 w-3" />
                  Sizes
                </Badge>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 flex flex-col flex-1">
            <h3 className="font-medium text-sm line-clamp-2 mb-2 leading-snug min-h-[40px]">{product.name}</h3>

            <div className="mt-auto">
              <div className="flex flex-col mb-2.5">
                <span className={cn("text-xs text-muted-foreground line-through", !product.hasActivePromotion && "invisible")}>
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
                  disabled={isAddingToCart || isOutOfStock}
                  size="sm"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add to Cart
                    </>
                  )}
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      </Link>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      <SizeSelectionModal open={showSizeModal} onOpenChange={setShowSizeModal} product={product} />
    </>
  );
}
