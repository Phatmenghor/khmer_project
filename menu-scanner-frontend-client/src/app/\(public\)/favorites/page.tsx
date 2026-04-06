"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Trash2, LogIn } from "lucide-react";
import { PageHeader } from "@/components/shared/common/page-header";
import { useFavoriteState } from "@/redux/features/main/store/state/favorite-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import {
  fetchFavoritePaginated,
  toggleFavorite,
  clearAllFavorites,
} from "@/redux/features/main/store/thunks/favorite-thunks";
import { addToCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { PaginatedProductsGrid } from "@/components/shared/grid/paginated-products-grid";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { PageContainer } from "@/components/shared/common/page-container";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, authReady } = useAuthState();
  const { dispatch, items, totalItems, pagination, loading, loaded } = useFavoriteState();
  const { dispatch: cartDispatch } = useCartState();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);

  // Calculate responsive page size
  const getPageSize = useMemo(() => {
    return () => {
      if (typeof window === "undefined") return 20;
      const width = window.innerWidth;
      if (width >= 1280) return 36;
      if (width >= 768) return 20;
      return 15;
    };
  }, []);

  const isInitialFavoritesLoading =
    loading.fetch &&
    items.length === 0 &&
    !loaded;

  // Initial load
  useEffect(() => {
    if (!authReady) return;
    if (isAuthenticated && !loaded) {
      const pageSize = getPageSize();
      dispatch(fetchFavoritePaginated({ pageNo: 1, pageSize }));
    }
  }, [authReady, isAuthenticated, loaded, dispatch, getPageSize]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (
      pagination.hasMore &&
      !loading.fetch &&
      items.length > 0
    ) {
      const nextPage = pagination.currentPage + 1;
      const pageSize = getPageSize();
      dispatch(fetchFavoritePaginated({ pageNo: nextPage, pageSize }));
    }
  }, [dispatch, pagination, loading.fetch, items.length, getPageSize]);

  const handleRemoveOne = (productId: string) => {
    dispatch(toggleFavorite({ productId, isFavorited: true }))
      .unwrap()
      .then(() => {
        showToast.success("Removed from favorites");
      })
      .catch((error: any) => {
        showToast.error(error?.message || "Failed to remove from favorites");
      });
  };

  const handleClearAll = () => {
    dispatch(clearAllFavorites())
      .unwrap()
      .then(() => {
        showToast.success("All favorites cleared");
      })
      .catch((error: any) => {
        showToast.error(error?.message || "Failed to clear favorites");
      });
  };

  const handleMoveToCart = (productId: string) => {
    cartDispatch(addToCart({ productId, quantity: 1 }))
      .unwrap()
      .then(() => {
        return dispatch(toggleFavorite({ productId, isFavorited: true })).unwrap();
      })
      .then(() => {
        showToast.success("Moved to cart");
      })
      .catch((error: any) => {
        showToast.error(error?.message || "Failed to move to cart");
      });
  };

  // Loading skeleton
  if (!authReady || (loading.fetch && !loaded)) {
    return (
      <PageContainer className="py-4 sm:py-8">
        <div className="h-7 w-40 bg-muted rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </PageContainer>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <>
        <PageContainer className="py-12 sm:py-20">
          <div className="max-w-sm mx-auto text-center">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 mx-auto mb-4">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">My Favorites</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in to save and view your favorite items.
            </p>
            <div className="flex flex-col gap-3">
              <CustomButton
                onClick={() => setLoginModalOpen(true)}
                className="w-full gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </CustomButton>
              <CustomButton
                variant="outline"
                onClick={() => router.push("/products")}
                className="w-full gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Browse Products
              </CustomButton>
            </div>
          </div>
        </PageContainer>
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <PageContainer className="py-12 sm:py-20">
        <div className="max-w-sm mx-auto text-center">
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 mx-auto mb-4">
            <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">No Favorites Yet</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Save your favorite items to find them quickly later.
          </p>
          <CustomButton
            onClick={() => router.push("/products")}
            className="w-full gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Start Shopping
          </CustomButton>
        </div>
      </PageContainer>
    );
  }

  // Favorites with infinite scroll
  return (
    <PageContainer className="py-4 sm:py-8">
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
            disabled={loading.clearAll}
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </CustomButton>
        }
      />

      {/* Use paginated grid for infinite scroll */}
      <PaginatedProductsGrid
        products={items}
        loading={loading.fetch && items.length > 0}
        hasMore={pagination.hasMore}
        onLoadMore={handleLoadMore}
        isInitialLoading={isInitialFavoritesLoading}
        sectionKey="favorites"
      />

      {/* End of favorites message */}
      {!pagination.hasMore && items.length > 0 && !loading.fetch && (
        <div className="flex flex-col items-center justify-center mt-10 py-8 px-4">
          <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">
            You've seen all your favorites!
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md">
            You've reached the end of your saved items. Keep shopping to add more favorites!
          </p>
        </div>
      )}

      {/* Bottom action */}
      <div className="mt-8 sm:mt-12 flex justify-center">
        <CustomButton
          variant="outline"
          onClick={() => router.push("/products")}
          className="gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Continue Shopping
        </CustomButton>
      </div>

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
