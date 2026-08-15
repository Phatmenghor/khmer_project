"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2, ShoppingCart } from "lucide-react";
import { useCartState } from "@/features/main/store/state/cart-state";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { clearCart, fetchCart, searchCartItems } from "@/features/main/store/thunks/cart-thunks";
import { updateLocalCartItem, resetCart, loadCartFromStorage } from "@/features/main/store/slice/cart-slice";
import { useCartDebounce, cartItemKey } from "@/hooks/use-cart-debounce";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { CartItemCard } from "@/components/shared/cart-item-card/cart-item-card";
import { PageState } from "@/components/shared/page-state";
import { CartSkeleton } from "@/components/cart/cart-skeleton";
import { CartSummary } from "@/components/cart/cart-summary";
import { getOrderContext } from "@/utils/order/order-context";
import { getActiveTableSession, appendTableParamToUrl } from "@/utils/table/table-session";

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
  const [clearCartModalOpen, setClearCartModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeTable, setActiveTable] = useState<any>(null);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() ?? "";

  const [searchResults, setSearchResults] = useState<typeof items | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setActiveTable(getActiveTableSession());
    }
  }, []);

  const orderContext = getOrderContext(isAuthenticated, activeTable);

  // Search logic
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }

    if (searchAbortRef.current) searchAbortRef.current.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setSearchLoading(true);

    if (isAuthenticated) {
      searchCartItems(searchQuery, controller.signal)
        .then((data: any) => setSearchResults(data))
        .catch((err: any) => {
          if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
            setSearchResults([]);
          }
        })
        .finally(() => setSearchLoading(false));
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = items.filter(
        (it) =>
          it.productName.toLowerCase().includes(q) ||
          (it.sizeName && it.sizeName.toLowerCase().includes(q))
      );
      setSearchResults(filtered);
      setSearchLoading(false);
    }

    return () => controller.abort();
  }, [searchQuery, isAuthenticated, items]);

  const displayItems = searchResults !== null ? searchResults : items;
  const isSearching = !!searchQuery && searchLoading;

  const handleUpdateQuantity = useCallback(
    (productId: string, productSizeId: string | null, newQuantity: number) => {
      const key = cartItemKey(productId, productSizeId);
      const timestamp = Date.now();
      dispatch(updateLocalCartItem({ productId, productSizeId, quantity: newQuantity, optimisticTimestamp: timestamp }));
      if (isAuthenticated) {
        debouncedUpdate(key, productId, productSizeId, newQuantity, timestamp);
      }
    },
    [dispatch, debouncedUpdate, isAuthenticated],
  );

  const handleRemoveItem = useCallback(
    (productId: string, productSizeId: string | null) => {
      const key = cartItemKey(productId, productSizeId);
      const timestamp = Date.now();
      dispatch(updateLocalCartItem({ productId, productSizeId, quantity: 0, optimisticTimestamp: timestamp }));
      if (isAuthenticated) {
        immediateUpdate(key, productId, productSizeId, 0, timestamp);
      }
    },
    [dispatch, immediateUpdate, isAuthenticated],
  );

  const handleClearCart = async () => {
    if (isAuthenticated) {
      try {
        await dispatch(clearCart()).unwrap();
      } catch {
        dispatch(resetCart());
      }
    } else {
      dispatch(resetCart());
    }
    showToast.success(Messages.cart.cleared);
    setClearCartModalOpen(false);
  };

  const handleCheckout = () => {
    setCheckoutLoading(true);
    router.push(appendTableParamToUrl("/checkout"));
  };

  if (!mounted || !authReady || (loading.fetch && !loaded && isAuthenticated)) return <CartSkeleton />;

  if (items.length === 0) {
    return (
      <PageContainer className="py-8 sm:py-14 min-h-[60vh] flex flex-col items-center justify-center">
        <PageState
          type="empty"
          title="Your Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore our delicious menu items!"
          actionLabel="Browse Products"
          onAction={() => router.push(appendTableParamToUrl("/products"))}
          size="lg"
        />
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-primary/5 blur-[120px] rounded-full opacity-60" />

      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5 pb-28 sm:pb-11 lg:pb-5 relative z-10">
        <PageHeader
          title="Shopping Cart"
          subtitle={`Review your items before proceeding to checkout (${totalQuantity} total quantity)`}
          icon={ShoppingCart}
          count={totalItems}
          countLabel="items"
          showBackButton={true}
          backHref="/products"
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

          {/* Sidebar Summary */}
          <div className="hidden lg:block lg:col-span-1">
            <CartSummary
              orderContext={orderContext}
              totalItems={totalItems}
              totalQuantity={totalQuantity}
              subtotal={subtotal}
              discountAmount={discountAmount}
              finalTotal={finalTotal}
              checkoutLoading={checkoutLoading}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </PageContainer>

      <DeleteConfirmationModal
        isOpen={clearCartModalOpen}
        onClose={() => setClearCartModalOpen(false)}
        onDelete={handleClearCart}
        title="Clear Entire Cart?"
        description="Are you sure you want to remove all items from your shopping cart?"
        isSubmitting={loading.clear}
      />
    </div>
  );
}

export default function CartPageWrapper() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <CartPage />
    </Suspense>
  );
}
