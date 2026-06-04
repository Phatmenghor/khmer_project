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
import { EmptyState } from "@/components/shared/empty-state/empty-state";
import { SignInRequired } from "@/components/shared/auth/sign-in-required";

function CartItemSkeleton() {
  return (
    <div className="bg-card border rounded p-2 sm:p-3">
      <div className="flex gap-2">
        <Skeleton className="w-[72px] h-[72px] rounded flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <PageContainer className="py-3 sm:py-5 pb-28 sm:pb-5">
      <div className="mb-4 space-y-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-44" />
      </div>
      <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-44 w-full rounded" />
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

  if (!mounted || !authReady) return <CartPageSkeleton />;
  if (loading.fetch && !loaded) return <CartPageSkeleton />;

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
        <EmptyState
          icon={ShoppingCart}
          title="Your Cart is Empty"
          description="Add some items to get started!"
          action={{
            label: "Browse Products",
            onClick: () => router.push("/products"),
          }}
          size="lg"
        />
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5 pb-28 sm:pb-11 lg:pb-5">

        <PageHeader
          title="Shopping Cart"
          icon={ShoppingCart}
          count={totalItems}
          subtitle={`${totalItems} ${totalItems === 1 ? "item" : "items"} • ${totalQuantity} total quantity`}
          actions={
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={() => setClearCartModalOpen(true)}
              disabled={loading.clear}
              className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs rounded"
            >
              <Trash2 className="h-2.5 w-2.5" />
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
              <div className="flex flex-col items-center justify-center py-11 text-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-xs font-medium text-foreground mb-1">No items found</p>
                <p className="text-xs text-muted-foreground">
                  No cart items match &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : !isSearching ? (
              displayItems.map((item, index) => {
                const uniqueKey = `cart-${item.id}-${index}`;
                return (
                  <CartItemCard
                    key={uniqueKey}
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
                );
              })
            ) : null}

          </div>

          {}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-card border rounded p-3 sticky top-16">
              <h2 className="text-xs font-bold mb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-normal text-muted-foreground bg-muted px-1 py-1 rounded">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </h2>

              <div className="space-y-2 mb-3">
                {}
                <div className="bg-muted/50 rounded p-2 mb-3">
                  <div className="text-xs text-muted-foreground mb-1">Items Breakdown</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">{totalItems} unique {totalItems === 1 ? 'product' : 'products'}</span>
                    <span className="text-xs font-bold text-foreground">{totalQuantity} qty</span>
                  </div>
                </div>

                {}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {}
                <div className="flex justify-between text-xs pt-1 border-t">
                  <span className="text-muted-foreground">Shipping & Fees</span>
                  <span className="text-muted-foreground text-xs">Calculated at checkout</span>
                </div>

                {}
                <div className="bg-primary/10 rounded p-2 border border-primary/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-foreground">Total Amount</span>
                    <span className="text-base font-bold text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>
              </div>

              <CustomButton className="w-full mb-1 gap-1 h-8 rounded" onClick={handleCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CreditCard className="h-3 w-3" />}
                {checkoutLoading ? "Loading..." : "Proceed to Checkout"}
              </CustomButton>
            </div>
          </div>
        </div>
      </PageContainer>

      {}
      <div className="fixed bottom-11 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs">
            <div className="text-muted-foreground font-medium">{totalItems} items • {totalQuantity} qty</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-xs font-bold text-primary">{formatCurrency(finalTotal)}</div>
          </div>
        </div>
        <CustomButton className="w-full gap-1 h-8 rounded" onClick={handleCheckout} disabled={checkoutLoading}>
          {checkoutLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CreditCard className="h-3 w-3" />}
          {checkoutLoading ? "Loading..." : "Proceed to Checkout"}
          {!checkoutLoading && <ArrowRight className="h-3 w-3 ml-auto" />}
        </CustomButton>
      </div>

      <DeleteConfirmationModal
        isOpen={clearCartModalOpen}
        onClose={() => setClearCartModalOpen(false)}
        onDelete={handleClearCart}
        title="Clear Cart"
        description={`Remove all ${totalItems} ${totalItems === 1 ? "item" : "items"} from your cart? This cannot be undone.`}
        icon={<PackageX className="h-3 w-3 text-destructive" />}
        confirmButtonText="Clear Cart"
        variant="critical"
      />
    </>
  );
}

export default function CartPageWrapper() {
  return (
    <Suspense fallback={<CartPageSkeleton />}>
      <CartPage />
    </Suspense>
  );
}
