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
} from "lucide-react";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useLocationState } from "@/redux/features/location/store/state/location-state";
import { usePaymentOptionsState } from "@/redux/features/master-data/store/state/payment-options-state";
import { useDeliveryOptionsState } from "@/redux/features/master-data/store/state/delivery-options-state";
import { useAppDispatch } from "@/redux/store";
import { fetchDefaultAddressService, fetchAllLocationsService } from "@/redux/features/location/store/thunks/location-thunks";
import { fetchAllDeliveryOptionsService } from "@/redux/features/master-data/store/thunks/delivery-options-thunks";
import { fetchAllPaymentOptionsService } from "@/redux/features/master-data/store/thunks/payment-options-thunks";
import { createOrderService, CheckoutPayload } from "@/redux/features/main/store/thunks/order-thunks";
import { updateLocalCartItem } from "@/redux/features/main/store/slice/cart-slice";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { ComboboxSelectLocation } from "@/components/shared/combobox/combobox-select-location";
import { ComboboxSelectDelivery } from "@/components/shared/combobox/combobox-select-delivery-option";
import { ComboboxSelectPayment } from "@/components/shared/combobox/combobox-select-payment-option";

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

      try {
        dispatch(fetchAllLocationsService());
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      }

      try {
        dispatch(
          fetchAllDeliveryOptionsService({
            pageNo: 1,
            pageSize: 100,
          })
        );
      } catch (error) {
        console.error("Failed to fetch delivery options:", error);
      }

      try {
        dispatch(
          fetchAllPaymentOptionsService({
            pageNo: 1,
            pageSize: 100,
          })
        );
      } catch (error) {
        console.error("Failed to fetch payment options:", error);
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
    <PageContainer className="py-3 sm:py-6 pb-20">
      {/* Compact Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Checkout</h1>
          <p className="text-xs text-muted-foreground">{items.length} items</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main Content - Compact */}
        <div className="lg:col-span-2 space-y-3">
          {/* Delivery Address - Using Combobox */}
          <div className="bg-card border rounded-xl p-4">
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
              label="Delivery Address"
              required
              placeholder="Select address..."
              hasDefault={!!defaultAddress}
              error={!checkoutState.selectedAddressId ? "Required" : ""}
            />
          </div>

          {/* Delivery & Payment - Side by Side */}
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Delivery Option - Combobox */}
            <div className="bg-card border rounded-xl p-4">
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
                label="Delivery"
                required
                placeholder="Select option..."
                error={!checkoutState.selectedDeliveryOptionId ? "Required" : ""}
              />
            </div>

            {/* Payment Option - Combobox */}
            <div className="bg-card border rounded-xl p-4">
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
                label="Payment"
                required
                placeholder="Select method..."
                error={!checkoutState.selectedPaymentOptionId ? "Required" : ""}
              />
            </div>
          </div>

          {/* Order Items - Compact */}
          <div className="bg-card border rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3">Items ({items.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 pb-2 border-b last:pb-0 last:border-b-0">
                  {/* Image */}
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted border flex-shrink-0">
                    <Image
                      src={sanitizeImageUrl(item.productImageUrl, appImages.NoImage)}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{item.productName}</p>
                    {item.sizeName && (
                      <p className="text-xs text-muted-foreground">Size: {item.sizeName}</p>
                    )}
                    <p className="text-xs font-bold text-primary mt-1">
                      {formatCurrency(item.finalPrice)} × {item.quantity}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.productId,
                          item.productSizeId || null,
                          item.quantity - 1
                        )
                      }
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.productId,
                          item.productSizeId || null,
                          item.quantity + 1
                        )
                      }
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.productId,
                          item.productSizeId || null,
                          0
                        )
                      }
                      className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors ml-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Notes - Compact */}
          <div className="bg-card border rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-2">Notes</h3>
            <textarea
              value={checkoutState.customerNote}
              onChange={(e) =>
                setCheckoutState((prev) => ({
                  ...prev,
                  customerNote: e.target.value.slice(0, 500),
                }))
              }
              placeholder="Special instructions..."
              className="w-full h-16 p-2 rounded-lg border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-xs"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {checkoutState.customerNote.length}/500
            </p>
          </div>
        </div>

        {/* Sidebar - Order Summary - Compact & Sticky */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-xl p-4 sticky top-20 space-y-3">
            <h3 className="font-bold text-sm">Summary</h3>

            {/* Breakdown */}
            <div className="space-y-1.5 text-xs pb-3 border-b">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">+{formatCurrency(deliveryFee)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(orderTotal)}</p>
            </div>

            {/* Validation */}
            {(!checkoutState.selectedAddressId ||
              !checkoutState.selectedDeliveryOptionId ||
              !checkoutState.selectedPaymentOptionId) && (
              <div className="flex gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200/50">
                <AlertCircle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Complete all fields
                </p>
              </div>
            )}

            {/* Checkout Button */}
            <CustomButton
              onClick={handleCheckout}
              disabled={!canCheckout || checkoutState.isProcessing}
              className={cn(
                "w-full h-10 rounded-lg gap-2 font-semibold text-sm",
                !canCheckout && "opacity-50 cursor-not-allowed"
              )}
            >
              {checkoutState.isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Place Order
                </>
              )}
            </CustomButton>

            <p className="text-xs text-muted-foreground text-center">🔒 Secure</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function CheckoutPageSkeleton() {
  return (
    <PageContainer className="py-6">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-muted rounded-xl h-20 animate-pulse" />
          ))}
        </div>
        <div className="bg-muted rounded-xl h-64 animate-pulse" />
      </div>
    </PageContainer>
  );
}
