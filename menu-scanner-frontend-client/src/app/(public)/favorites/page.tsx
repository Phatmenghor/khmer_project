"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Trash2, LogIn } from "lucide-react";
import { PageHeader } from "@/components/shared/common/page-header";
import { useFavoriteState } from "@/redux/features/main/store/state/favorite-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import {
  fetchFavoriteList,
  toggleFavorite,
  clearAllFavorites,
} from "@/redux/features/main/store/thunks/favorite-thunks";
import { addToCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { PageContainer } from "@/components/shared/common/page-container";

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, authReady } = useAuthState();
  const { dispatch, items, totalItems, loading, loaded } = useFavoriteState();
  const { dispatch: cartDispatch } = useCartState();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!authReady) return;
    if (isAuthenticated && !loaded) {
      dispatch(fetchFavoriteList());
    }
  }, [authReady, isAuthenticated, loaded, dispatch]);

  const handleRemoveOne = async (productId: string) => {
    try {
      await dispatch(toggleFavorite({ productId, isFavorited: true })).unwrap();
      showToast.success("Removed from favorites");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to remove from favorites");
    }
  };

  const handleClearAll = async () => {
    await dispatch(clearAllFavorites()).unwrap();
    showToast.success("All favorites cleared");
  };

  const handleMoveToCart = async (productId: string) => {
    try {
      await cartDispatch(addToCart({ productId, quantity: 1 })).unwrap();
      await dispatch(toggleFavorite({ productId, isFavorited: true })).unwrap();
      showToast.success("Moved to cart");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to move to cart");
    }
  };

  // Loading skeleton (also shown on server to prevent hydration mismatch)
  if (!mounted || !authReady || (loading.fetch && !loaded)) {
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

      {/* Favorites Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

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
