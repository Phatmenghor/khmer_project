"use client";

import { Suspense, useEffect } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useFavoriteState } from "@/redux/features/main/store/state/favorite-state";
import { fetchCartPaginated } from "@/redux/features/main/store/thunks/cart-thunks";
import { fetchFavoriteList } from "@/redux/features/main/store/thunks/favorite-thunks";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthState();
  const {
    dispatch: cartDispatch,
    loaded: cartLoaded,
    loading: cartLoading,
  } = useCartState();
  const {
    dispatch: favoriteDispatch,
    loaded: favoriteLoaded,
    loading: favoriteLoading,
  } = useFavoriteState();

  // Load cart and favorites when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (!cartLoaded && !cartLoading.fetch) {
        cartDispatch(fetchCartPaginated({ pageNo: 1, pageSize: 20 }));
      }
      if (!favoriteLoaded && !favoriteLoading.fetch) {
        favoriteDispatch(fetchFavoriteList());
      }
    }
  }, [
    isAuthenticated,
    cartLoaded,
    cartLoading.fetch,
    favoriteLoaded,
    favoriteLoading.fetch,
    cartDispatch,
    favoriteDispatch,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Extra bottom padding on mobile so content clears the fixed bottom nav */}
      <main className="flex-1 pb-16 sm:pb-0">
        <Suspense>{children}</Suspense>
      </main>

      {/* Footer — hidden on mobile (replaced by bottom nav) */}
      <div className="hidden sm:block">
        <Footer />
      </div>

      {/* Native-style bottom tab bar — mobile only */}
      <BottomNav />
    </div>
  );
}
