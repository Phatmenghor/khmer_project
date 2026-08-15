"use client";

import { Messages } from "@/constants/messages";
import { useEffect, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/common/page-header";
import { useFavoriteState } from "@/features/main/store/state/favorite-state";
import { useCartState } from "@/features/main/store/state/cart-state";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import {
  fetchFavoritePaginated,
  toggleFavorite,
  clearAllFavorites,
} from "@/features/main/store/thunks/favorite-thunks";
import {
  clearLocalFavorites,
  loadFavoritesFromStorage,
  removeLocalFavorite,
} from "@/features/main/store/slice/favorite-slice";
import { addLocalCartItem } from "@/features/main/store/slice/cart-slice";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { GridPageSkeleton } from "@/components/shared/skeletons/grid-page-skeleton";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageState } from "@/components/shared/page-state";
import { usePaginationLoadMore } from "@/hooks/use-pagination-load-more";

function FavoritesPageInner() {
  const router = useRouter();
  const { isAuthenticated, authReady } = useAuthState();
  const { dispatch, items, totalItems, pagination, loading, loaded } = useFavoriteState();
  const { dispatch: cartDispatch } = useCartState();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [skeletonCount, setSkeletonCount] = useState(6);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateSkeletonCount = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) setSkeletonCount(2);
    else if (width < 768) setSkeletonCount(3);
    else if (width < 1024) setSkeletonCount(4);
    else if (width < 1280) setSkeletonCount(5);
    else setSkeletonCount(6);
  }, []);

  useEffect(() => {
    calculateSkeletonCount();
    window.addEventListener("resize", calculateSkeletonCount);
    return () => window.removeEventListener("resize", calculateSkeletonCount);
  }, [calculateSkeletonCount]);

  const pageSize = 15;

  const isInitialFavoritesLoading =
    loading.fetch &&
    items.length === 0 &&
    !loaded;

  useEffect(() => {
    if (!authReady) return;
    if (isAuthenticated) {
      if (!loaded) {
        dispatch(fetchFavoritePaginated({ pageNo: 1, pageSize }));
      }
    } else {
      if (!loaded) {
        dispatch(loadFavoritesFromStorage());
      }
    }
  }, [authReady, isAuthenticated, loaded, dispatch, pageSize]);

  const handleLoadMore = useCallback(() => {
    if (
      isAuthenticated &&
      pagination.hasMore &&
      !loading.fetch &&
      items.length > 0
    ) {
      const nextPage = pagination.currentPage + 1;
      dispatch(fetchFavoritePaginated({ pageNo: nextPage, pageSize }));
    }
  }, [isAuthenticated, dispatch, pagination.hasMore, pagination.currentPage, loading.fetch, items.length, pageSize]);

  const { handleLoadMore: debouncedLoadMore } = usePaginationLoadMore(
    handleLoadMore,
    pagination.hasMore && !loading.fetch,
    [pagination.hasMore, loading.fetch, handleLoadMore]
  );

  useEffect(() => {
    if (!pagination.hasMore || !sentinelRef.current) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          debouncedLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observerRef.current = observer;
    observer.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [pagination.hasMore, debouncedLoadMore]);

  const handleClearAll = async () => {
    if (!isAuthenticated) {
      dispatch(clearLocalFavorites());
      showToast.success(Messages.favorites.allCleared);
      setClearAllModalOpen(false);
      return;
    }
    try {
      await dispatch(clearAllFavorites()).unwrap();
      showToast.success(Messages.favorites.allCleared);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.favorites.clearFailed);
    } finally {
      setClearAllModalOpen(false);
    }
  };

  const handleMoveToCart = async (item: ProductDetailResponseModel) => {
    cartDispatch(
      addLocalCartItem({
        productId: item.id,
        productSizeId: null,
        quantity: 1,
        productName: item.name,
        productImageUrl: item.mainImage?.sm || item.mainImage?.md || item.mainImage?.o || appImages.noImage,
        sizeName: null,
        finalPrice: item.displayPrice ?? item.price ?? 0,
        currentPrice: item.displayOriginPrice ?? item.price ?? 0,
        hasPromotion: item.hasPromotion,
        promotionType: item.displayPromotionType || null,
        promotionValue: item.displayPromotionValue || null,
      })
    );
    if (!isAuthenticated) {
      dispatch(removeLocalFavorite(item.id));
    } else {
      await dispatch(toggleFavorite({ productId: item.id, isFavorited: true })).unwrap().catch(() => {});
    }
    showToast.success(Messages.cart.movedToCart);
  };

  const [movingAllToCart, setMovingAllToCart] = useState(false);

  const handleMoveAllToCart = async () => {
    if (items.length === 0 || movingAllToCart) return;
    setMovingAllToCart(true);

    try {
      for (const item of items) {
        cartDispatch(
          addLocalCartItem({
            productId: item.id,
            productSizeId: null,
            quantity: 1,
            productName: item.name,
            productImageUrl: item.mainImage?.sm || item.mainImage?.md || item.mainImage?.o || appImages.noImage,
            sizeName: null,
            finalPrice: item.displayPrice ?? item.price ?? 0,
            currentPrice: item.displayOriginPrice ?? item.price ?? 0,
            hasPromotion: item.hasPromotion,
            promotionType: item.displayPromotionType || null,
            promotionValue: item.displayPromotionValue || null,
          })
        );
      }
      showToast.success(`Added ${items.length} ${items.length === 1 ? "item" : "items"} to your cart`);
    } catch {
      showToast.error("Failed to add all items to cart");
    } finally {
      setMovingAllToCart(false);
    }
  };

  if (!mounted || !authReady || (loading.fetch && !loaded)) {
    return <GridPageSkeleton card={<ProductCardSkeleton />} count={skeletonCount} />;
  }

  if (items.length === 0) {
    return (
      <PageContainer className="min-h-screen flex flex-col py-8 sm:py-14">
        <PageState
          type="empty"
          title="Your Favorites List is Empty"
          description="Save your favorite items by tapping the heart icon on any product card for quick access anytime!"
          actionLabel="Explore Products"
          onAction={() => router.push("/products")}
          secondaryActionLabel={!isAuthenticated ? "Sign In to Sync" : undefined}
          onSecondaryAction={!isAuthenticated ? () => setLoginModalOpen(true) : undefined}
          size="lg"
        />
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background glow — matching Brand and Category pages */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-primary/5 blur-[120px] rounded-full opacity-60" />

      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5 relative z-10">
        <PageHeader
          title="My Favorites"
          subtitle="Your saved items for quick access anytime!"
          icon={Heart}
          count={totalItems}
          countLabel="items"
          actions={
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={() => setClearAllModalOpen(true)}
              disabled={loading.fetch}
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs rounded-xl px-3 py-1.5 font-semibold cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </CustomButton>
          }
        />

        {/* Grid of Favorited Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {items.map((product, index) => {
            const uniqueKey = `favorites-${product.id}-${index}`;
            return (
              <div
                key={uniqueKey}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
              >
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>

      {}
      {pagination.hasMore && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 mt-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <ProductCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>

          {}
          <div className="flex flex-col items-center justify-center mt-4 py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary mb-1" />
            <p className="text-xs sm:text-xs text-muted-foreground">
              Loading more favorites...
            </p>
          </div>
        </>
      )}

      {}
      {pagination.hasMore && !loading.fetch && (
        <div ref={sentinelRef} className="h-7 w-full mt-4" />
      )}

      {}
      {!pagination.hasMore && items.length > 0 && (
        <div className="flex flex-col items-center justify-center mt-7 py-5 px-3">
          <div className="flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-primary/10 mb-3">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h3 className="text-xs sm:text-xs font-semibold mb-1 text-center">
            You've seen all your favorites!
          </h3>
          <p className="text-xs sm:text-xs text-muted-foreground text-center max-w-md">
            You've reached the end of your saved items. Keep shopping to add more favorites!
          </p>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={clearAllModalOpen}
        onClose={() => setClearAllModalOpen(false)}
        onDelete={handleClearAll}
        title="Clear All Favorites"
        description="Are you sure you want to remove all items from your favorites? This action cannot be undone."
        variant="critical"
      />
    </PageContainer>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense>
      <FavoritesPageInner />
    </Suspense>
  );
}
