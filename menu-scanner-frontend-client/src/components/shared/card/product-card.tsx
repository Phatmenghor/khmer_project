"use client";

import { Messages } from "@/constants/messages";
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
import { ProductDetailResponseModel, ProductSize } from "@/features/business/store/models/response/product-response";
import { useCartState } from "@/features/main/store/state/cart-state";
import { toggleFavorite } from "@/features/main/store/thunks/favorite-thunks";
import { showToast } from "../common/show-toast";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { LoginModal } from "../modal/login-modal";
import { useFavoriteState } from "@/features/main/store/state/favorite-state";
import { addToCart } from "@/features/main/store/thunks/cart-thunks";
import {
  addLocalCartItem,
  updateLocalCartItem,
} from "@/features/main/store/slice/cart-slice";
import { SizePickerModal } from "../modal/size-picker-modal";
import { useCartDebounce, cartItemKey } from "@/hooks/use-cart-debounce";
import { getProductQuantity } from "@/utils/common/quantity-utils";
import {
  selectProductQuantityInCart,
  selectProductTotalQuantity,
} from "@/features/main/store/selectors/optimized-cart-selectors";
import { RootState } from "@/store";
import { buildQuantityMap } from "@/utils/common/customization-utils";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";

interface ProductCardProps {
  product: ProductDetailResponseModel;
  className?: string;
}


const imageLoadedCache = new Set<string>();

function ProductCardComponent({ product, className }: ProductCardProps) {
  const { dispatch: cartDispatch, items: cartItems } = useCartState();
  const { dispatch: favoriteDispatch, items: favoriteItems, loaded: favLoaded } = useFavoriteState();
  const { isAuthenticated } = useAuthState();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sizePickerProduct, setSizePickerProduct] = useState<ProductDetailResponseModel | null>(null);


  const [localQuantity, setLocalQuantity] = useState<number | null>(null);


  const quantity = useSelector((state: RootState) => selectProductQuantityInCart(state, product.id, null));
  const totalQuantity = useSelector((state: RootState) => selectProductTotalQuantity(state, product.id));


  const displayQuantityValue = localQuantity !== null ? localQuantity : quantity;


  useEffect(() => {
    if (localQuantity !== null && localQuantity === quantity) {

      setLocalQuantity(null);
    }
  }, [quantity, localQuantity]);


  const isFavoritedFromStore = favLoaded
    ? favoriteItems.some((item) => item.id === product.id)
    : (product?.isFavorited ?? false);
  const [isFavorited, setIsFavorited] = useState(isFavoritedFromStore);
  useEffect(() => {
    setIsFavorited(isFavoritedFromStore);
  }, [isFavoritedFromStore]);


  const { debouncedUpdate } = useCartDebounce(cartDispatch);


  const isInCart = totalQuantity > 0;


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


  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const hasSizes = product.hasSizes && product.sizes && product.sizes.length > 0;
    const hasCustomizations = product.customizations && product.customizations.length > 0;


    if (hasSizes || hasCustomizations) {
      setSizePickerProduct(product);
      return;
    }


    if (isInCart) {
      handleIncrement(e as any);
      return;
    }


    const timestamp = Date.now();
    const newQty = 1;
    const key = cartItemKey(product.id, null);


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


    debouncedUpdate(key, product.id, null, newQty, timestamp);
  };


  const handleIncrement = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const clickTime = performance.now();
    const hasSizes = product.hasSizes && product.sizes && product.sizes.length > 0;
    const hasCustomizations = product.customizations && product.customizations.length > 0;


    if (!isInCart) {
      return;
    }


    if ((hasSizes || hasCustomizations) && quantity === 0) {

      setSizePickerProduct(product);
      return;
    }


    const newQty = (displayQuantityValue) + 1;
    const key = cartItemKey(product.id, null);
    const ts = Date.now();


    const uiUpdateTime = performance.now();
    setLocalQuantity(newQty);


    const reduxTime = performance.now();
    cartDispatch(
      updateLocalCartItem({
        productId: product.id,
        productSizeId: null,
        quantity: newQty,
        optimisticTimestamp: ts,
      })
    );


    const debounceTime = performance.now();
    debouncedUpdate(key, product.id, null, newQty, ts);
  }, [product, displayQuantityValue, isInCart, cartDispatch, debouncedUpdate]);


  const handleDecrement = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const clickTime = performance.now();


    if (!isInCart) {
      return;
    }


    const newQty = Math.max(0, displayQuantityValue - 1);
    const key = cartItemKey(product.id, null);
    const ts = Date.now();


    const uiUpdateTime = performance.now();
    setLocalQuantity(newQty);


    const reduxTime = performance.now();
    cartDispatch(
      updateLocalCartItem({
        productId: product.id,
        productSizeId: null,
        quantity: newQty,
        optimisticTimestamp: ts,
      })
    );


    if (newQty === 0) {
      showToast.success(Messages.cart.removed);
    }


    const debounceTime = performance.now();
    debouncedUpdate(key, product.id, null, newQty, ts);
  }, [product, displayQuantityValue, isInCart, cartDispatch, debouncedUpdate]);


  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) { setShowLoginModal(true); return; }


    const newFavState = !isFavorited;
    setIsFavorited(newFavState);


    favoriteDispatch(toggleFavorite({ productId: product.id, isFavorited }))
      .unwrap()
      .catch((error: unknown) => {

        setIsFavorited((prev) => !prev);
        showToast.error((error as { message?: string })?.message || Messages.favorites.updateFailed);
      });
  };


  const posCartItems = useMemo(() => {
    return cartItems.map((item) => ({
      ...item,

      customizations: item.customizations || [],
    })) as PosPageCartItem[];
  }, [cartItems]);


  const initialQuantities = useMemo(() => {
    return sizePickerProduct ? buildQuantityMap(posCartItems, sizePickerProduct.id) : new Map<string, number>();
  }, [sizePickerProduct, posCartItems]);


  const isEditingProduct = useMemo(() => {
    return !!(sizePickerProduct && totalQuantity > 0);
  }, [sizePickerProduct, totalQuantity]);


  const editingCartItemId = useMemo(() => {
    if (!sizePickerProduct || !posCartItems) return undefined;
    const cartItem = posCartItems.find((item) => item.productId === sizePickerProduct.id);
    return cartItem?.id;
  }, [sizePickerProduct, posCartItems]);


  const handleSizeSelect = useCallback(
    (selectedProduct: ProductDetailResponseModel, size: ProductSize | undefined, qty: number | undefined, customizationIds: string[] | undefined) => {
      const timestamp = Date.now();
      const sizeId = size?.id === "__no_size__" ? null : size?.id || null;

      const quantity = qty ?? 1;
      const customizations = customizationIds || [];


      if (isEditingProduct) {

        cartDispatch(
          updateLocalCartItem({
            productId: selectedProduct.id,
            productSizeId: sizeId,
            quantity: quantity,
            optimisticTimestamp: timestamp,
          })
        );
      } else if (quantity > 0) {

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

      }


      setSizePickerProduct(null);


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
          {}
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

            {}
            {product?.hasPromotion && (
              <div className="absolute top-2 left-2 z-10 pointer-events-none">
                <Badge variant="destructive" className="text-xs font-bold px-2 py-0.5 shadow-md">
                  {product.displayPromotionType === "PERCENTAGE"
                    ? `-${product.displayPromotionValue}%`
                    : `-${formatCurrency(product.displayPromotionValue)}`}
                </Badge>
              </div>
            )}

            {}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center pointer-events-none">
                <Badge variant="secondary" className="text-xs font-semibold px-3 py-1">Out of Stock</Badge>
              </div>
            )}

            {}
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

            {}
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

          {}
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


export const ProductCard = memo(
  ProductCardComponent,
  (prevProps, nextProps) => {


    return (

      prevProps.product.id === nextProps.product.id &&

      prevProps.product.displayPrice === nextProps.product.displayPrice &&

      prevProps.product.mainImageUrl === nextProps.product.mainImageUrl &&

      prevProps.product.hasPromotion === nextProps.product.hasPromotion &&

      prevProps.product.displayPromotionValue === nextProps.product.displayPromotionValue &&

      prevProps.product.displayPromotionType === nextProps.product.displayPromotionType &&

      prevProps.product.status === nextProps.product.status &&

      prevProps.product.hasSizes === nextProps.product.hasSizes &&

      (prevProps.product.customizations?.length ?? 0) === (nextProps.product.customizations?.length ?? 0) &&

      prevProps.className === nextProps.className
    );
  }
);
