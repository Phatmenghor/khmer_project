"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  LogIn,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/common/currency-format";
import { showToast } from "@/components/shared/common/show-toast";
import Link from "next/link";
import { clearCart, fetchCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { updateLocalCartItem } from "@/redux/features/main/store/slice/cart-slice";
import { useCartDebounce, cartItemKey } from "@/hooks/use-cart-debounce";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { cn } from "@/lib/utils";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";

function CartSkeleton() {
  return (
    <PageContainer className="py-4 sm:py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
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
    subtotal,
    totalDiscount,
    finalTotal,
    loading,
    loaded,
  } = useCartState();

  const { debouncedUpdate, immediateUpdate } = useCartDebounce(dispatch);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [clearCartModalOpen, setClearCartModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) return;
    if (!loaded && !loading.fetch) dispatch(fetchCart());
  }, [authReady, isAuthenticated, loaded, loading.fetch, dispatch]);

  const handleUpdateQuantity = useCallback(
    (productId: string, productSizeId: string | null, newQuantity: number) => {
      const key = cartItemKey(productId, productSizeId);
      const timestamp = Date.now();
      dispatch(updateLocalCartItem({ productId, productSizeId, quantity: newQuantity, optimisticTimestamp: timestamp }));
      if (newQuantity === 0) showToast.success("Item removed from cart");
      debouncedUpdate(key, productId, productSizeId, newQuantity, timestamp);
    },
    [dispatch, debouncedUpdate],
  );

  const handleRemoveItem = useCallback(
    (productId: string, productSizeId: string | null) => {
      const key = cartItemKey(productId, productSizeId);
      const timestamp = Date.now();
      dispatch(updateLocalCartItem({ productId, productSizeId, quantity: 0, optimisticTimestamp: timestamp }));
      showToast.success("Item removed from cart");
      immediateUpdate(key, productId, productSizeId, 0, timestamp);
    },
    [dispatch, immediateUpdate],
  );

  const handleClearCart = async () => {
    await dispatch(clearCart()).unwrap();
    showToast.success("Cart cleared");
  };

  const handleCheckout = () => {
    showToast.success("Proceeding to checkout...");
  };

  if (!mounted || !authReady || (loading.fetch && !loaded)) return <CartSkeleton />;

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

  if (items.length === 0) {
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
          subtitle={`${totalItems} ${totalItems === 1 ? "item" : "items"}`}
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
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card border rounded-2xl p-3 sm:p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                    <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden bg-muted border">
                      <Image
                        src={sanitizeImageUrl(item.productImageUrl, appImages.NoImage)}
                        alt={item.productName || "Product image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    {/* Product Name + Size in same row */}
                    <div className="flex items-center gap-2 min-w-0 mb-2">
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-medium text-sm leading-snug hover:text-primary transition-colors line-clamp-1">
                          {item.productName}
                        </h3>
                      </Link>
                      {item.sizeName && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
                          {item.sizeName}
                        </span>
                      )}
                      {item.hasPromotion && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 leading-none flex-shrink-0">
                          {item.promotionType === "PERCENTAGE"
                            ? `-${item.promotionValue}%`
                            : `-${formatCurrency(item.promotionValue || 0)}`}
                        </Badge>
                      )}
                    </div>

                    {/* Price Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-sm text-primary">{formatCurrency(item.finalPrice)}</span>
                      {item.hasPromotion && item.currentPrice > item.finalPrice && (
                        <span className="text-xs text-muted-foreground line-through">{formatCurrency(item.currentPrice)}</span>
                      )}
                    </div>

                    {/* Qty controls + Total + Delete */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          className={cn(
                            "h-8 w-8 rounded-lg border border-border flex items-center justify-center transition-all",
                            "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                          )}
                          onClick={() => handleUpdateQuantity(item.productId, item.productSizeId, item.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <div className="w-10 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-sm font-semibold text-primary">
                          {item.quantity}
                        </div>
                        <button
                          className={cn(
                            "h-8 w-8 rounded-lg border border-border flex items-center justify-center transition-all",
                            "hover:bg-primary hover:text-white hover:border-primary"
                          )}
                          onClick={() => handleUpdateQuantity(item.productId, item.productSizeId, item.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold whitespace-nowrap">{formatCurrency(item.totalPrice)}</span>
                        <button
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
                          onClick={() => handleRemoveItem(item.productId, item.productSizeId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order Summary (desktop) ── */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-card border rounded-2xl p-5 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">-{formatCurrency(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground text-xs">At checkout</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <p className="text-xs text-green-600 text-right mt-1">
                      You save {formatCurrency(totalDiscount)}!
                    </p>
                  )}
                </div>
              </div>
              <CustomButton className="w-full mb-2.5 gap-2 h-11 rounded-xl" onClick={handleCheckout}>
                <CreditCard className="h-4 w-4" />
                Proceed to Checkout
              </CustomButton>
              <CustomButton
                variant="outline"
                className="w-full gap-2 h-11 rounded-xl"
                onClick={() => router.push("/products")}
              >
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </CustomButton>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Mobile sticky checkout bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-xs text-muted-foreground">
            {totalItems} items
            {totalDiscount > 0 && (
              <span className="ml-2 text-green-600">Save {formatCurrency(totalDiscount)}</span>
            )}
          </div>
          <div className="text-lg font-bold text-primary">{formatCurrency(finalTotal)}</div>
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
