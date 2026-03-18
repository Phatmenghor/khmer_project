"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  fetchPublicProductById,
  fetchPublicProducts,
} from "@/redux/features/main/store/thunks/public-product-thunks";
import { clearSelectedProduct } from "@/redux/features/main/store/slice/public-product-slice";
import { usePublicProductState } from "@/redux/features/main/store/state/public-product-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useFavoriteState } from "@/redux/features/main/store/state/favorite-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import {
  addLocalCartItem,
  updateLocalCartItem,
} from "@/redux/features/main/store/slice/cart-slice";
import {
  addToCart,
  updateCartItem,
} from "@/redux/features/main/store/thunks/cart-thunks";
import { toggleFavorite } from "@/redux/features/main/store/thunks/favorite-thunks";
import { ProductCard } from "@/components/shared/card/product-card";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { QuantitySelector } from "@/components/shared/input/quantity-selector";
import { showToast } from "@/components/shared/common/show-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Store,
  Tag,
  Eye,
  ZoomIn,
  X,
  Check,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/utils/common/currency-format";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/redux/features/business/store/models/response/product-response";
import { CustomButton } from "@/components/shared/button/custom-button";
import { PageContainer } from "@/components/shared/common/page-container";
import { cn } from "@/lib/utils";
import { useScrollToTop } from "@/hooks/use-scroll-restoration";
import { getSizeQuantity } from "@/utils/common/quantity-utils";

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

  // ── Pending qty state for sized products (modal-like flow, no immediate API) ──
  const [pendingQuantities, setPendingQuantities] = useState<Map<string, number>>(new Map());
  const [modifiedSizes, setModifiedSizes] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [clearingSize, setClearingSize] = useState<string | null>(null);

  // ── Favorite sync ──
  const isFavoritedFromStore = favLoaded && product
    ? favoriteItems.some((item) => item.id === product.id)
    : product?.isFavorited ?? false;
  const [isFavorited, setIsFavorited] = useState(false);
  useEffect(() => { setIsFavorited(isFavoritedFromStore); }, [isFavoritedFromStore]);

  // Get quantity for a size - standardized naming
  // Returns: quantity from Redux cart if available, otherwise from API quantityInCart
  const getQuantityForSize = useCallback(
    (sizeId: string | null) => {
      if (!product) return 0;
      const cartItem = cartItems.find(
        (item) => item.productId === product.id && item.productSizeId === sizeId
      );
      // Use Redux cart state if available (authoritative during session)
      if (cartItem) return cartItem.quantity;

      // Fallback to API response quantityInCart
      if (sizeId) {
        const size = product.sizes?.find((s) => s.id === sizeId);
        return getSizeQuantity(size);
      }
      // For unsized products
      return product.quantityInCart || 0;
    },
    [cartItems, product]
  );

  // Get display quantity - shows pending edits if any, otherwise actual quantity
  // Standard naming: displayQuantity = UI quantity (includes pending/unsaved edits)
  const getDisplayQuantity = useCallback(
    (sizeId: string | null) => {
      const key = sizeId || "no_size";
      // If user made unsaved edits, show those (pendingQuantity)
      if (pendingQuantities.has(key)) return pendingQuantities.get(key)!;
      // Otherwise show actual quantity from cart/API
      return getQuantityForSize(sizeId);
    },
    [pendingQuantities, getQuantityForSize]
  );

  // Reset pending state when product changes
  useEffect(() => {
    setPendingQuantities(new Map());
    setModifiedSizes(new Set());
  }, [product?.id]);

  // Build image list
  const allImages = product
    ? [
        { id: "main", imageUrl: sanitizeImageUrl(product.mainImageUrl, appImages.NoImage) },
        ...(product.images || []).map((img) => ({
          id: img.id,
          imageUrl: sanitizeImageUrl(img.imageUrl, appImages.NoImage),
        })),
      ]
    : [];

  // Guard against double-fetch
  const fetchedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!productId || fetchedIdRef.current === productId) return;
    fetchedIdRef.current = productId;
    dispatch(clearSelectedProduct());
    dispatch(fetchPublicProductById(productId));
  }, [productId, dispatch]);

  // Sync image + size when product loads
  useEffect(() => {
    if (!product) return;
    setSelectedImage(sanitizeImageUrl(product.mainImageUrl, appImages.NoImage));
    setCurrentImageIndex(0);
    setImageLoaded(false);
    setSelectedSize(product.hasSizes && product.sizes?.length ? product.sizes[0] : null);
  }, [product?.id]);

  // Fetch similar products
  const fetchedSimilarRef = useRef<string | null>(null);
  useEffect(() => {
    if (!product?.id || fetchedSimilarRef.current === product.id) return;
    fetchedSimilarRef.current = product.id;
    dispatch(fetchPublicProducts({ pageNo: 1, pageSize: 6, categoryId: product.categoryId || undefined, status: "ACTIVE" }))
      .unwrap()
      .then((res) => {
        setSimilarProducts((res.content || []).filter((p: any) => p.id !== productId).slice(0, 4));
      })
      .catch(() => {});
  }, [product?.id, product?.categoryId, productId, dispatch]);

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

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const prevLightbox = () => setLightboxIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const nextLightbox = () => setLightboxIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));

  const getDisplayPrice = () => selectedSize?.finalPrice ?? product?.displayPrice ?? 0;
  const getOriginalPrice = () => {
    if (selectedSize?.hasPromotion) return selectedSize.price;
    if (product?.hasPromotion && product.displayOriginPrice) return product.displayOriginPrice;
    return null;
  };
  const hasDiscount = selectedSize ? selectedSize.hasPromotion : product?.hasPromotion;
  const discountPercent = (() => {
    const orig = getOriginalPrice();
    if (!orig) return 0;
    return Math.round(((orig - getDisplayPrice()) / orig) * 100);
  })();

  // ── Pending qty handlers (sized products) ──────────────────────────────
  const handlePendingQtyChange = useCallback(
    (sizeId: string | null, newQty: number) => {
      if (!isAuthenticated) { setShowLoginModal(true); return; }
      const key = sizeId || "no_size";
      const currentQuantity = getQuantityForSize(sizeId);
      setPendingQuantities((prev) => { const n = new Map(prev); n.set(key, newQty); return n; });
      setModifiedSizes((prev) => {
        const n = new Set(prev);
        if (newQty === currentQuantity) n.delete(key); else n.add(key);
        return n;
      });
    },
    [isAuthenticated, getQuantityForSize]
  );

  const handleClearSize = useCallback(
    async (sizeId: string | null) => {
      if (!product) return;
      const key = sizeId || "no_size";
      const currentQty = getQuantityForSize(sizeId);
      if (currentQty === 0) {
        setPendingQuantities((prev) => { const n = new Map(prev); n.delete(key); return n; });
        setModifiedSizes((prev) => { const n = new Set(prev); n.delete(key); return n; });
        return;
      }
      cartDispatch(updateLocalCartItem({ productId: product.id, productSizeId: sizeId, quantity: 0 }));
      setPendingQuantities((prev) => { const n = new Map(prev); n.delete(key); return n; });
      setModifiedSizes((prev) => { const n = new Set(prev); n.delete(key); return n; });
      setClearingSize(key);
      try {
        await cartDispatch(updateCartItem({ productId: product.id, productSizeId: sizeId, quantity: 0 })).unwrap();
        showToast.success("Removed from cart");
      } catch (err: any) {
        showToast.error(err?.message || "Failed to remove");
      } finally {
        setClearingSize(null);
      }
    },
    [product, cartDispatch, getQuantityForSize]
  );

  const handleDiscard = useCallback(() => {
    setPendingQuantities(new Map());
    setModifiedSizes(new Set());
  }, []);

  const handleSave = useCallback(async () => {
    if (!product || modifiedSizes.size === 0) return;
    if (!isAuthenticated) { setShowLoginModal(true); return; }
    setIsSaving(true);
    try {
      const promises: Promise<any>[] = [];
      const ts = Date.now(); // Single timestamp for conflict resolution
      for (const key of modifiedSizes) {
        const sizeId = key === "no_size" ? null : key;
        const newQty = pendingQuantities.get(key) ?? getQuantityForSize(sizeId);
        const currentQuantity = getQuantityForSize(sizeId);
        if (newQty === currentQuantity) continue;
        if (currentQuantity === 0 && newQty > 0) {
          const size = product.sizes?.find((s) => s.id === sizeId);
          const finalPrice = size?.finalPrice ?? product.displayPrice ?? 0;
          const isPromo = size ? size.hasPromotion : (product.hasPromotion ?? false);
          cartDispatch(addLocalCartItem({
            productId: product.id, productSizeId: sizeId, quantity: newQty,
            productName: product.name, productImageUrl: product.mainImageUrl,
            sizeName: size?.name ?? null, finalPrice,
            currentPrice: size?.hasPromotion ? size.price : (product.displayOriginPrice ?? finalPrice),
            hasPromotion: isPromo,
            promotionType: size?.promotionType ?? product.displayPromotionType ?? null,
            promotionValue: size?.promotionValue ?? product.displayPromotionValue ?? null,
            promotionFromDate: size?.promotionFromDate ?? product.displayPromotionFromDate ?? null,
            promotionToDate: size?.promotionToDate ?? product.displayPromotionToDate ?? null,
            optimisticTimestamp: ts,
          }));
          promises.push(cartDispatch(addToCart({ productId: product.id, productSizeId: sizeId, quantity: newQty, optimisticTimestamp: ts })).unwrap());
        } else {
          cartDispatch(updateLocalCartItem({ productId: product.id, productSizeId: sizeId, quantity: newQty, optimisticTimestamp: ts }));
          promises.push(cartDispatch(updateCartItem({ productId: product.id, productSizeId: sizeId, quantity: newQty, optimisticTimestamp: ts })).unwrap());
        }
      }
      await Promise.all(promises);
      showToast.success("Cart updated");
      setPendingQuantities(new Map());
      setModifiedSizes(new Set());
    } catch (err: any) {
      showToast.error(err?.message || "Failed to update cart");
    } finally {
      setIsSaving(false);
    }
  }, [product, isAuthenticated, modifiedSizes, pendingQuantities, cartDispatch, getQuantityForSize]);

  const handleToggleFavorite = async () => {
    if (!product) return;
    if (!isAuthenticated) { setShowLoginModal(true); return; }
    setIsFavorited((prev) => !prev);
    setIsTogglingFavorite(true);
    try {
      await favoriteDispatch(toggleFavorite({ productId: product.id, isFavorited })).unwrap();
    } catch (err: any) {
      setIsFavorited((prev) => !prev);
      showToast.error(err?.message || "Failed to update favorites");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product?.name || "Product", url: window.location.href }); } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast.success("Link copied to clipboard");
    }
  };

  if (isLoading || (!product && !error.detail)) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <PageContainer className="py-16 text-center">
        <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="py-4 sm:py-6">

        {/* Back */}
        <CustomButton
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-5 -ml-1 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </CustomButton>

        {/* ── Main grid — 45 image / 55 info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[9fr_11fr] gap-8 lg:gap-10 mb-16">

          {/* ──── LEFT: Image Gallery (40%) ──── */}
          <div className="space-y-3">

            {/* Main image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted group shadow-sm">
              {!imageLoaded && <Skeleton className="absolute inset-0 rounded-2xl" />}
              <Image
                key={`main-${currentImageIndex}`}
                src={selectedImage || appImages.NoImage}
                alt={product.name}
                fill
                className={cn("object-cover transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")}
                onLoad={() => setImageLoaded(true)}
                priority
              />

              {/* Discount badge */}
              {hasDiscount && discountPercent > 0 && (
                <Badge variant="destructive" className="absolute top-3 left-3 text-sm font-bold px-3 py-1.5 shadow">
                  -{discountPercent}%
                </Badge>
              )}

              {/* Zoom icon */}
              <button
                onClick={() => openLightbox(currentImageIndex)}
                className="absolute bottom-3 right-3 bg-background/75 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-zoom-in hover:bg-background"
              >
                <ZoomIn className="h-4 w-4 text-foreground/70" />
              </button>

              {/* Prev / Next */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium shadow">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={`thumb-${i}`}
                    onClick={() => selectImage(img.imageUrl, i)}
                    className={cn(
                      "relative flex-shrink-0 w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-150",
                      i === currentImageIndex
                        ? "ring-2 ring-primary ring-offset-2 shadow-sm"
                        : "opacity-55 hover:opacity-100 hover:ring-2 hover:ring-primary/40 hover:ring-offset-1"
                    )}
                  >
                    <Image src={sanitizeImageUrl(img.imageUrl, appImages.NoImage)} alt={`View ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ──── RIGHT: Product Info (60%) ──── */}
          <div className="flex flex-col gap-4">

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {product.categoryName && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Tag className="h-3 w-3" />{product.categoryName}
                </Badge>
              )}
              {product.brandName && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Store className="h-3 w-3" />{product.brandName}
                </Badge>
              )}
              <Badge className={cn("text-xs", product.status === "OUT_OF_STOCK" ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600")}>
                {product.status === "OUT_OF_STOCK" ? "Out of Stock" : "In Stock"}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-3xl sm:text-4xl font-bold text-primary leading-none">
                {formatCurrency(getDisplayPrice())}
              </span>
              {getOriginalPrice() && (
                <>
                  <span className="text-lg text-muted-foreground line-through leading-none">
                    {formatCurrency(getOriginalPrice()!)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                    Save {formatCurrency(getOriginalPrice()! - getDisplayPrice())}
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

            {/* ── Cart section — unified style for sized and non-sized ── */}
            {(() => {
              const sizeId: string | null = product.hasSizes ? (selectedSize?.id ?? null) : null;
              const displayQty = getDisplayQuantity(sizeId);
              const cartQty = getQuantityForSize(sizeId);
              const unitPrice = (product.hasSizes ? selectedSize?.finalPrice : null) ?? product.displayPrice ?? 0;
              const clearKey = sizeId || "no_size";
              const showQtySection = !product.hasSizes || !!selectedSize;

              // Totals across ALL sizes (or just the single non-sized item)
              const totalCartQtyAllSizes = product.hasSizes
                ? (product.sizes?.reduce((sum, s) => sum + getQuantityForSize(s.id), 0) ?? 0)
                : getQuantityForSize(null);
              const totalCartValueAllSizes = product.hasSizes
                ? (product.sizes?.reduce((sum, s) => sum + s.finalPrice * getQuantityForSize(s.id), 0) ?? 0)
                : unitPrice * getQuantityForSize(null);
              const totalDisplayValueAllSizes = product.hasSizes
                ? (product.sizes?.reduce((sum, s) => sum + s.finalPrice * getDisplayQuantity(s.id), 0) ?? 0)
                : unitPrice * displayQty;
              const totalOrigValueAllSizes = product.hasSizes
                ? (product.sizes?.reduce((sum, s) => sum + (s.hasPromotion ? s.price : s.finalPrice) * getDisplayQuantity(s.id), 0) ?? 0)
                : (getOriginalPrice() ?? unitPrice) * displayQty;
              const hasAnyPromotion = product.hasSizes
                ? (product.sizes?.some(s => s.hasPromotion && getDisplayQuantity(s.id) > 0) ?? false)
                : !!(getOriginalPrice() && displayQty > 0);

              return (
                <div className="space-y-3">

                  {/* Size buttons — sized products only */}
                  {product.hasSizes && product.sizes && product.sizes.length > 0 && (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Choose Size
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => {
                          const szQty = getDisplayQuantity(size.id);
                          const isModified = modifiedSizes.has(size.id) && szQty !== getQuantityForSize(size.id);
                          const isActive = selectedSize?.id === size.id;
                          return (
                            <button
                              key={size.id}
                              onClick={() => setSelectedSize(size)}
                              className={cn(
                                "relative border-2 rounded-xl px-4 py-2.5 text-left min-w-[76px] transition-all",
                                isActive
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                                  : "border-border hover:border-primary/50 hover:bg-muted/40"
                              )}
                            >
                              {isActive && (
                                <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                                  <Check className="h-2.5 w-2.5" />
                                </div>
                              )}
                              <div className="font-semibold text-sm">{size.name}</div>
                              <div className="text-primary font-bold text-sm">{formatCurrency(size.finalPrice)}</div>
                              {size.hasPromotion && (
                                <div className="text-[10px] text-muted-foreground line-through">{formatCurrency(size.price)}</div>
                              )}
                              {szQty > 0 && (
                                <div className={cn(
                                  "absolute -top-2 -left-2 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold",
                                  isModified ? "bg-amber-500" : "bg-primary"
                                )}>
                                  {szQty}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Qty + Clear + Add to Cart — same for all products */}
                  {showQtySection && (() => {
                    const key = sizeId || "no_size";
                    const isPending = modifiedSizes.has(key) && displayQty !== cartQty;
                    return (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Quantity</h4>
                      <div className="flex items-center gap-2">
                        <QuantitySelector
                          value={displayQty}
                          onChange={(qty) => handlePendingQtyChange(sizeId, qty)}
                          min={0}
                          size="sm"
                          pending={isPending}
                        />
                        {(displayQty > 0 || cartQty > 0) && (
                          <CustomButton
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 shrink-0 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                            disabled={clearingSize === clearKey}
                            onClick={() => handleClearSize(sizeId)}
                          >
                            {clearingSize === clearKey
                              ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                              : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                            Clear
                          </CustomButton>
                        )}
                        <div className="flex-1" />
                        {/* "In Cart" status — always visible when anything is in cart, no icon */}
                        {totalCartQtyAllSizes > 0 && (
                          <div className="h-8 shrink-0 flex items-center px-3 text-sm font-medium rounded-md border border-border text-muted-foreground">
                            {`In Cart · ${formatCurrency(totalCartValueAllSizes)}`}
                          </div>
                        )}
                        {/* Action button — shown when there are pending changes OR nothing in cart */}
                        {(modifiedSizes.size > 0 || totalCartQtyAllSizes === 0) && (
                          <CustomButton
                            size="sm"
                            className="h-8 shrink-0 gap-1.5"
                            variant={modifiedSizes.size > 0 ? "default" : "secondary"}
                            disabled={isSaving || modifiedSizes.size === 0 || product.status === "OUT_OF_STOCK"}
                            onClick={handleSave}
                          >
                            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {modifiedSizes.size > 0 && totalCartQtyAllSizes > 0 ? "Update Cart" : "Add to Cart"}
                          </CustomButton>
                        )}
                      </div>

                      {/* Total — sum of ALL sizes × their pending/cart quantities */}
                      <div className="flex justify-between items-center py-3 border-t">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <div className="flex items-center gap-2">
                          {hasAnyPromotion && (
                            <span className="text-sm text-red-500 line-through">
                              {formatCurrency(totalOrigValueAllSizes)}
                            </span>
                          )}
                          <span className="text-xl font-bold text-primary">
                            {formatCurrency(totalDisplayValueAllSizes)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                  })()}

                </div>
              );
            })()}

            {/* Wishlist + Share */}
            <div className="grid grid-cols-2 gap-3">
              <CustomButton
                size="lg"
                variant="outline"
                className={cn(
                  "h-11 rounded-xl gap-2 transition-all font-medium",
                  isFavorited ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400" : ""
                )}
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
              >
                {isTogglingFavorite
                  ? <Loader2 className="h-5 w-5 animate-spin" />
                  : <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />}
                {isFavorited ? "Saved" : "Wishlist"}
              </CustomButton>
              <CustomButton size="lg" variant="outline" className="h-11 rounded-xl gap-2 font-medium" onClick={handleShare}>
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
              <div className="ml-auto text-xs font-mono text-muted-foreground/70">
                SKU: {product.id.slice(0, 8).toUpperCase()}
              </div>
            </div>

          </div>
        </div>

        {/* ── You May Also Like ── */}
        {similarProducts.length > 0 && (
          <div>
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

      {/* ── Image Lightbox ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-between"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="w-full flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-white/70 text-sm font-medium">{lightboxIndex + 1} / {allImages.length}</span>
            <button onClick={() => setLightboxOpen(false)} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex-1 w-full flex items-center justify-center px-14" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`lightbox-${lightboxIndex}`}
              src={allImages[lightboxIndex]?.imageUrl || appImages.NoImage}
              alt={product.name}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg select-none"
            />
            {allImages.length > 1 && (
              <>
                <button onClick={prevLightbox} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-colors">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={nextLightbox} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-colors">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <div className="w-full flex justify-center gap-2 px-4 py-3 overflow-x-auto shrink-0" onClick={(e) => e.stopPropagation()}>
            {allImages.map((img, i) => (
              <button
                key={`lb-thumb-${i}`}
                onClick={() => setLightboxIndex(i)}
                className={cn(
                  "relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all",
                  i === lightboxIndex ? "ring-2 ring-white scale-110" : "opacity-40 hover:opacity-80"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sanitizeImageUrl(img.imageUrl, appImages.NoImage)} alt={`${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <PageContainer className="py-6">
      <Skeleton className="h-9 w-20 mb-5 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[9fr_11fr] gap-10">
        <div className="space-y-3">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="flex gap-2.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-xl flex-shrink-0" />
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
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-20 rounded-xl" />)}
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
          <div className="flex gap-2"><Skeleton className="h-8 w-28 rounded" /></div>
          <Skeleton className="h-px w-full" />
          <div className="flex gap-3">
            <Skeleton className="flex-1 h-11 rounded-xl" />
            <Skeleton className="flex-1 h-11 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
