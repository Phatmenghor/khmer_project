"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/common/page-header";
import { SignInRequired } from "@/components/shared/auth/sign-in-required";
import { useFavoriteState } from "@/features/main/store/state/favorite-state";
import { useCartState } from "@/features/main/store/state/cart-state";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import {
  fetchFavoritePaginated,
  toggleFavorite,
  clearAllFavorites,
} from "@/features/main/store/thunks/favorite-thunks";
import { addToCart } from "@/features/main/store/thunks/cart-thunks";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { PageContainer } from "@/components/shared/common/page-container";
import { EmptyState } from "@/components/shared/empty-state/empty-state";
import { usePaginationLoadMore } from "@/hooks/use-pagination-load-more";

export default function FavoritesPage() {
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
    if (isAuthenticated && !loaded) {
      dispatch(fetchFavoritePaginated({ pageNo: 1, pageSize }));
    }
  }, [authReady, isAuthenticated, loaded, dispatch, pageSize]);


  const handleLoadMore = useCallback(() => {
    if (
      pagination.hasMore &&
      !loading.fetch &&
      items.length > 0
    ) {
      const nextPage = pagination.currentPage + 1;
      dispatch(fetchFavoritePaginated({ pageNo: nextPage, pageSize }));
    }
  }, [dispatch, pagination.hasMore, pagination.currentPage, loading.fetch, items.length, pageSize]);


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

  const handleRemoveOne = (productId: string) => {
    dispatch(toggleFavorite({ productId, isFavorited: true }))
      .unwrap()
      .then(() => {
        showToast.success(Messages.favorites.removed);
      })
      .catch((error: unknown) => {
        showToast.error((error as { message?: string })?.message || Messages.favorites.removeFailed);
      });
  };

  const handleClearAll = async () => {
    try {
      await dispatch(clearAllFavorites()).unwrap();
      showToast.success(Messages.favorites.allCleared);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.favorites.clearFailed);
    }
  };

  const handleMoveToCart = (productId: string) => {
    cartDispatch(addToCart({ productId, quantity: 1 }))
      .unwrap()
      .then(() => {
        return dispatch(toggleFavorite({ productId, isFavorited: true })).unwrap();
      })
      .then(() => {
        showToast.success(Messages.cart.movedToCart);
      })
      .catch((error: unknown) => {
        showToast.error((error as { message?: string })?.message || Messages.cart.moveToCartFailed);
      });
  };


  if (!mounted || !authReady || (loading.fetch && !loaded)) {
    return (
      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5">
        <div className="h-5 w-28 bg-muted rounded mb-3 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </PageContainer>
    );
  }


  if (!isAuthenticated) {
    return (
      <>
        <SignInRequired
          title="My Favorites"
          description="Sign in to save and view your favorite items."
          icon="❤️"
          onSignIn={() => setLoginModalOpen(true)}
          browseButtonText="Browse Products"
          onBrowse={() => router.push("/products")}
        />
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </>
    );
  }


  if (items.length === 0) {
    return (
      <PageContainer className="min-h-screen flex flex-col py-8 sm:py-14">
        <EmptyState
          icon={Heart}
          title="No Favorites Yet"
          description="Save your favorite items to find them quickly later."
          action={{
            label: "Start Shopping",
            onClick: () => router.push("/products"),
          }}
          size="lg"
        />
      </PageContainer>
    );
  }


  return (
    <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5">
      <PageHeader
        title="My Favorites"
        icon={Heart}
        count={totalItems}
        countLabel={totalItems === 1 ? "item" : "items"}
        subtitle={`${totalItems} ${totalItems === 1 ? "item" : "items"} saved`}
        actions={
          <CustomButton
            variant="ghost"
            size="sm"
            onClick={() => setClearAllModalOpen(true)}
            disabled={loading.fetch}
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
          >
            <Trash2 className="h-2.5 w-2.5" />
            Clear All
          </CustomButton>
        }
      />

      {}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {items.map((product, index) => {
          const uniqueKey = `favorites-${product.id}-${index}`;
          return <ProductCard key={uniqueKey} product={product} />;
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
            <Loader2 className="h-4 w-4 animate-spin text-primary mb-1.5" />
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
          <h3 className="text-xs sm:text-xs font-semibold mb-1.5 text-center">
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
  );
}
