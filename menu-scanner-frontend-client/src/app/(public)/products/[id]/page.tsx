"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchPublicProductById,
  fetchPublicProducts,
} from "@/features/main/store/thunks/public-product-thunks";
import { clearSelectedProduct } from "@/features/main/store/slice/public-product-slice";
import { usePublicProductState } from "@/features/main/store/state/public-product-state";
import { useCartState } from "@/features/main/store/state/cart-state";
import { useFavoriteState } from "@/features/main/store/state/favorite-state";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { addLocalCartItem } from "@/features/main/store/slice/cart-slice";
import { toggleFavorite } from "@/features/main/store/thunks/favorite-thunks";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { CustomButton } from "@/components/shared/button/custom-button";
import { PageState } from "@/components/shared/page-state";
import { ArrowLeft, Heart, Share2 } from "lucide-react";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/features/business/store/models/response/product-response";
import { ProductCustomizationDto } from "@/features/business/store/models/response/product-customization-response";

import { PageContainer } from "@/components/shared/common/page-container";
import { useScrollToTop } from "@/hooks/use-scroll-restoration";
import { cn } from "@/lib/utils";

// Modular Feature Components
import { ProductImageGallery } from "@/features/main/components/product/detail/product-image-gallery";
import { ProductDetailHeader } from "@/features/main/components/product/detail/product-detail-header";
import { ProductPurchasingCard } from "@/features/main/components/product/detail/product-purchasing-card";
import { ProductSimilarSection } from "@/features/main/components/product/detail/product-similar-section";
import { ProductStickyBar } from "@/features/main/components/product/detail/product-sticky-bar";
import { ProductDetailSkeleton } from "@/features/main/components/product/detail/product-detail-skeleton";
import { useFavoriteDebounce } from "@/hooks/use-favorite-debounce";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { dispatch, selectedProduct, loading, error } = usePublicProductState();
  const { dispatch: cartDispatch } = useCartState();
  const { dispatch: favoriteDispatch, items: favoriteItems, loaded: favLoaded } = useFavoriteState();
  const { isAuthenticated } = useAuthState();

  const productId = params.id as string;
  const product = selectedProduct;
  const isLoading = loading.detail;

  useScrollToTop();

  const [similarProducts, setSimilarProducts] = useState<ProductDetailResponseModel[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarHasMore, setSimilarHasMore] = useState(false);
  const [similarPage, setSimilarPage] = useState(1);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<ProductCustomizationDto[]>([]);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Quantity state
  const [pageQuantity, setPageQuantity] = useState(1);

  const isFavoritedFromStore =
    favLoaded && product
      ? favoriteItems.some((item) => item.id === product.id)
      : (product?.isFavorited ?? false);
  const [isFavorited, setIsFavorited] = useState(false);
  useEffect(() => {
    setIsFavorited(isFavoritedFromStore);
  }, [isFavoritedFromStore]);

  // Fetch product detail
  const fetchedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!productId || fetchedIdRef.current === productId) return;
    fetchedIdRef.current = productId;
    dispatch(clearSelectedProduct());
    dispatch(fetchPublicProductById(productId));
  }, [productId, dispatch]);

  // Reset page state on product load
  useEffect(() => {
    if (!product) return;
    const firstSize = product.hasSizes && product.sizes?.length ? product.sizes[0] : null;
    setSelectedSize(firstSize);
    setSelectedCustomizations([]);
    setPageQuantity(1);
  }, [product?.id]);

  const hasSizes = !!(product?.hasSizes && product?.sizes && product.sizes.length > 0);
  const hasCustomizations = !!(product?.customizations && product.customizations.length > 0);

  // Fetch similar products
  const similarPageSize = typeof window !== "undefined" && window.innerWidth >= 1280 ? 36 : 20;

  const fetchedSimilarRef = useRef<string | null>(null);
  useEffect(() => {
    if (!product?.id || fetchedSimilarRef.current === product.id) return;
    fetchedSimilarRef.current = product.id;
    setSimilarLoading(true);
    setSimilarProducts([]);
    setSimilarPage(1);
    dispatch(
      fetchPublicProducts({
        pageNo: 1,
        pageSize: similarPageSize,
        categoryId: product.categoryId || undefined,
        statuses: ["ACTIVE"],
      }),
    )
      .unwrap()
      .then((res) => {
        setSimilarProducts((res.content as ProductDetailResponseModel[]).filter((p) => p.id !== productId));
        setSimilarHasMore(!res.last);
      })
      .catch(() => {})
      .finally(() => setSimilarLoading(false));
  }, [product?.id, product?.categoryId, productId, dispatch, similarPageSize]);

  const handleLoadMoreSimilar = useCallback(() => {
    if (!product?.id || similarLoading || !similarHasMore) return;
    const nextPage = similarPage + 1;
    setSimilarLoading(true);
    dispatch(
      fetchPublicProducts({
        pageNo: nextPage,
        pageSize: similarPageSize,
        categoryId: product.categoryId || undefined,
        statuses: ["ACTIVE"],
      }),
    )
      .unwrap()
      .then((res) => {
        setSimilarProducts((prev) => [
          ...prev,
          ...(res.content as ProductDetailResponseModel[]).filter((p) => p.id !== productId),
        ]);
        setSimilarHasMore(!res.last);
        setSimilarPage(nextPage);
      })
      .catch(() => {})
      .finally(() => setSimilarLoading(false));
  }, [product?.id, product?.categoryId, productId, dispatch, similarLoading, similarHasMore, similarPage, similarPageSize]);

  // NOTE: price calculations are intentionally declared after early returns below
  // so product is guaranteed non-null. We declare them here only for hook ordering;
  // they safely fall back to 0 until product is available.
  const customizationExtraCost = useMemo(() => {
    return selectedCustomizations.reduce((acc, c) => acc + (c.priceAdjustment || 0), 0);
  }, [selectedCustomizations]);

  const { debouncedToggleFavorite } = useFavoriteDebounce(favoriteDispatch);

  // Handlers
  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (!product) return;

    debouncedToggleFavorite(product.id, isFavorited, (newState) => {
      setIsFavorited(newState);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast.success("Link copied to clipboard!");
    }
  };

  const handleToggleCustomization = (customization: ProductCustomizationDto) => {
    setSelectedCustomizations((prev) => {
      const exists = prev.some((c) => c.id === customization.id);
      if (exists) {
        return prev.filter((c) => c.id !== customization.id);
      }
      return [...prev, customization];
    });
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (!product || isOutOfStock) return;
    setIsAddingToCart(true);

    const formattedCustomizations: { id: string; productCustomizationId: string; name: string; priceAdjustment: number }[] =
      selectedCustomizations.map((c) => ({
        id: c.id,
        productCustomizationId: c.id,
        name: c.name,
        priceAdjustment: c.priceAdjustment || 0,
      }));

    cartDispatch(
      addLocalCartItem({
        productId: product.id,
        productName: product.name,
        productImage: product.mainImage,
        productSizeId: selectedSize?.id ?? null,
        productSizeName: selectedSize?.name ?? null,
        price: displayPrice,
        originalPrice: originalPrice > 0 ? originalPrice : displayPrice,
        quantity: pageQuantity,
        customizations: formattedCustomizations,
      }),
    );

    showToast.success(`Added ${pageQuantity} ${product.name} to order!`);
    setIsAddingToCart(false);
  };

  // Loading & error guards
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error.detail || !product) {
    return (
      <div className="min-h-screen bg-background relative py-12">
        <PageContainer>
          <PageState
            type="not-found"
            title="Product Not Found"
            description="The product you are looking for might have been removed or is unavailable."
            actionLabel="Back to Products"
            onAction={() => router.push("/products")}
          />
        </PageContainer>
      </div>
    );
  }

  // Price calculations
  const displayPrice = selectedSize ? selectedSize.finalPrice : product.displayPrice;
  const originalPrice = selectedSize
    ? (selectedSize.hasPromotion ? selectedSize.price : selectedSize.finalPrice)
    : (product.hasPromotion ? (product.displayOriginPrice || product.displayPrice) : product.displayPrice);

  const hasDiscount = selectedSize
    ? Boolean(selectedSize.hasPromotion)
    : Boolean(product.hasPromotion && product.displayOriginPrice > product.displayPrice);

  const discountPercent = hasDiscount && originalPrice > displayPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const availableUnits = product.quantityAvailable ?? product.totalStock ?? product.quantity;
  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK" || product.stockStatus === "DISABLED";

  return (
    <div className="min-h-screen bg-background relative pb-20 sm:pb-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/5 blur-[140px] rounded-full opacity-70" />

      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-4 lg:py-5 relative z-10">
        {/* Top Header Actions Bar */}
        <div className="flex items-center justify-between mb-4">
          <CustomButton
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="w-fit gap-1.5 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/60 px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Products
          </CustomButton>

          <div className="flex items-center gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              className={cn(
                "rounded-full p-2 h-9 w-9 transition-all cursor-pointer border-border/60 shadow-2xs",
                isFavorited
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20"
                  : "bg-card text-muted-foreground hover:text-rose-500 hover:border-rose-500/40",
              )}
            >
              <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
            </CustomButton>

            <CustomButton
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-full p-2 h-9 w-9 bg-card text-muted-foreground hover:text-primary hover:border-primary/40 transition-all cursor-pointer border-border/60 shadow-2xs"
            >
              <Share2 className="h-4 w-4" />
            </CustomButton>
          </div>
        </div>

        {/* ── Main Product Detail Card ── */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-3.5 sm:p-5 lg:p-5 shadow-2xs mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[9fr_11fr] gap-4 sm:gap-5 lg:gap-6">
            {/* Left Column: Image Gallery Component */}
            <ProductImageGallery
              product={product}
              hasDiscount={hasDiscount}
              discountPercent={discountPercent}
            />

            {/* Right Column: Details & Purchasing Card */}
            <div className="flex flex-col justify-between space-y-6">
              {/* Product Info & Header Component */}
              <ProductDetailHeader
                product={product}
                displayPrice={displayPrice}
                originalPrice={originalPrice}
                hasDiscount={hasDiscount}
                discountPercent={discountPercent}
              />

              {/* Product Purchasing Card Component */}
              <ProductPurchasingCard
                product={product}
                hasSizes={hasSizes}
                hasCustomizations={hasCustomizations}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
                selectedCustomizations={selectedCustomizations}
                onToggleCustomization={handleToggleCustomization}
                pageQuantity={pageQuantity}
                onIncrementQuantity={() => setPageQuantity((q) => q + 1)}
                onDecrementQuantity={() => setPageQuantity((q) => Math.max(1, q - 1))}
                availableUnits={availableUnits}
                isOutOfStock={isOutOfStock}
                isAddingToCart={isAddingToCart}
                onAddToCart={handleAddToCart}
                displayPrice={displayPrice}
                customizationExtraCost={customizationExtraCost}
              />
            </div>
          </div>
        </div>

        {/* ── Similar Products Recommendation Section ── */}
        <ProductSimilarSection
          similarProducts={similarProducts}
          similarLoading={similarLoading}
          similarHasMore={similarHasMore}
          onLoadMore={handleLoadMoreSimilar}
          onProductClick={(id) => router.push(`/products/${id}`)}
        />
      </PageContainer>

      {/* Mobile Sticky Purchasing Bar */}
      <ProductStickyBar
        product={product}
        displayPrice={displayPrice}
        customizationExtraCost={customizationExtraCost}
        pageQuantity={pageQuantity}
        onIncrementQuantity={() => setPageQuantity((q) => q + 1)}
        onDecrementQuantity={() => setPageQuantity((q) => Math.max(1, q - 1))}
        isOutOfStock={isOutOfStock}
        isAddingToCart={isAddingToCart}
        onAddToCart={handleAddToCart}
      />

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
        />
      )}
    </div>
  );
}
