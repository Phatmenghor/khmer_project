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

  const [defaultAddress, setDefaultAddress] = useState<LocationResponse | null>(null);
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    selectedAddressId: null,
    selectedDeliveryOptionId: null,
    selectedPaymentOptionId: null,
    customerNote: "",
    isProcessing: false,
  });

  // Fetch defaults and options on mount
  useEffect(() => {
    if (!authReady || !isAuthenticated) return;

    const fetchDefaults = async () => {
      setLoadingDefaults(true);
      try {
        // Fetch default address
        const defaultAddr = await dispatch(fetchDefaultAddressService()).unwrap();
        setDefaultAddress(defaultAddr);
        if (defaultAddr?.id) {
          setCheckoutState((prev) => ({
            ...prev,
            selectedAddressId: defaultAddr.id,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch default address:", error);
      }

      try {
        // Fetch all addresses as fallback
        dispatch(fetchAllLocationsService());
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      }

      try {
        // Fetch delivery options
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
        // Fetch payment options
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
  }, [authReady, isAuthenticated, dispatch]);

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

  if (!authReady) {
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
    <PageContainer className="py-4 sm:py-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
          <p className="text-sm text-muted-foreground">{items.length} items</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address Section */}
          <div className="bg-card border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Delivery Address</h2>
            </div>

            {loadingDefaults ? (
              <div className="text-center py-6 text-muted-foreground">
                Loading default address...
              </div>
            ) : !defaultAddress && (!addresses || addresses.length === 0) ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  No delivery address found
                </p>
                <CustomButton
                  variant="outline"
                  onClick={() => router.push("/account/addresses")}
                  className="h-9 rounded-xl"
                >
                  Add Address
                </CustomButton>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Selected Address Display */}
                {selectedAddress && (
                  <div className="bg-primary/5 border-2 border-primary rounded-xl p-4">
                    <p className="font-semibold text-sm">{selectedAddress.fullAddress || "Default Address"}</p>
                    {selectedAddress.note && (
                      <p className="text-xs text-muted-foreground mt-1">{selectedAddress.note}</p>
                    )}
                  </div>
                )}

                {/* Combobox for selecting address */}
                {addresses && addresses.length > 1 && (
                  <select
                    value={checkoutState.selectedAddressId || ""}
                    onChange={(e) =>
                      setCheckoutState((prev) => ({
                        ...prev,
                        selectedAddressId: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id || ""}>
                        {addr.fullAddress || `${addr.houseNumber}, ${addr.streetNumber}`}
                      </option>
                    ))}
                  </select>
                )}

                {addresses && addresses.length > 0 && (
                  <CustomButton
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/account/addresses")}
                    className="w-full h-9 rounded-xl"
                  >
                    Manage Addresses
                  </CustomButton>
                )}
              </div>
            )}
          </div>

          {/* Delivery Option Section - Combobox */}
          <div className="bg-card border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Delivery Option</h2>
            </div>

            {!deliveryOptions || deliveryOptions.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No delivery options available
              </p>
            ) : (
              <div>
                <select
                  value={checkoutState.selectedDeliveryOptionId || ""}
                  onChange={(e) =>
                    setCheckoutState((prev) => ({
                      ...prev,
                      selectedDeliveryOptionId: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                >
                  <option value="">Select delivery option</option>
                  {deliveryOptions.map((option) => (
                    <option key={option.id} value={option.id || ""}>
                      {option.name} - +{formatCurrency(option.price || 0)}
                    </option>
                  ))}
                </select>

                {/* Selected option preview */}
                {selectedDeliveryOption && (
                  <div className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="font-semibold text-sm">{selectedDeliveryOption.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedDeliveryOption.description}</p>
                    <p className="text-sm font-bold text-primary mt-2">+{formatCurrency(selectedDeliveryOption.price || 0)}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Section - Combobox */}
          <div className="bg-card border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Payment Method</h2>
            </div>

            {!paymentOptions || paymentOptions.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No payment options available
              </p>
            ) : (
              <div>
                <select
                  value={checkoutState.selectedPaymentOptionId || ""}
                  onChange={(e) =>
                    setCheckoutState((prev) => ({
                      ...prev,
                      selectedPaymentOptionId: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                >
                  <option value="">Select payment method</option>
                  {paymentOptions.map((option) => (
                    <option key={option.id} value={option.id || ""}>
                      {option.name}
                    </option>
                  ))}
                </select>

                {/* Selected option preview */}
                {selectedPaymentOption && (
                  <div className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="font-semibold text-sm">{selectedPaymentOption.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedPaymentOption.paymentOptionType}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Items Section - Same as Cart Page */}
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 pb-4 border-b last:pb-0 last:border-b-0"
                >
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted border">
                      <Image
                        src={sanitizeImageUrl(
                          item.productImageUrl,
                          appImages.NoImage
                        )}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                      {item.productName}
                    </h3>
                    {item.sizeName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Size: {item.sizeName}
                      </p>
                    )}
                    <p className="text-sm font-bold text-primary mt-2">
                      {formatCurrency(item.finalPrice)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                      <CustomButton
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0"
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.productSizeId || null,
                            item.quantity - 1
                          )
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </CustomButton>
                      <div className="w-6 text-center text-xs font-semibold">
                        {item.quantity}
                      </div>
                      <CustomButton
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0"
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.productSizeId || null,
                            item.quantity + 1
                          )
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </CustomButton>
                    </div>

                    {/* Total & Delete */}
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {formatCurrency(item.totalPrice)}
                      </p>
                      <CustomButton
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10 mt-1"
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.productSizeId || null,
                            0
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </CustomButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Note Section - Below Order Items */}
          <div className="bg-card border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Additional Notes</h2>
            </div>

            <textarea
              value={checkoutState.customerNote}
              onChange={(e) =>
                setCheckoutState((prev) => ({
                  ...prev,
                  customerNote: e.target.value,
                }))
              }
              placeholder="Add any special instructions or notes for the delivery..."
              className="w-full min-h-24 p-3 rounded-xl border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {checkoutState.customerNote.length}/500 characters
            </p>
          </div>
        </div>

        {/* Sidebar - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-2xl p-6 sticky top-24 space-y-4">
            <h2 className="text-lg font-bold">Order Summary</h2>

            {/* Items */}
            <div className="space-y-2 pb-4 border-b">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">
                    -{formatCurrency(totalDiscount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items Total</span>
                <span className="font-medium">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {/* Delivery Fee */}
            <div className="space-y-2 pb-4 border-b">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {selectedDeliveryOption?.name || "Delivery"}
                </span>
                <span className="font-medium">
                  +{formatCurrency(deliveryFee)}
                </span>
              </div>

              {/* Payment Method */}
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium text-xs">
                  {selectedPaymentOption?.name || "—"}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(orderTotal)}
              </p>
            </div>

            {/* Validation Messages */}
            {!checkoutState.selectedAddressId && (
              <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Please select a delivery address
                </p>
              </div>
            )}

            {!checkoutState.selectedDeliveryOptionId && (
              <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Please select a delivery option
                </p>
              </div>
            )}

            {!checkoutState.selectedPaymentOptionId && (
              <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Please select a payment method
                </p>
              </div>
            )}

            {/* Checkout Button */}
            <CustomButton
              onClick={handleCheckout}
              disabled={!canCheckout || checkoutState.isProcessing}
              className={cn(
                "w-full h-11 rounded-xl gap-2 font-semibold",
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

            <p className="text-xs text-muted-foreground text-center">
              🔒 Your payment information is secure
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function CheckoutPageSkeleton() {
  return (
    <PageContainer className="py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card border rounded-2xl p-6 h-40 animate-pulse" />
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-2xl p-6 h-96 animate-pulse" />
        </div>
      </div>
    </PageContainer>
  );
}
