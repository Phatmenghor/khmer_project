"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  fetchPublicProductById,
  fetchPublicProducts,
} from "@/features/main/store/thunks/public-product-thunks";
import { clearSelectedProduct } from "@/features/main/store/slice/public-product-slice";
import { usePublicProductState } from "@/features/main/store/state/public-product-state";
import { useCartState } from "@/features/main/store/state/cart-state";
import { useFavoriteState } from "@/features/main/store/state/favorite-state";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import {
  addLocalCartItem,
  updateLocalCartItem,
} from "@/features/main/store/slice/cart-slice";
import { toggleFavorite } from "@/features/main/store/thunks/favorite-thunks";
import { useCartDebounce, cartItemKey } from "@/hooks/use-cart-debounce";
import { ProductCard } from "@/components/shared/card/product-card";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { SizePickerModal } from "@/components/shared/modal/size-picker-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader2,
  Store,
  Tag,
  Eye,
  ZoomIn,
  X,
  ShoppingCart,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { formatCurrency } from "@/utils/common/currency-format";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/features/business/store/models/response/product-response";
import { CustomButton } from "@/components/shared/button/custom-button";
import { PageContainer } from "@/components/shared/common/page-container";
import { cn } from "@/lib/utils";
import { useScrollToTop } from "@/hooks/use-scroll-restoration";
import { getSizeQuantity } from "@/utils/common/quantity-utils";

const CUSTOMIZATION_LIMIT = 4;
const MAX_VISIBLE_THUMBS = 4;

function formatStockStatus(status: string): { label: string; className: string } {
  const map: Record<string, { label: string; className: string }> = {
    ENABLED: { label: "Available", className: "bg-emerald-500 hover:bg-emerald-600" },
    IN_STOCK: { label: "In Stock", className: "bg-emerald-500 hover:bg-emerald-600" },
    LOW_STOCK: { label: "Low Stock", className: "bg-amber-500 hover:bg-amber-600" },
    OUT_OF_STOCK: { label: "Out of Stock", className: "bg-rose-500 hover:bg-rose-600" },
    DISABLED: { label: "Unavailable", className: "bg-slate-500 hover:bg-slate-600" },
  };
  return (
    map[status] ?? { label: status.replace(/_/g, " "), className: "bg-slate-500 hover:bg-slate-600" }
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { dispatch, selectedProduct, loading, error } = usePublicProductState();
  const { dispatch: cartDispatch, items: cartItems } = useCartState();
  const { dispatch: favoriteDispatch, items: favoriteItems, loaded: favLoaded } = useFavoriteState();
  const { isAuthenticated } = useAuthState();

  const productId = params.id as string;
  const product = selectedProduct;
  const isLoading = loading.detail;

  useScrollToTop();

  const [similarProducts, setSimilarProducts] = useState<ProductDetailResponseModel[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);
  const [showAllCustomizations, setShowAllCustomizations] = useState(false);
  const [sizePickerOpen, setSizePickerOpen] = useState(false);
  const [selectedCustomizationIds, setSelectedCustomizationIds] = useState<Set<string>>(new Set());
  const [pageQuantity, setPageQuantity] = useState(0);

  const isFavoritedFromStore =
    favLoaded && product
      ? favoriteItems.some((item) => item.id === product.id)
      : (product?.isFavorited ?? false);
  const [isFavorited, setIsFavorited] = useState(false);
  useEffect(() => {
    setIsFavorited(isFavoritedFromStore);
  }, [isFavoritedFromStore]);

  const getQuantityForSize = useCallback(
    (sizeId: string | null) => {
      if (!product) return 0;
      const cartItem = cartItems.find(
        (item) => item.productId === product.id && item.productSizeId === sizeId,
      );
      if (cartItem) return cartItem.quantity;
      if (sizeId) {
        const size = product.sizes?.find((s) => s.id === sizeId);
        return getSizeQuantity(size as unknown as Record<string, unknown>);
      }
      return 0;
    },
    [cartItems, product],
  );

  const allImages = product
    ? [
        { id: "main", imageUrl: sanitizeImageUrl(product.mainImageUrl, appImages.NoImage) },
        ...(product.images || []).map((img) => ({
          id: img.id,
          imageUrl: sanitizeImageUrl(img.imageUrl, appImages.NoImage),
        })),
      ]
    : [];

  const fetchedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!productId || fetchedIdRef.current === productId) return;
    fetchedIdRef.current = productId;
    dispatch(clearSelectedProduct());
    dispatch(fetchPublicProductById(productId));
  }, [productId, dispatch]);

  useEffect(() => {
    if (!product) return;
    setSelectedImage(sanitizeImageUrl(product.mainImageUrl, appImages.NoImage));
    setCurrentImageIndex(0);
    setImageLoaded(false);
    setSelectedSize(product.hasSizes && product.sizes?.length ? product.sizes[0] : null);
    setThumbOffset(0);
    setShowAllCustomizations(false);
    setSelectedCustomizationIds(new Set());
  }, [product?.id]);

  useEffect(() => {
    const sizeId = selectedSize?.id ?? null;
    setPageQuantity(getQuantityForSize(sizeId));
  }, [selectedSize?.id, cartItems, product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchedSimilarRef = useRef<string | null>(null);
  useEffect(() => {
    if (!product?.id || fetchedSimilarRef.current === product.id) return;
    fetchedSimilarRef.current = product.id;
    dispatch(
      fetchPublicProducts({
        pageNo: 1,
        pageSize: 6,
        categoryId: product.categoryId || undefined,
        statuses: ["ACTIVE"],
      }),
    )
      .unwrap()
      .then((res) => {
        setSimilarProducts(
          (res.content as ProductDetailResponseModel[])
            .filter((p) => p.id !== productId)
            .slice(0, 4),
        );
      })
      .catch(() => {});
  }, [product?.id, product?.categoryId, productId, dispatch]);

  // ─── Image nav ────────────────────────────────────────────────────────────

  const selectImage = (url: string, index: number) => {
    setCurrentImageIndex(index);
    if (url !== selectedImage) {
      setSelectedImage(url);
      setImageLoaded(false);
    }
  };
  const prevImage = () => {
    const idx = currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;
    selectImage(allImages[idx].imageUrl, idx);
  };
  const nextImage = () => {
    const idx = currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1;
    selectImage(allImages[idx].imageUrl, idx);
  };
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const prevLightbox = () =>
    setLightboxIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const nextLightbox = () =>
    setLightboxIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));

  // ─── Vertical thumb nav ───────────────────────────────────────────────────

  const canScrollUp = thumbOffset > 0;
  const canScrollDown = thumbOffset + MAX_VISIBLE_THUMBS < allImages.length;
  const scrollThumbsUp = () => setThumbOffset((o) => Math.max(0, o - 1));
  const scrollThumbsDown = () =>
    setThumbOffset((o) => Math.min(allImages.length - MAX_VISIBLE_THUMBS, o + 1));
  const visibleThumbs = allImages.slice(thumbOffset, thumbOffset + MAX_VISIBLE_THUMBS);

  // ─── Price display ────────────────────────────────────────────────────────

  const displayPrice = selectedSize?.finalPrice ?? product?.displayPrice ?? 0;
  const originalPrice = selectedSize?.hasPromotion
    ? selectedSize.price
    : product?.hasPromotion && product.displayOriginPrice
      ? product.displayOriginPrice
      : null;
  const hasDiscount = selectedSize ? selectedSize.hasPromotion : product?.hasPromotion;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  // ─── Cart status ──────────────────────────────────────────────────────────

  const totalCartQty = product?.hasSizes
    ? (product.sizes?.reduce((sum, s) => sum + getQuantityForSize(s.id), 0) ?? 0)
    : getQuantityForSize(null);
  // ─── Modal initial quantities ─────────────────────────────────────────────

  // Stable array reference — avoid recreating on every render (would retrigger modal's open effect)
  const initialCustomizationsForModal = useMemo(
    () => Array.from(selectedCustomizationIds),
    [selectedCustomizationIds],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialQuantities = useMemo(() => {
    const map = new Map<string, number>();
    if (!product) return map;
    if (product.hasSizes && product.sizes) {
      product.sizes.forEach((s) => {
        const qty = getQuantityForSize(s.id);
        if (qty > 0) map.set(s.id, qty);
      });
    } else {
      const qty = getQuantityForSize(null);
      if (qty > 0) map.set("__no_size__", qty);
    }
    return map;
  }, [product?.id, cartItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasSizes = !!(product?.hasSizes && product?.sizes && product.sizes.length > 0);
  const hasCustomizations = !!(product?.customizations && product.customizations.length > 0);

  const { debouncedUpdate } = useCartDebounce(cartDispatch);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const toggleCustomization = useCallback((id: string) => {
    setSelectedCustomizationIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setSizePickerOpen(true);
  }, [isAuthenticated]);

  const handleSizeSelect = useCallback(
    (
      selectedProduct: ProductDetailResponseModel,
      size?: ProductSize,
      qty?: number,
      customizationIds?: string[],
    ) => {
      const timestamp = Date.now();
      const sizeId = size?.id === "__no_size__" ? null : size?.id ?? null;
      const quantity = qty ?? 1;
      const customizations = customizationIds || [];
      const key = cartItemKey(selectedProduct.id, sizeId, customizations);

      const isEditing = totalCartQty > 0;

      if (isEditing) {
        cartDispatch(
          updateLocalCartItem({
            productId: selectedProduct.id,
            productSizeId: sizeId,
            quantity,
            optimisticTimestamp: timestamp,
          }),
        );
      } else if (quantity > 0) {
        cartDispatch(
          addLocalCartItem({
            productId: selectedProduct.id,
            productSizeId: sizeId,
            quantity,
            productName: selectedProduct.name,
            productImageUrl: selectedProduct.mainImageUrl,
            sizeName: size?.name ?? null,
            finalPrice: size?.finalPrice ?? selectedProduct.displayPrice,
            currentPrice: size?.price ?? selectedProduct.displayOriginPrice ?? selectedProduct.displayPrice,
            hasPromotion: size?.hasPromotion ?? selectedProduct.hasPromotion,
            promotionType: size?.promotionType ?? selectedProduct.displayPromotionType ?? null,
            promotionValue: size?.promotionValue ?? selectedProduct.displayPromotionValue ?? null,
            promotionFromDate: size?.promotionFromDate ?? selectedProduct.displayPromotionFromDate ?? null,
            promotionToDate: size?.promotionToDate ?? selectedProduct.displayPromotionToDate ?? null,
            optimisticTimestamp: timestamp,
          }),
        );
      }

      setSizePickerOpen(false);
      debouncedUpdate(key, selectedProduct.id, sizeId, quantity, timestamp, customizations);
    },
    [cartDispatch, totalCartQty, debouncedUpdate],
  );

  const handleInlineDecrement = useCallback(() => {
    if (!isAuthenticated) { setShowLoginModal(true); return; }
    if (!product) return;
    if (hasSizes || hasCustomizations) { setSizePickerOpen(true); return; }
    if (pageQuantity <= 0) return;

    const key = cartItemKey(product.id, null);
    const ts = Date.now();
    const newQty = pageQuantity - 1;
    cartDispatch(updateLocalCartItem({ productId: product.id, productSizeId: null, quantity: newQty, optimisticTimestamp: ts }));
    debouncedUpdate(key, product.id, null, newQty, ts);
    setPageQuantity(newQty);
  }, [isAuthenticated, product, hasSizes, hasCustomizations, pageQuantity, cartDispatch, debouncedUpdate]);

  const handleInlineIncrement = useCallback(() => {
    if (!isAuthenticated) { setShowLoginModal(true); return; }
    if (!product) return;
    if (hasSizes || hasCustomizations) { setSizePickerOpen(true); return; }

    const key = cartItemKey(product.id, null);
    const ts = Date.now();
    const newQty = pageQuantity + 1;

    if (pageQuantity === 0) {
      cartDispatch(
        addLocalCartItem({
          productId: product.id,
          productSizeId: null,
          quantity: 1,
          productName: product.name,
          productImageUrl: product.mainImageUrl,
          sizeName: null,
          finalPrice: product.displayPrice,
          currentPrice: product.displayOriginPrice ?? product.displayPrice,
          hasPromotion: product.hasPromotion,
          promotionType: product.displayPromotionType ?? null,
          promotionValue: product.displayPromotionValue ?? null,
          promotionFromDate: product.displayPromotionFromDate ?? null,
          promotionToDate: product.displayPromotionToDate ?? null,
          optimisticTimestamp: ts,
        }),
      );
      debouncedUpdate(key, product.id, null, 1, ts);
    } else {
      cartDispatch(updateLocalCartItem({ productId: product.id, productSizeId: null, quantity: newQty, optimisticTimestamp: ts }));
      debouncedUpdate(key, product.id, null, newQty, ts);
    }
    setPageQuantity(newQty);
  }, [isAuthenticated, product, hasSizes, hasCustomizations, pageQuantity, cartDispatch, debouncedUpdate]);

  const handleToggleFavorite = () => {
    if (!product) return;
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setIsFavorited((prev) => !prev);
    setIsTogglingFavorite(true);
    favoriteDispatch(toggleFavorite({ productId: product.id, isFavorited }))
      .unwrap()
      .then(() => setIsTogglingFavorite(false))
      .catch((err: unknown) => {
        setIsFavorited((prev) => !prev);
        setIsTogglingFavorite(false);
        showToast.error(
          (err as { message?: string })?.message || Messages.favorites.updateFailed,
        );
      });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name || "Product", url: window.location.href });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast.success(Messages.clipboard.linkCopied);
    }
  };

  // ─── Guards ───────────────────────────────────────────────────────────────

  if (isLoading || (!product && !error.detail)) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <PageContainer className="min-h-screen flex flex-col py-16 text-center">
        <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </PageContainer>
    );
  }

  const stockStatusInfo = formatStockStatus(
    product.stockStatus || (product.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "IN_STOCK"),
  );
  const isOutOfStock =
    product.stockStatus === "OUT_OF_STOCK" || product.stockStatus === "DISABLED";

  const addToCartLabel = hasSizes ? "Choose Size" : hasCustomizations ? "Choose Add-ons" : "Add to Cart";

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="min-h-screen flex flex-col py-4 sm:py-6">

        {/* Back */}
        <CustomButton
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-5 -ml-1 w-fit gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </CustomButton>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[9fr_11fr] gap-8 lg:gap-10 mb-12">

          {/* Left: image gallery */}
          <div className="space-y-3">

            {/* Desktop: thumb strip left + main image */}
            <div className="flex gap-2.5">

              {/* Vertical thumb strip — desktop only */}
              {allImages.length > 1 && (
                <div className="hidden lg:flex flex-col items-center gap-1.5 w-[76px] shrink-0">
                  <button
                    onClick={scrollThumbsUp}
                    disabled={!canScrollUp}
                    className={cn(
                      "w-full h-7 rounded-lg flex items-center justify-center transition-colors",
                      canScrollUp
                        ? "hover:bg-muted text-foreground cursor-pointer"
                        : "text-muted-foreground/20 cursor-default",
                    )}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>

                  {visibleThumbs.map((img, i) => {
                    const idx = thumbOffset + i;
                    const isActive = idx === currentImageIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => selectImage(img.imageUrl, idx)}
                        className={cn(
                          "relative w-[76px] h-[76px] rounded-xl overflow-hidden shrink-0 transition-all duration-200",
                          isActive
                            ? "ring-[3px] ring-primary ring-offset-1 shadow-md scale-[1.03]"
                            : "ring-1 ring-border/60 opacity-55 hover:opacity-90 hover:ring-primary/40",
                        )}
                      >
                        <Image
                          src={sanitizeImageUrl(img.imageUrl, appImages.NoImage)}
                          alt={`View ${idx + 1}`}
                          fill
                          sizes="76px"
                          className="object-cover"
                        />
                        {!isActive && (
                          <div className="absolute inset-0 bg-black/15 transition-opacity duration-200" />
                        )}
                        {isActive && (
                          <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-xl" />
                        )}
                      </button>
                    );
                  })}

                  <button
                    onClick={scrollThumbsDown}
                    disabled={!canScrollDown}
                    className={cn(
                      "w-full h-7 rounded-lg flex items-center justify-center transition-colors",
                      canScrollDown
                        ? "hover:bg-muted text-foreground cursor-pointer"
                        : "text-muted-foreground/20 cursor-default",
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Main image */}
              <div
                className={cn(
                  "relative rounded-2xl overflow-hidden bg-muted group shadow-sm flex-1",
                  "aspect-[4/3] lg:aspect-auto lg:h-[420px]",
                )}
              >
                {!imageLoaded && <Skeleton className="absolute inset-0 rounded-2xl" />}
                <Image
                  key={`main-${currentImageIndex}`}
                  src={selectedImage || appImages.NoImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 55vw"
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    imageLoaded ? "opacity-100" : "opacity-0",
                  )}
                  onLoad={() => setImageLoaded(true)}
                  priority
                />

                {hasDiscount && discountPercent > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute top-3 left-3 text-sm font-bold px-3 py-1.5 shadow"
                  >
                    -{discountPercent}%
                  </Badge>
                )}

                <button
                  onClick={() => openLightbox(currentImageIndex)}
                  className="absolute bottom-3 right-3 bg-background/75 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-zoom-in hover:bg-background"
                >
                  <ZoomIn className="h-4 w-4 text-foreground/70" />
                </button>

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/85 hover:bg-background p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/85 hover:bg-background p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium shadow">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: horizontal thumb strip */}
            {allImages.length > 1 && (
              <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 pt-1">
                {allImages.map((img, i) => {
                  const isActive = i === currentImageIndex;
                  return (
                    <button
                      key={`mob-${i}`}
                      onClick={() => selectImage(img.imageUrl, i)}
                      className={cn(
                        "relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden transition-all duration-200",
                        isActive
                          ? "ring-[3px] ring-primary ring-offset-1 shadow-md scale-[1.05]"
                          : "ring-1 ring-border/60 opacity-55 hover:opacity-90 hover:ring-primary/40",
                      )}
                    >
                      <Image
                        src={sanitizeImageUrl(img.imageUrl, appImages.NoImage)}
                        alt={`View ${i + 1}`}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                      {!isActive && (
                        <div className="absolute inset-0 bg-black/15 transition-opacity duration-200" />
                      )}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: product info */}
          <div className="flex flex-col gap-5">

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {product.categoryName && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Tag className="h-3 w-3" />
                  {product.categoryName}
                </Badge>
              )}
              {product.brandName && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Store className="h-3 w-3" />
                  {product.brandName}
                </Badge>
              )}
              <Badge className={cn("text-xs", stockStatusInfo.className)}>
                {stockStatusInfo.label}
              </Badge>
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight -mt-1">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl sm:text-4xl font-bold text-primary leading-none">
                {formatCurrency(displayPrice)}
              </span>
              {originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through leading-none">
                    {formatCurrency(originalPrice)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                    Save {formatCurrency(originalPrice - displayPrice)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Sizes — preview / price exploration */}
            {hasSizes && (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Available Sizes
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.sizes!.map((size) => {
                    const sizeCartQty = getQuantityForSize(size.id);
                    const isSelected = selectedSize?.id === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "relative border-2 rounded-xl px-4 py-3 text-left transition-all duration-200 min-w-[76px]",
                          isSelected
                            ? "border-primary bg-primary/8 shadow-md ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm",
                        )}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm z-10">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {sizeCartQty > 0 && (
                          <div className="absolute -top-2 -left-2 min-w-[20px] h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1.5 shadow-sm z-10">
                            {sizeCartQty}
                          </div>
                        )}
                        <div className="font-semibold text-sm">{size.name}</div>
                        <div className={cn("font-bold text-xs mt-0.5", isSelected ? "text-primary" : "text-muted-foreground")}>
                          {formatCurrency(size.finalPrice)}
                        </div>
                        {size.hasPromotion && (
                          <div className="text-[10px] text-muted-foreground/70 line-through mt-0.5">
                            {formatCurrency(size.price)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inline quantity — product-card style, background API */}
            {!isOutOfStock && (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {hasSizes && selectedSize ? `Quantity — ${selectedSize.name}` : "Quantity"}
                </p>
                <div className="flex items-center gap-2">
                  <CustomButton
                    size="icon"
                    variant="outline"
                    className={cn(
                      "h-10 w-10 shrink-0 transition-all duration-150",
                      pageQuantity > 0
                        ? "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                        : "opacity-40 cursor-not-allowed",
                    )}
                    onClick={handleInlineDecrement}
                    disabled={pageQuantity <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </CustomButton>

                  <div className="w-16 h-10 bg-primary/10 text-primary font-bold text-base rounded-lg border border-primary/20 flex items-center justify-center select-none">
                    {hasSizes || hasCustomizations ? totalCartQty : pageQuantity}
                  </div>

                  <CustomButton
                    size="icon"
                    variant="outline"
                    className="h-10 w-10 shrink-0 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-150"
                    onClick={handleInlineIncrement}
                  >
                    <Plus className="h-4 w-4" />
                  </CustomButton>

                  {pageQuantity > 0 && displayPrice > 0 && !(hasSizes || hasCustomizations) && (
                    <span className="text-sm text-muted-foreground ml-1">
                      = <span className="font-semibold text-foreground">{formatCurrency(displayPrice * pageQuantity)}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Customizations — selectable, collapsible if >4 */}
            {hasCustomizations && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Add-ons Available
                  </p>
                  {selectedCustomizationIds.size > 0 && (
                    <span className="text-xs text-primary font-medium">
                      {selectedCustomizationIds.size} selected
                    </span>
                  )}
                </div>
                <div className="border rounded-xl overflow-hidden">
                  {(showAllCustomizations
                    ? product.customizations
                    : product.customizations.slice(0, CUSTOMIZATION_LIMIT)
                  ).map((c, idx, arr) => {
                    const isSelected = selectedCustomizationIds.has(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCustomization(c.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                          idx < arr.length - 1 && "border-b",
                          isSelected ? "bg-primary/5" : "hover:bg-muted/40",
                        )}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-border bg-background",
                          )}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                        </div>
                        <span className="flex-1 text-foreground/90">{c.name}</span>
                        {c.priceAdjustment !== 0 ? (
                          <span
                            className={cn(
                              "font-semibold text-xs px-2 py-0.5 rounded-full shrink-0",
                              isSelected
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground bg-muted/60",
                            )}
                          >
                            +{formatCurrency(c.priceAdjustment)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground shrink-0">Free</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {product.customizations.length > CUSTOMIZATION_LIMIT && (
                  <button
                    onClick={() => setShowAllCustomizations((v) => !v)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    {showAllCustomizations
                      ? "Show less"
                      : `+${product.customizations.length - CUSTOMIZATION_LIMIT} more add-ons`}
                  </button>
                )}
              </div>
            )}

            {/* Add to Cart CTA */}
            <CustomButton
              size="lg"
              className={cn(
                "h-12 rounded-xl gap-2.5 font-semibold text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200",
                totalCartQty > 0 && "shadow-md",
              )}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-5 w-5" />
              {isOutOfStock
                ? "Out of Stock"
                : hasSizes
                  ? totalCartQty > 0
                    ? "Manage Sizes"
                    : addToCartLabel
                  : hasCustomizations
                    ? totalCartQty > 0
                      ? "Manage Add-ons"
                      : addToCartLabel
                    : totalCartQty > 0
                      ? "Update Cart"
                      : addToCartLabel}
            </CustomButton>

            {/* Secondary actions */}
            <div className="grid grid-cols-2 gap-3">
              <CustomButton
                size="lg"
                variant="outline"
                className={cn(
                  "h-11 rounded-xl gap-2 font-medium transition-all duration-200",
                  isFavorited
                    ? "bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100 hover:border-rose-400 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/50"
                    : "hover:bg-rose-50/80 hover:border-rose-200 hover:text-rose-500 dark:hover:bg-rose-950/20 dark:hover:text-rose-400",
                )}
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
              >
                {isTogglingFavorite ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isFavorited && "fill-current scale-110",
                    )}
                  />
                )}
                {isFavorited ? "Saved" : "Wishlist"}
              </CustomButton>
              <CustomButton
                size="lg"
                variant="outline"
                className="h-11 rounded-xl gap-2 font-medium hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 dark:hover:bg-sky-950/30 dark:hover:border-sky-800 dark:hover:text-sky-400 transition-all duration-200"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
                Share
              </CustomButton>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-4 border-t text-muted-foreground">
              <div className="flex items-center gap-1.5 text-sm">
                <Eye className="h-4 w-4" />
                <span>{product.viewCount.toLocaleString()}</span>
                <span className="text-xs">views</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Heart className="h-4 w-4" />
                <span>{product.favoriteCount.toLocaleString()}</span>
                <span className="text-xs">saves</span>
              </div>
              {product.sku && (
                <div className="ml-auto text-xs font-mono text-muted-foreground/60">
                  {product.sku}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-xl sm:text-2xl font-bold">You May Also Like</h2>
              <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {similarProducts.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </PageContainer>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-between"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="w-full flex items-center justify-between px-4 py-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-white/70 text-sm font-medium">
              {lightboxIndex + 1} / {allImages.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            className="relative flex-1 w-full flex items-center justify-center px-14"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={`lb-${lightboxIndex}`}
              src={allImages[lightboxIndex]?.imageUrl || appImages.NoImage}
              alt={product.name}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg select-none"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevLightbox}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextLightbox}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <div
            className="w-full flex justify-center gap-2 px-4 py-3 overflow-x-auto shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {allImages.map((img, i) => (
              <button
                key={`lb-th-${i}`}
                onClick={() => setLightboxIndex(i)}
                className={cn(
                  "relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all",
                  i === lightboxIndex ? "ring-2 ring-white scale-110" : "opacity-40 hover:opacity-80",
                )}
              >
                <img
                  src={sanitizeImageUrl(img.imageUrl, appImages.NoImage)}
                  alt={`${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <SizePickerModal
        product={product}
        open={sizePickerOpen}
        onOpenChange={setSizePickerOpen}
        onSizeSelect={handleSizeSelect}
        isEditing={totalCartQty > 0}
        initialQuantities={initialQuantities}
        initialCustomizations={initialCustomizationsForModal}
      />

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <PageContainer className="py-6">
      <Skeleton className="h-9 w-20 mb-5 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[9fr_11fr] gap-10">
        <div className="space-y-3">
          <div className="flex gap-2.5">
            <div className="hidden lg:flex flex-col gap-1.5 w-[76px]">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-[76px] h-[76px] rounded-xl" />
              ))}
            </div>
            <Skeleton className="flex-1 aspect-[4/3] lg:aspect-auto lg:h-[420px] rounded-2xl" />
          </div>
          <div className="flex lg:hidden gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-[68px] h-[68px] rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="space-y-5 pt-2">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-4/5 rounded-lg" />
          <Skeleton className="h-12 w-40 rounded-lg" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[68px] w-[64px] rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
