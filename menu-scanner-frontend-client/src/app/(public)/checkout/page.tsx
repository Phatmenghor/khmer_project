"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  MessageSquare,
  Lock,
  Loader2,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  Check,
  Truck,
} from "lucide-react";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useLocationState } from "@/redux/features/location/store/state/location-state";
import { usePaymentOptionsState } from "@/redux/features/master-data/store/state/payment-options-state";
import { useDeliveryOptionsState } from "@/redux/features/master-data/store/state/delivery-options-state";
import { useAppDispatch } from "@/redux/store";
import { fetchDefaultAddressService } from "@/redux/features/location/store/thunks/location-thunks";
import { createOrderService, CheckoutPayload } from "@/redux/features/main/store/thunks/order-thunks";
import { updateLocalCartItem } from "@/redux/features/main/store/slice/cart-slice";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { ComboboxSelectLocation } from "@/components/shared/combobox/combobox-select-location";
import { ComboboxSelectDelivery } from "@/components/shared/combobox/combobox-select-delivery-option";
import { ComboboxSelectPayment } from "@/components/shared/combobox/combobox-select-payment-option";
import { CartItemCard } from "@/components/shared/cart-item-card/cart-item-card";
import { AppDefault } from "@/constants/app-resource/default/default";

interface CheckoutState {
  selectedAddressId: string | null;
  selectedDeliveryOptionId: string | null;
  selectedPaymentOptionId: string | null;
  customerNote: string;
  isProcessing: boolean;
}

interface LocationResponse {
  id: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  streetNumber: string;
  houseNumber: string;
  note: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, profile, authReady } = useAuthState();
  const { items, finalTotal, subtotal, totalDiscount, totalQuantity } = useCartState();
  const { locations: addresses } = useLocationState();
  const { deliveryOptionsContent: deliveryOptions } = useDeliveryOptionsState();
  const { paymentOptionsContent: paymentOptions } = usePaymentOptionsState();

  const [mounted, setMounted] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<LocationResponse | null>(null);
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    selectedAddressId: null,
    selectedDeliveryOptionId: null,
    selectedPaymentOptionId: null,
    customerNote: "",
    isProcessing: false,
  });

  // Set mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch defaults and options on mount
  useEffect(() => {
    if (!mounted || !authReady || !isAuthenticated) return;

    const fetchDefaults = async () => {
      setLoadingDefaults(true);
      try {
        const defaultAddr = await dispatch(fetchDefaultAddressService()).unwrap();
        setDefaultAddress(defaultAddr);
        if (defaultAddr?.id) {
          setCheckoutState((prev) => ({
            ...prev,
            selectedAddressId: defaultAddr.id,
          }));
        }
      } catch (error: any) {
        // 404 is expected if no default address exists, don't log as error
        if (error?.response?.status !== 404) {
          console.error("Failed to fetch default address:", error);
        }
      }

      setLoadingDefaults(false);
    };

    fetchDefaults();
  }, [mounted, authReady, isAuthenticated, dispatch]);

  // Set default delivery option if available
  useEffect(() => {
    if (deliveryOptions && deliveryOptions.length > 0 && !checkoutState.selectedDeliveryOptionId) {
      setCheckoutState((prev) => ({
        ...prev,
        selectedDeliveryOptionId: deliveryOptions[0].id || null,
      }));
    }
  }, [deliveryOptions, checkoutState.selectedDeliveryOptionId]);

  // Set default payment option if available
  useEffect(() => {
    if (paymentOptions && paymentOptions.length > 0 && !checkoutState.selectedPaymentOptionId) {
      setCheckoutState((prev) => ({
        ...prev,
        selectedPaymentOptionId: paymentOptions[0].id || null,
      }));
    }
  }, [paymentOptions, checkoutState.selectedPaymentOptionId]);

  const selectedAddress = useMemo(
    () => addresses?.find((addr) => addr.id === checkoutState.selectedAddressId) || defaultAddress,
    [addresses, checkoutState.selectedAddressId, defaultAddress]
  );

  const selectedDeliveryOption = useMemo(
    () => deliveryOptions?.find((opt) => opt.id === checkoutState.selectedDeliveryOptionId),
    [deliveryOptions, checkoutState.selectedDeliveryOptionId]
  );

  const selectedPaymentOption = useMemo(
    () => paymentOptions?.find((opt) => opt.id === checkoutState.selectedPaymentOptionId),
    [paymentOptions, checkoutState.selectedPaymentOptionId]
  );

  const deliveryFee = selectedDeliveryOption?.price || 0;
  const orderTotal = finalTotal + deliveryFee;

  const handleQuantityChange = (
    productId: string,
    productSizeId: string | null,
    newQuantity: number
  ) => {
    if (newQuantity < 0) return;
    if (newQuantity === 0) {
      dispatch(updateLocalCartItem({ productId, productSizeId, quantity: 0 }));
      return;
    }
    dispatch(
      updateLocalCartItem({ productId, productSizeId, quantity: newQuantity })
    );
  };

  const canCheckout =
    items.length > 0 &&
    checkoutState.selectedAddressId &&
    checkoutState.selectedDeliveryOptionId &&
    checkoutState.selectedPaymentOptionId;

  const handleCheckout = async () => {
    if (!canCheckout) {
      showToast.error("Please complete all required fields");
      return;
    }

    if (!selectedAddress) {
      showToast.error("Please select a delivery address");
      return;
    }

    if (!selectedDeliveryOption) {
      showToast.error("Please select a delivery option");
      return;
    }

    if (!selectedPaymentOption) {
      showToast.error("Please select a payment method");
      return;
    }

    setCheckoutState((prev) => ({ ...prev, isProcessing: true }));

    try {
      const checkoutPayload: CheckoutPayload = {
        businessId: profile?.businessId || "",
        deliveryAddress: {
          village: selectedAddress.village || "",
          commune: selectedAddress.commune || "",
          district: selectedAddress.district || "",
          province: selectedAddress.province || "",
          streetNumber: selectedAddress.streetNumber || "",
          houseNumber: selectedAddress.houseNumber || "",
          note: selectedAddress.note || "",
          latitude: selectedAddress.latitude || 0,
          longitude: selectedAddress.longitude || 0,
        },
        deliveryOption: {
          name: selectedDeliveryOption.name || "",
          description: selectedDeliveryOption.description || "",
          imageUrl: selectedDeliveryOption.imageUrl || "",
          price: selectedDeliveryOption.price || 0,
        },
        cart: {
          businessId: profile?.businessId || "",
          businessName: profile?.businessName || "",
          items: items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            productImageUrl: item.productImageUrl,
            productSizeId: item.productSizeId,
            sizeName: item.sizeName || "",
            status: item.status || "",
            currentPrice: item.currentPrice,
            finalPrice: item.finalPrice,
            hasActivePromotion: item.hasPromotion || false,
            quantity: item.quantity,
            totalBeforeDiscount: item.totalBeforeDiscount || 0,
            discountAmount: item.discountAmount || 0,
            totalPrice: item.totalPrice,
            promotionType: item.promotionType || "",
            promotionValue: item.promotionValue || 0,
            promotionFromDate: item.promotionFromDate || new Date().toISOString(),
            promotionToDate: item.promotionToDate || new Date().toISOString(),
          })),
          totalItems: items.length,
          totalQuantity: totalQuantity,
          subtotalBeforeDiscount: subtotal,
          subtotal: subtotal,
          totalDiscount: totalDiscount,
          finalTotal: finalTotal,
        },
        payment: {
          paymentMethod: selectedPaymentOption.paymentOptionType,
          paymentStatus: "PENDING" as const,
        },
        customerNote: checkoutState.customerNote,
        orderProcessStatusName: "PENDING",
      };

      console.log("🛒 Checkout Payload:", checkoutPayload);

      // Call API endpoint to create order
      const orderResult = await dispatch(createOrderService(checkoutPayload)).unwrap();

      showToast.success("✅ Order placed successfully! Redirecting...");

      // Redirect to customer orders page
      setTimeout(() => {
        router.push("/orders");
      }, 1500);
    } catch (error: any) {
      console.error("Checkout error:", error);
      showToast.error(error?.message || "Failed to complete checkout");
    } finally {
      setCheckoutState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  // Prevent hydration mismatch - show skeleton until mounted
  if (!mounted || !authReady) {
    return <CheckoutPageSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <PageContainer className="py-12">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to continue with checkout.
          </p>
          <CustomButton
            onClick={() => router.push("/login")}
            className="w-full h-11 rounded-xl"
          >
            Sign In
          </CustomButton>
        </div>
      </PageContainer>
    );
  }

  if (items.length === 0) {
    return (
      <PageContainer className="py-12">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">
            Add items to your cart before checking out.
          </p>
          <CustomButton
            onClick={() => router.push("/products")}
            className="w-full h-11 rounded-xl"
          >
            Browse Products
          </CustomButton>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-0 pb-20">
      {/* Professional Header - Matches Cart Page */}
      <PageHeader
        title="Checkout"
        subtitle={`${items.length} ${items.length === 1 ? "item" : "items"} • ${totalQuantity} total quantity`}
        icon={CreditCard}
        count={items.length}
        countLabel="items"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Delivery Information - Clean & Professional */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 space-y-6">
            {/* Delivery Address */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Delivery Address
                <span className="text-red-500">*</span>
              </label>
              <ComboboxSelectLocation
                dataSelect={selectedAddress as any}
                onChangeSelected={(item) => {
                  if (item) {
                    setCheckoutState((prev) => ({
                      ...prev,
                      selectedAddressId: item.id,
                    }));
                  }
                }}
                placeholder="Select your delivery address..."
                hasDefault={!!defaultAddress}
                error={!checkoutState.selectedAddressId ? "Please select a delivery address" : ""}
                label=""
              />
            </div>

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Delivery & Payment Options - Side by Side */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Delivery Option */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  Delivery Option
                  <span className="text-red-500">*</span>
                </label>
                <ComboboxSelectDelivery
                  dataSelect={selectedDeliveryOption as any}
                  onChangeSelected={(item) => {
                    if (item) {
                      setCheckoutState((prev) => ({
                        ...prev,
                        selectedDeliveryOptionId: item.id,
                      }));
                    }
                  }}
                  placeholder="Select delivery option..."
                  error={!checkoutState.selectedDeliveryOptionId ? "Please select delivery option" : ""}
                  label=""
                  businessId={AppDefault.BUSINESS_ID}
                  statuses={["ACTIVE"]}
                />

              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment Method
                  <span className="text-red-500">*</span>
                </label>
                <ComboboxSelectPayment
                  dataSelect={selectedPaymentOption as any}
                  onChangeSelected={(item) => {
                    if (item) {
                      setCheckoutState((prev) => ({
                        ...prev,
                        selectedPaymentOptionId: item.id,
                      }));
                    }
                  }}
                  placeholder="Select payment method..."
                  error={!checkoutState.selectedPaymentOptionId ? "Please select payment method" : ""}
                  label=""
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Special Instructions
              </label>
              <textarea
                value={checkoutState.customerNote}
                onChange={(e) =>
                  setCheckoutState((prev) => ({
                    ...prev,
                    customerNote: e.target.value.slice(0, 500),
                  }))
                }
                placeholder="Add any special requests or notes for your order..."
                className="w-full h-28 p-4 rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                maxLength={500}
              />
              <div className="flex justify-between items-center px-1">
                <p className="text-xs text-muted-foreground">
                  {checkoutState.customerNote.length}/500 characters
                </p>
                {checkoutState.customerNote.length > 400 && (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    ⚠️ Approaching limit
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Order Items */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-7">
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-1.5">Order Items</h3>
              <p className="text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"} • {totalQuantity} total quantity
              </p>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
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
                    handleQuantityChange(item.productId, item.productSizeId || null, newQuantity)
                  }
                  onRemove={() =>
                    handleQuantityChange(item.productId, item.productSizeId || null, 0)
                  }
                  showLink={false}
                  showControls={true}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Order Summary - Sticky */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 sticky top-24 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-foreground mb-5">Order Summary</h2>

              <div className="space-y-3.5">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
                </div>

                {/* Discount */}
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600 dark:text-red-400 font-medium">Discount</span>
                    <span className="font-semibold text-red-600 dark:text-red-500">-{formatCurrency(totalDiscount)}</span>
                  </div>
                )}

                {/* Delivery Fee */}
                <div className="flex justify-between text-sm pt-2.5 border-t border-border/50">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium text-primary">+{formatCurrency(deliveryFee)}</span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-3.5 border-t border-border">
                  <span className="font-semibold text-foreground">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{formatCurrency(orderTotal)}</span>
                  </div>
                </div>

                {totalDiscount > 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400 text-right font-medium">
                    💰 You save {formatCurrency(totalDiscount)}
                  </p>
                )}
              </div>
            </div>

            {/* Validation Alert */}
            {(!checkoutState.selectedAddressId ||
              !checkoutState.selectedDeliveryOptionId ||
              !checkoutState.selectedPaymentOptionId) && (
              <div className="flex gap-3 p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Complete all required fields to continue
                </p>
              </div>
            )}

            {/* Checkout Button */}
            <CustomButton
              onClick={handleCheckout}
              disabled={!canCheckout || checkoutState.isProcessing}
              className={cn(
                "w-full gap-2 h-11 rounded-xl font-semibold text-sm",
                !canCheckout && "opacity-50 cursor-not-allowed"
              )}
            >
              {checkoutState.isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Order
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Place Order
                </>
              )}
            </CustomButton>

            <p className="text-xs text-muted-foreground text-center">
              🔒 Secure & encrypted checkout
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function CheckoutPageSkeleton() {
  return (
    <PageContainer className="py-0 pb-20">
      <div className="h-16 border-b mb-6 animate-pulse" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card border rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
        <div className="bg-card border rounded-2xl h-80 animate-pulse" />
      </div>
    </PageContainer>
  );
}
