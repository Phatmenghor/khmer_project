"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Trash2,
  ShoppingBag,
  CreditCard,
  LogIn,
  Loader2,
  ShoppingCart,
  ArrowRight,
  PackageX,
} from "lucide-react";
import { useCartState } from "@/features/main/store/state/cart-state";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/common/currency-format";
import { showToast } from "@/components/shared/common/show-toast";
import { clearCart, fetchCart, searchCartItems } from "@/features/main/store/thunks/cart-thunks";
import { updateLocalCartItem } from "@/features/main/store/slice/cart-slice";
import { useCartDebounce, cartItemKey } from "@/hooks/use-cart-debounce";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { CartItemCard } from "@/components/shared/cart-item-card/cart-item-card";
import { PageState } from "@/components/shared/page-state";
import { SignInRequired } from "@/components/shared/auth/sign-in-required";

function CartItemSkeleton() {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs">
      <div className="flex gap-3 items-center">
        <Skeleton className="w-[76px] h-[76px] rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <PageContainer className="py-3 sm:py-5 pb-28 sm:pb-5">
      <div className="mb-4 space-y-2">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <Skeleton className="h-3.5 w-56 rounded-md" />
      </div>
      <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-56 w-full rounded-2xl border border-border/80" />
        </div>
      </div>
    </PageContainer>
  );
}

function CartPage() {
  const router = useRouter();
  const { isAuthenticated, authReady } = useAuthState();
  const {
    dispatch,
    items,
    totalItems,
    totalQuantity,
    subtotal,
    discountAmount,
    finalTotal,
    loading,
    loaded,
  } = useCartState();

  const { debouncedUpdate, immediateUpdate } = useCartDebounce(dispatch);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [clearCartModalOpen, setClearCartModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() ?? "";

  const [searchResults, setSearchResults] = useState<typeof items | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);

  // Direct API call for search — does NOT update Redux so full cart stays intact
  useEffect(() => {
    if (!isAuthenticated) return;

    if (searchAbortRef.current) searchAbortRef.current.abort();

    if (!searchQuery) {
      setSearchResults(null);
      return;
    }

    setSearchLoading(true);
    const controller = new AbortController();
    searchAbortRef.current = controller;

    searchCartItems(searchQuery, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setSearchResults(items);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setSearchLoading(false);
      });

    return () => controller.abort();
  }, [searchQuery, isAuthenticated]);

  const displayItems = searchQuery ? (searchResults ?? []) : items;
  const isSearching = searchQuery ? searchLoading : false;

  useEffect(() => setMounted(true), []);


  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) return;
    if (!loaded && !loading.fetch) {
      dispatch(fetchCart());
    }
  }, [authReady, isAuthenticated, loaded, loading.fetch, dispatch]);

  const handleUpdateQuantity = useCallback(
    (productId: string, productSizeId: string | null, newQuantity: number) => {
      const key = cartItemKey(productId, productSizeId);
      const timestamp = Date.now();
      dispatch(updateLocalCartItem({ productId, productSizeId, quantity: newQuantity, optimisticTimestamp: timestamp }));
      debouncedUpdate(key, productId, productSizeId, newQuantity, timestamp);
    },
    [dispatch, debouncedUpdate],
  );

  const handleRemoveItem = useCallback(
    (productId: string, productSizeId: string | null) => {
      const key = cartItemKey(productId, productSizeId);
      const timestamp = Date.now();
      dispatch(updateLocalCartItem({ productId, productSizeId, quantity: 0, optimisticTimestamp: timestamp }));
      immediateUpdate(key, productId, productSizeId, 0, timestamp);
    },
    [dispatch, immediateUpdate],
  );

  const handleClearCart = async () => {
    await dispatch(clearCart()).unwrap();
    showToast.success(Messages.cart.cleared);
    setClearCartModalOpen(false);
  };

  const handleCheckout = () => {
    setCheckoutLoading(true);
    router.push("/checkout");
  };

  if (!mounted || !authReady || (loading.fetch && !loaded)) return <CartPageSkeleton />;

  if (!isAuthenticated) {
    return (
      <>
        <SignInRequired
          title="Your Cart"
          description="Please sign in to view your cart and start shopping."
          icon="🛒"
          onSignIn={() => setLoginModalOpen(true)}
          browseButtonText="Browse Products"
          onBrowse={() => router.push("/products")}
        />
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </>
    );
  }

  if (items.length === 0 && loaded) {
    return (
      <PageContainer className="min-h-screen flex flex-col py-8 sm:py-14">
        <PageState
          type="empty"
          title="Your Shopping Cart is Empty"
          description="Explore our menu and add your favorite items to get started!"
          actionLabel="Start Shopping"
          onAction={() => router.push("/products")}
          size="lg"
        />
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background glow — matching Brand, Category, and Favorites pages */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-primary/5 blur-[120px] rounded-full opacity-60" />

      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5 pb-28 sm:pb-11 lg:pb-5 relative z-10">
        <PageHeader
          title="Shopping Cart"
          subtitle={`Review your items before proceeding to checkout (${totalQuantity} total quantity)`}
          icon={ShoppingCart}
          count={totalItems}
          countLabel="items"
          actions={
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={() => setClearCartModalOpen(true)}
              disabled={loading.clear}
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs rounded-xl px-3 py-1.5 font-semibold cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </CustomButton>
          }
        />

        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 space-y-2">
            {searchQuery && !isSearching && (
              <div className="text-xs text-muted-foreground">
                {displayItems.length === 0
                  ? `No results for "${searchQuery}"`
                  : `${displayItems.length} of ${items.length} ${items.length === 1 ? "item" : "items"} match "${searchQuery}"`}
              </div>
            )}
            {isSearching && (
              <div className="space-y-2">
                {[1, 2].map((i) => <CartItemSkeleton key={i} />)}
              </div>
            )}

            {!isSearching && displayItems.length === 0 && searchQuery ? (
              <PageState
                type="no-results"
                title="No items found"
                description={`No cart items match "${searchQuery}"`}
                size="sm"
              />
            ) : !isSearching ? (
              displayItems.map((item, index) => {
                const uniqueKey = `cart-${item.id}-${index}`;
                return (
                  <div
                    key={uniqueKey}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
                  >
                    <CartItemCard
                      id={item.id}
                      productId={item.productId}
                      productName={item.productName}
                      productImageUrl={item.productImageUrl}
                      productSizeId={item.productSizeId}
                      sizeName={item.sizeName}
                      customizations={item.customizations}
                      currentPrice={item.currentPrice}
                      finalPrice={item.finalPrice}
                      quantity={item.quantity}
                      totalPrice={item.totalPrice}
                      hasPromotion={item.hasPromotion}
                      promotionType={item.promotionType}
                      promotionValue={item.promotionValue}
                      onQuantityChange={(newQuantity) =>
                        handleUpdateQuantity(item.productId, item.productSizeId, newQuantity)
                      }
                      onRemove={() => handleRemoveItem(item.productId, item.productSizeId)}
                      showLink={true}
                      showControls={true}
                    />
                  </div>
                );
              })
            ) : null}
          </div>

          {/* Desktop Summary Card */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-gradient-to-b from-card via-card to-muted/20 border border-border/60 rounded-2xl p-4 sticky top-16 shadow-sm space-y-3">
              <h2 className="text-xs font-bold flex items-center justify-between pb-2 border-b border-border/40">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                  Order Summary
                </span>
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="bg-muted/40 rounded-xl p-2.5 border border-border/40 space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground">Items Breakdown</div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{totalItems} unique {totalItems === 1 ? "product" : "products"}</span>
                    <span className="font-bold text-primary">{totalQuantity} qty</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-foreground">{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <span className="text-muted-foreground">Shipping & Fees</span>
                  <span className="text-[11px] text-muted-foreground font-medium">Calculated at checkout</span>
                </div>

                <div className="bg-primary/10 rounded-xl p-3 border border-primary/25 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">Total Amount</span>
                    <span className="text-base font-extrabold text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>
              </div>

              <CustomButton
                variant="default"
                size="default"
                className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 shadow-xs hover:shadow-md transition-all cursor-pointer"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
                {checkoutLoading ? "Preparing Checkout..." : "Proceed to Checkout"}
                {!checkoutLoading && <ArrowRight className="h-3.5 w-3.5 ml-auto" />}
              </CustomButton>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Mobile Floating Bottom Bar */}
      <div className="fixed bottom-12 left-2 right-2 z-40 lg:hidden bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-3 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[11px] text-muted-foreground font-semibold">
              {totalItems} {totalItems === 1 ? "item" : "items"} • {totalQuantity} qty
            </div>
            <div className="text-base font-extrabold text-primary">{formatCurrency(finalTotal)}</div>
          </div>

          <CustomButton
            variant="default"
            size="default"
            className="gap-1.5 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 shadow-md cursor-pointer"
            onClick={handleCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
            {checkoutLoading ? "Loading..." : "Checkout"}
            {!checkoutLoading && <ArrowRight className="h-3.5 w-3.5 ml-1" />}
          </CustomButton>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={clearCartModalOpen}
        onClose={() => setClearCartModalOpen(false)}
        onDelete={handleClearCart}
        title="Clear Cart"
        description={`Remove all ${totalItems} ${totalItems === 1 ? "item" : "items"} from your cart? This cannot be undone.`}
        icon={PackageX}
        confirmButtonText="Clear Cart"
        variant="critical"
      />
    </div>
  );
}

export default function CartPageWrapper() {
  return (
    <Suspense fallback={<CartPageSkeleton />}>
      <CartPage />
    </Suspense>
  );
}
