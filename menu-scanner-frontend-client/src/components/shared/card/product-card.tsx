"use client";

import { Messages } from "@/constants/messages";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useAppSelector } from "@/store";
import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeImageUrl } from "@/utils/common/common";
import { ProductDetailResponseModel, ProductSize } from "@/features/business/store/models/response/product-response";
import { useCartState } from "@/features/main/store/state/cart-state";
import { toggleFavorite } from "@/features/main/store/thunks/favorite-thunks";
import { showToast } from "../common/show-toast";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { CustomButton } from "@/components/shared/button/custom-button";
import { useFavoriteState } from "@/features/main/store/state/favorite-state";
import {
  addLocalCartItem,
  updateLocalCartItem,
} from "@/features/main/store/slice/cart-slice";
import { CartItemCustomization } from "@/features/main/store/models/response/cart-response";
import { SizePickerModal } from "../modal/size-picker-modal";
import { useCartDebounce, cartItemKey } from "@/hooks/use-cart-debounce";
import { useFavoriteDebounce } from "@/hooks/use-favorite-debounce";
import {
  selectProductQuantityInCart,
  selectProductTotalQuantity,
} from "@/features/main/store/selectors/optimized-cart-selectors";
import { buildQuantityMap } from "@/utils/common/customization-utils";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";
import { ProductImage } from "./product-image";
import { ProductInfo } from "./product-info";
import { ProductActions } from "./product-actions";

interface ProductCardProps {
  product: ProductDetailResponseModel;
  className?: string;
  imageLoading?: "eager" | "lazy";
}


function ProductCardComponent({ product, className, imageLoading = "lazy" }: ProductCardProps) {
  const { dispatch: cartDispatch, items: cartItems } = useCartState();
  const { dispatch: favoriteDispatch, items: favoriteItems, loaded: favLoaded } = useFavoriteState();
  const { isAuthenticated } = useAuthState();

  const [sizePickerProduct, setSizePickerProduct] = useState<ProductDetailResponseModel | null>(null);

  const [localQuantity, setLocalQuantity] = useState<number | null>(null);

  const quantity = useAppSelector((state) => selectProductQuantityInCart(state, product.id, null));
  const totalQuantity = useAppSelector((state) => selectProductTotalQuantity(state, product.id));

  const displayQuantityValue = localQuantity !== null ? localQuantity : quantity;

  useEffect(() => {
    if (localQuantity !== null && localQuantity === quantity) {
      setLocalQuantity(null);
    }
  }, [quantity, localQuantity]);

  const isFavoritedFromStore = favLoaded
    ? favoriteItems.some((item) => item.id === product.id)
    : (product?.isFavorited ?? false);

  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null);
  const isFavorited = optimisticFavorite !== null ? optimisticFavorite : isFavoritedFromStore;

  useEffect(() => {
    if (optimisticFavorite !== null && optimisticFavorite === isFavoritedFromStore) {
      setOptimisticFavorite(null);
    }
  }, [isFavoritedFromStore, optimisticFavorite]);

  const { debouncedUpdate } = useCartDebounce(cartDispatch);
  const { debouncedToggleFavorite } = useFavoriteDebounce(favoriteDispatch);

  const isInCart = totalQuantity > 0;

  const imageUrl = sanitizeImageUrl(
    product.mainImage?.md || product.mainImage?.sm || product.mainImage?.o,
    appImages.noImage
  );

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const hasSizes = product.hasSizes && product.sizes && product.sizes.length > 0;
    const hasCustomizations = product.customizations && product.customizations.length > 0;

    if (hasSizes || hasCustomizations) {
      setSizePickerProduct(product);
      return;
    }

    const key = cartItemKey(product.id, null);
    const ts = Date.now();

    if (isInCart) {
      const current = localQuantity !== null ? localQuantity : quantity;
      const newQty = current + 1;
      setLocalQuantity(newQty);
      cartDispatch(updateLocalCartItem({ productId: product.id, productSizeId: null, quantity: newQty, optimisticTimestamp: ts }));
      debouncedUpdate(key, product.id, null, newQty, ts);
      return;
    }

    setLocalQuantity(1);
    cartDispatch(
      addLocalCartItem({
        productId: product.id,
        productSizeId: null,
        quantity: 1,
        productName: product.name,
        productImageUrl: product.mainImage?.sm || appImages.noImage,
        sizeName: null,
        finalPrice: product.displayPrice,
        currentPrice: product.displayOriginPrice || product.displayPrice,
        hasPromotion: product.hasPromotion,
        promotionType: product.displayPromotionType || null,
        promotionValue: product.displayPromotionValue || null,
        promotionFromDate: product.displayPromotionFromDate || null,
        promotionToDate: product.displayPromotionToDate || null,
        optimisticTimestamp: ts,
        sku: product.sku || "",
        barcode: product.barcode || "",
      })
    );
    debouncedUpdate(key, product.id, null, 1, ts);
  }, [isAuthenticated, product, isInCart, localQuantity, quantity, cartDispatch, debouncedUpdate]);

  const handleIncrement = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const hasSizes = product.hasSizes && product.sizes && product.sizes.length > 0;
    const hasCustomizations = product.customizations && product.customizations.length > 0;

    if (!isInCart) return;

    if (hasSizes || hasCustomizations) {
      setSizePickerProduct(product);
      return;
    }

    const key = cartItemKey(product.id, null);
    const ts = Date.now();

    const current = localQuantity !== null ? localQuantity : quantity;
    const newQty = current + 1;
    setLocalQuantity(newQty);
    cartDispatch(updateLocalCartItem({ productId: product.id, productSizeId: null, quantity: newQty, optimisticTimestamp: ts }));
    debouncedUpdate(key, product.id, null, newQty, ts);
  }, [product, localQuantity, quantity, isInCart, cartDispatch, debouncedUpdate]);

  const handleDecrement = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isInCart) return;

    const hasSizes = product.hasSizes && product.sizes && product.sizes.length > 0;
    const hasCustomizations = product.customizations && product.customizations.length > 0;

    if (hasSizes || hasCustomizations) {
      setSizePickerProduct(product);
      return;
    }

    const key = cartItemKey(product.id, null);
    const ts = Date.now();

    const current = localQuantity !== null ? localQuantity : quantity;
    const newQty = Math.max(0, current - 1);
    setLocalQuantity(newQty);
    cartDispatch(updateLocalCartItem({ productId: product.id, productSizeId: null, quantity: newQty, optimisticTimestamp: ts }));
    debouncedUpdate(key, product.id, null, newQty, ts);
  }, [product, localQuantity, quantity, isInCart, cartDispatch, debouncedUpdate]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    debouncedToggleFavorite(product, isFavorited, (newState) => {
      setOptimisticFavorite(newState);
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
      const quantity = qty ?? 0;
      const customizationIdList = customizationIds || [];
      const key = cartItemKey(selectedProduct.id, sizeId, customizationIdList);

      // Build full customization objects for combo-key matching in the cart slice
      const customizationObjects: CartItemCustomization[] = customizationIdList.map((cid) => {
        const c = selectedProduct.customizations?.find((pc) => pc.id === cid);
        return { id: "", productCustomizationId: cid, name: c?.name ?? "", priceAdjustment: c?.priceAdjustment ?? 0 };
      });

      // Per-combo check: does this exact size+customization combo already exist in cart?
      const sortedIncoming = [...customizationIdList].sort();
      const existingCombo = posCartItems.find((item) => {
        if (item.productId !== selectedProduct.id || item.productSizeId !== sizeId) return false;
        const itemCustomIds = (item.customizations || []).map((c) => c.productCustomizationId).sort();
        if (itemCustomIds.length !== sortedIncoming.length) return false;
        return sortedIncoming.every((id, idx) => id === itemCustomIds[idx]);
      });

      if (existingCombo) {
        // Update (or remove when qty=0) the existing combo
        cartDispatch(
          updateLocalCartItem({
            productId: selectedProduct.id,
            productSizeId: sizeId,
            quantity,
            optimisticTimestamp: timestamp,
            customizationIds: customizationIdList,
          })
        );
      } else if (quantity > 0) {
        // Brand-new combo — add as a separate cart item (same as POS behavior)
        cartDispatch(
          addLocalCartItem({
            productId: selectedProduct.id,
            productSizeId: sizeId,
            quantity,
            productName: selectedProduct.name,
            productImageUrl: selectedProduct.mainImage?.sm || appImages.noImage,
            sizeName: size?.name || null,
            finalPrice: size?.finalPrice || selectedProduct.displayPrice,
            currentPrice: size?.price || selectedProduct.displayOriginPrice || selectedProduct.displayPrice,
            hasPromotion: size?.hasPromotion || selectedProduct.hasPromotion,
            promotionType: size?.promotionType || selectedProduct.displayPromotionType || null,
            promotionValue: size?.promotionValue || selectedProduct.displayPromotionValue || null,
            promotionFromDate: size?.promotionFromDate || selectedProduct.displayPromotionFromDate || null,
            promotionToDate: size?.promotionToDate || selectedProduct.displayPromotionToDate || null,
            optimisticTimestamp: timestamp,
            sku: selectedProduct.sku || "",
            barcode: selectedProduct.barcode || "",
            customizations: customizationObjects,
          })
        );
      }

      setSizePickerProduct(null);

      // API call in background via debounce
      debouncedUpdate(key, selectedProduct.id, sizeId, quantity, timestamp, customizationIdList);
    },
    [cartDispatch, posCartItems, debouncedUpdate]
  );

  const isOutOfStock = product.status === "OUT_OF_STOCK";

  const hasSizesOrCustomizations =
    (product.hasSizes && product.sizes && product.sizes.length > 0) ||
    !!(product.customizations && product.customizations.length > 0);

  const displayQuantity = hasSizesOrCustomizations ? totalQuantity : displayQuantityValue;

  return (
    <>
      <div
        className={cn(
          "group relative bg-card rounded-[18px] border border-border/80 hover:border-primary/40 shadow-2xs hover:shadow-lg hover:shadow-primary/5 overflow-hidden transition-all duration-300 flex flex-col hover:-translate-y-1 active:scale-[0.98]",
          isInCart && "ring-2 ring-primary/40 border-primary/60 shadow-xs",
          isOutOfStock && "opacity-75",
          !isInCart && product?.hasPromotion && "ring-1 ring-amber-500/25 border-amber-500/30",
          className,
        )}
      >
        {/* Favorite Button — OUTSIDE Link wrapper so clicking it never triggers NProgress or navigation */}
        <div className="absolute top-1.5 right-1.5 z-30">
          <CustomButton
            size="icon"
            variant="unstyled"
            className={cn(
              "h-7 w-7 rounded-full shadow-md backdrop-blur-md transition-all duration-200 flex items-center justify-center active:scale-90 cursor-pointer",
              isFavorited
                ? "bg-red-500 text-white shadow-red-500/30 scale-105"
                : "bg-background/80 hover:bg-background text-muted-foreground hover:text-red-500 border border-border/60 hover:border-red-200"
            )}
            onClick={handleToggleFavorite}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isFavorited && "fill-current scale-110"
              )}
            />
          </CustomButton>
        </div>

        {/* Clickable area — image + info only */}
        <Link href={`/products/${product.id}`} className="flex flex-col flex-1 cursor-pointer">
          <ProductImage
            product={product}
            imageUrl={imageUrl}
            isOutOfStock={isOutOfStock}
            loading={imageLoading}
          />

          <div className="p-2.5 pb-1 flex flex-col flex-1">
            <ProductInfo product={product} />
          </div>
        </Link>

        {/* Actions live outside the Link — clicks never trigger navigation or the progress bar */}
        <div className="px-2 pb-2">
          <ProductActions
            displayQuantity={displayQuantity}
            isInCart={isInCart}
            isOutOfStock={isOutOfStock}
            onAddToCart={handleAddToCart}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        </div>
      </div>

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

      prevProps.product.mainImage?.sm === nextProps.product.mainImage?.sm &&

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
