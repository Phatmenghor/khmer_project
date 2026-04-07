"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  ShoppingBag,
  CreditCard,
  LogIn,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/common/currency-format";
import { showToast } from "@/components/shared/common/show-toast";
import { clearCart, fetchCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { updateLocalCartItem } from "@/redux/features/main/store/slice/cart-slice";
import { useCartDebounce, cartItemKey } from "@/hooks/use-cart-debounce";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { CartItemCard } from "@/components/shared/cart-item-card/cart-item-card";

function CartItemSkeleton() {
  return (
    <div className="bg-card border rounded-2xl p-3 sm:p-4">
      <div className="flex gap-3">
        <Skeleton className="w-[72px] h-[72px] rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <PageContainer className="py-4 sm:py-8 pb-40 sm:pb-8">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </PageContainer>
  );
}

function CartEmptyState({
  title,
  message,
  onLogin,
  showLogin,
}: {
  title: string;
  message: string;
  onLogin?: () => void;
  showLogin?: boolean;
}) {
  const router = useRouter();
  return (
    <PageContainer className="py-16 sm:py-24">
      <div className="max-w-xs mx-auto text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <ShoppingCart className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{message}</p>
        <div className="flex flex-col gap-2.5">
          {showLogin && onLogin && (
            <CustomButton onClick={onLogin} className="w-full gap-2 h-11 rounded-xl">
              <LogIn className="h-4 w-4" />
              Sign In
            </CustomButton>
          )}
          <CustomButton
            variant={showLogin ? "outline" : "default"}
            onClick={() => router.push("/products")}
            className="w-full gap-2 h-11 rounded-xl"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </CustomButton>
        </div>
      </div>
    </PageContainer>
  );
}

export default function CartPage() {
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

  useEffect(() => setMounted(true), []);

  // Fetch all cart items on mount
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
    showToast.success("Cart cleared");
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (!mounted || !authReady) return <CartPageSkeleton />;
  if (loading.fetch && !loaded) return <CartPageSkeleton />;

  if (!isAuthenticated) {
    return (
      <>
        <CartEmptyState
          title="Your Cart"
          message="Please sign in to view your cart and start shopping."
          onLogin={() => setLoginModalOpen(true)}
          showLogin
        />
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </>
    );
  }

  if (items.length === 0 && loaded) {
    return (
      <CartEmptyState
        title="Your Cart is Empty"
        message="Add some items to get started!"
      />
    );
  }

  return (
    <>
      <PageContainer className="py-4 sm:py-8 pb-40 sm:pb-8">

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
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs rounded-xl"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </CustomButton>
          }
        />

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">

          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-3">
            {items.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Showing {items.length} items with total quantity {totalQuantity}
              </div>
            )}
            {items.map((item, index) => {
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
            })}

          </div>

          {/* ── Order Summary (desktop) ── */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-card border rounded-2xl p-5 sticky top-24">
              <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </h2>

              <div className="space-y-3 mb-5">
                {/* Items count with quantity */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="text-xs text-muted-foreground mb-2">Items Breakdown</div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{totalItems} unique {totalItems === 1 ? 'product' : 'products'}</span>
                    <span className="text-lg font-bold text-foreground">{totalQuantity}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">total quantity</div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {/* Discount */}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm bg-red-50/30 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200/50 dark:border-red-800/30">
                    <span className="text-red-700 dark:text-red-400 font-medium">Discount Applied</span>
                    <span className="font-bold text-red-600 dark:text-red-500">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Shipping & Fees</span>
                  <span className="text-muted-foreground text-xs">Calculated at checkout</span>
                </div>

                {/* Total */}
                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="text-xs text-red-600 dark:text-red-400 text-right pt-2 border-t border-primary/10">
                      💰 You save <span className="font-bold">{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              <CustomButton className="w-full mb-2.5 gap-2 h-11 rounded-xl" onClick={handleCheckout}>
                <CreditCard className="h-4 w-4" />
                Proceed to Checkout
              </CustomButton>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Mobile sticky checkout bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-xs">
            <div className="text-muted-foreground font-medium">{totalItems} items • {totalQuantity} qty</div>
            {discountAmount > 0 && (
              <div className="text-red-600 dark:text-red-400 font-semibold mt-0.5">
                Save {formatCurrency(discountAmount)}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-xl font-bold text-primary">{formatCurrency(finalTotal)}</div>
          </div>
        </div>
        <CustomButton className="w-full gap-2 h-11 rounded-xl" onClick={handleCheckout}>
          <CreditCard className="h-4 w-4" />
          Proceed to Checkout
          <ArrowRight className="h-4 w-4 ml-auto" />
        </CustomButton>
      </div>

      <DeleteConfirmationModal
        isOpen={clearCartModalOpen}
        onClose={() => setClearCartModalOpen(false)}
        onDelete={handleClearCart}
        title="Clear Cart"
        description="Are you sure you want to remove all items from your cart?"
        variant="critical"
      />
    </>
  );
}
