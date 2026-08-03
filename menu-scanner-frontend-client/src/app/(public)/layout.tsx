"use client";

import { Suspense, useEffect } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useCartState } from "@/features/main/store/state/cart-state";
import { useFavoriteState } from "@/features/main/store/state/favorite-state";
import { fetchCart } from "@/features/main/store/thunks/cart-thunks";
import { fetchFavoriteList } from "@/features/main/store/thunks/favorite-thunks";

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


  useEffect(() => {
    if (isAuthenticated) {
      if (!cartLoaded && !cartLoading.fetch) {
        cartDispatch(fetchCart());
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

      {/* Bottom padding accounts for the fixed BottomNav (h-11) +
          iPhone home indicator / Telegram bottom chrome. */}
      <main className="flex-1 pb-[calc(2.75rem+env(safe-area-inset-bottom))] sm:pb-0">
        <Suspense>{children}</Suspense>
      </main>

      {}
      <div className="hidden sm:block">
        <Footer />
      </div>

      {}
      <BottomNav />
    </div>
  );
}
