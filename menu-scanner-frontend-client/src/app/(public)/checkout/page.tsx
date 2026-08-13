"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState, useMemo } from "react";
import { OrderFromEnum } from "@/enums/order.enum";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CreditCard,
  MessageSquare,
  Lock,
  AlertCircle,
  Truck,
  User,
  ShoppingBag,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useCartState } from "@/features/main/store/state/cart-state";
import { useLocationState } from "@/features/location/store/state/location-state";
import { usePaymentOptionsState } from "@/features/master-data/store/state/payment-options-state";
import { useDeliveryOptionsState } from "@/features/master-data/store/state/delivery-options-state";
import { useAppDispatch } from "@/store";
import { fetchDefaultAddressService } from "@/features/location/store/thunks/location-thunks";
import { fetchPublicPaymentOptionsService } from "@/features/master-data/store/thunks/payment-options-thunks";
import { createOrderService, CheckoutPayload } from "@/features/main/store/thunks/order-thunks";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { updateLocalCartItem } from "@/features/main/store/slice/cart-slice";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import { ComboboxSelectLocation } from "@/components/shared/combobox/combobox-select-location";
import { ComboboxSelectDelivery } from "@/components/shared/combobox/combobox-select-delivery-option";
import { ComboboxSelectPaymentPublic } from "@/components/shared/combobox/combobox-select-payment-public";
import { CartItemCard } from "@/components/shared/cart-item-card/cart-item-card";
import { AppDefault } from "@/constants/app-resource/default/default";
import { SignInRequired } from "@/components/shared/auth/sign-in-required";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { PageState } from "@/components/shared/page-state";
import { Input } from "@/components/ui/input";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { Badge } from "@/components/ui/badge";

interface CheckoutState {
  selectedAddressId: string | null;
  selectedDeliveryOptionId: string | null;
  selectedPaymentOptionId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
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
  const { items, finalTotal, subtotal, discountAmount, totalQuantity } = useCartState();
  const { locations: addresses } = useLocationState();
  const { deliveryOptionsContent: deliveryOptions } = useDeliveryOptionsState();
  const { paymentOptionsContent: paymentOptions } = usePaymentOptionsState();

  const [mounted, setMounted] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<LocationResponse | null>(null);
  const [loadingDefaults, setLoadingDefaults] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<OrderResponse | null>(null);

  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    selectedAddressId: null,
    selectedDeliveryOptionId: null,
    selectedPaymentOptionId: null,
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerNote: "",
    isProcessing: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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
      } catch (error: unknown) {
        // Ignored
      }
      setLoadingDefaults(false);
    };

    fetchDefaults();
  }, [mounted, authReady, isAuthenticated, dispatch]);

  useEffect(() => {
    if (deliveryOptions && deliveryOptions.length > 0 && !checkoutState.selectedDeliveryOptionId) {
      setCheckoutState((prev) => ({
        ...prev,
        selectedDeliveryOptionId: deliveryOptions[0].id || null,
      }));
    }
  }, [deliveryOptions, checkoutState.selectedDeliveryOptionId]);

  useEffect(() => {
    if (!mounted) return;

    const fetchPaymentOptions = async () => {
      try {
        await dispatch(
          fetchPublicPaymentOptionsService({
            businessId: AppDefault.BUSINESS_ID,
            pageNo: 1,
            pageSize: 100,
          })
        ).unwrap();
      } catch (error) {
        // Ignored
      }
    };

    fetchPaymentOptions();
  }, [mounted, dispatch]);

  useEffect(() => {
    if (paymentOptions && paymentOptions.length > 0 && !checkoutState.selectedPaymentOptionId) {
      const cashOption = paymentOptions.find((opt) => opt.paymentOptionType === "CASH");
      const defaultOption = cashOption || paymentOptions[0];
      setCheckoutState((prev) => ({
        ...prev,
        selectedPaymentOptionId: defaultOption.id || null,
      }));
    }
  }, [paymentOptions, checkoutState.selectedPaymentOptionId]);

  useEffect(() => {
    if (profile && mounted && authReady) {
      setCheckoutState((prev) => ({
        ...prev,
        customerName: prev.customerName || profile?.fullName || "",
        customerPhone: prev.customerPhone || profile?.phoneNumber || "",
        customerEmail: prev.customerEmail || profile?.email || "",
      }));
    }
  }, [profile, mounted, authReady]);

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
  const taxRate = 0;
  const taxAmount = (finalTotal + deliveryFee) * taxRate;
  const orderTotal = finalTotal + deliveryFee + taxAmount;

  const handleQuantityChange = (
    productId: string,
    productSizeId: string | null,
    newQuantity: number
  ) => {
    if (newQuantity < 0) return;
    dispatch(
      updateLocalCartItem({ productId, productSizeId, quantity: newQuantity })
    );
  };

  const canCheckout =
    items.length > 0 &&
    checkoutState.selectedAddressId &&
    checkoutState.selectedDeliveryOptionId &&
    checkoutState.selectedPaymentOptionId &&
    checkoutState.customerName.trim() &&
    checkoutState.customerPhone.trim();

  const handleCheckout = async () => {
    if (!canCheckout) {
      showToast.error(Messages.validation.requiredFields);
      return;
    }

    if (!selectedAddress) {
      showToast.error(Messages.delivery.selectAddress);
      return;
    }

    if (!selectedDeliveryOption) {
      showToast.error(Messages.delivery.selectOption);
      return;
    }

    if (!selectedPaymentOption) {
      showToast.error(Messages.payment.selectMethod);
      return;
    }

    setCheckoutState((prev) => ({ ...prev, isProcessing: true }));

    try {
      const checkoutPayload: CheckoutPayload = {
        businessId: AppDefault.BUSINESS_ID,
        addressId: selectedAddress?.id,
        deliveryOption: {
          name: selectedDeliveryOption.name || "",
          description: selectedDeliveryOption.description || "",
          imageUrl: selectedDeliveryOption.image?.sm || selectedDeliveryOption.image?.md || "",
          price: selectedDeliveryOption.price || 0,
        },
        customerName: checkoutState.customerName,
        customerPhone: checkoutState.customerPhone,
        customerEmail: checkoutState.customerEmail,
        cart: {
          businessId: AppDefault.BUSINESS_ID,
          businessName: "Default Business",
          items: items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            productImageUrl: item.productImageUrl,
            productSizeId: item.productSizeId,
            sizeName: item.sizeName || "",
            status: item.status || "",
            sku: item.sku || "",
            barcode: item.barcode || "",
            currentPrice: item.currentPrice ?? item.finalPrice ?? 0,
            finalPrice: item.finalPrice ?? item.currentPrice ?? 0,
            hasPromotion: Boolean(
              item.hasPromotion === "ACTIVE" ||
                item.hasPromotion === "FUTURE_PROMOTION" ||
                item.hasPromotion === true
            ),
            quantity: Number(item.quantity) || 1,
            totalBeforeDiscount: item.totalBeforeDiscount || 0,
            discountAmount: item.discountAmount || 0,
            totalPrice: item.totalPrice ?? (item.finalPrice ?? item.currentPrice ?? 0) * (Number(item.quantity) || 1),
            promotionType: item.promotionType || "",
            promotionValue: item.promotionValue || 0,
            promotionFromDate: item.promotionFromDate || new Date().toISOString(),
            promotionToDate: item.promotionToDate || new Date().toISOString(),
            customizations: item.customizations || [],
          })),
          totalItems: items.length,
          totalQuantity: totalQuantity,
          subtotalBeforeDiscount: subtotal,
          subtotal: subtotal,
          customizationTotal: 0,
          totalDiscount: discountAmount,
          finalTotal: finalTotal,
        },
        pricing: {
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          taxPercentage: 0,
          taxAmount: 0,
          discountAmount: discountAmount,
          finalTotal: orderTotal,
        },
        payment: {
          paymentMethod: selectedPaymentOption.paymentOptionType,
          paymentStatus: "UNPAID" as const,
        },
        customerNote: checkoutState.customerNote,
        orderFrom: OrderFromEnum.CUSTOMER,
      };

      const orderResult: OrderResponse = await dispatch(createOrderService(checkoutPayload)).unwrap();
      setPlacedOrder(orderResult);
      showToast.success(Messages.orders.placed);
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        axiosErr?.response?.data?.message ||
        axiosErr?.message ||
        "Failed to complete checkout. Please try again.";

      showToast.error(errorMessage);
    } finally {
      setCheckoutState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  if (!mounted || !authReady || loadingDefaults) {
    return <CheckoutPageSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <SignInRequired
          title="Checkout"
          description="Please sign in to continue with your checkout."
          icon="🔒"
          onSignIn={() => setLoginModalOpen(true)}
          browseButtonText="Continue Shopping"
          onBrowse={() => router.push("/products")}
        />
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </>
    );
  }

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageState
          type="empty"
          title="Cart is Empty"
          description="Add items to your cart before checking out."
          actionLabel="Browse Products"
          onAction={() => router.push("/products")}
          size="lg"
        />
      </div>
    );
  }

  return (
    <PageContainer className="py-0 pb-28 sm:pb-14 lg:pb-5">
      <PageHeader
        title="Checkout"
        subtitle={`${items.length} ${items.length === 1 ? "item" : "items"} • ${totalQuantity} total quantity`}
        icon={CreditCard}
        count={items.length}
        countLabel="items"
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ── LEFT 2 COLUMNS: ADDRESS, CONTACT, INSTRUCTIONS & ITEMS ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card 1: Delivery & Contact Section */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-primary/30 transition-all space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="font-extrabold text-sm text-foreground">Delivery & Contact Details</h3>
            </div>

            {/* Delivery Address Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                Delivery Address <span className="text-red-500">*</span>
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
                error={!checkoutState.selectedAddressId ? Messages.delivery.selectAddress : ""}
                label=""
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                <h4 className="text-xs font-bold text-foreground">Customer Info</h4>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={checkoutState.customerName}
                    onChange={(e) =>
                      setCheckoutState((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    placeholder="Your full name"
                    className="h-9 rounded-xl border-border/80 bg-muted/30 focus:bg-background text-xs font-normal text-foreground placeholder:text-muted-foreground/70 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={checkoutState.customerPhone}
                    onChange={(e) =>
                      setCheckoutState((prev) => ({
                        ...prev,
                        customerPhone: e.target.value,
                      }))
                    }
                    placeholder="Your phone number"
                    className="h-9 rounded-xl border-border/80 bg-muted/30 focus:bg-background text-xs font-normal text-foreground placeholder:text-muted-foreground/70 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Option & Payment Selectors (Mobile + Desktop integrated) */}
            <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-border/50">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-primary" /> Delivery Method <span className="text-red-500">*</span>
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
                  placeholder="Select delivery method..."
                  error={!checkoutState.selectedDeliveryOptionId ? "Please select delivery option" : ""}
                  label=""
                  businessId={AppDefault.BUSINESS_ID}
                  statuses={["ACTIVE"]}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5 text-primary" /> Payment Method <span className="text-red-500">*</span>
                </label>
                <ComboboxSelectPaymentPublic
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
                  businessId={AppDefault.BUSINESS_ID}
                  statuses={["ACTIVE"]}
                />
              </div>
            </div>

            {/* Special Instructions Note */}
            <div className="space-y-1.5 pt-3 border-t border-border/50">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
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
                placeholder="Add any special requests or delivery instructions..."
                className="w-full h-20 p-3 rounded-xl border border-border/80 bg-muted/30 focus:bg-background placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-xs font-normal text-foreground transition-all"
                maxLength={500}
              />
              <div className="flex justify-between items-center px-1">
                <p className="text-[11px] text-muted-foreground font-medium">
                  {checkoutState.customerNote.length}/500 characters
                </p>
                {checkoutState.customerNote.length > 400 && (
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    ⚠️ Approaching limit
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Order Items Section */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <h3 className="font-extrabold text-sm text-foreground">Order Items</h3>
              </div>
              <Badge variant="secondary" className="text-xs font-extrabold rounded-full px-2.5 py-0.5">
                {items.length} {items.length === 1 ? "Item" : "Items"} ({totalQuantity} Qty)
              </Badge>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <CartItemCard
                  key={`${item.productId}-${item.productSizeId ?? "no-size"}-${(item.customizations ?? []).map((c: any) => c.productCustomizationId).sort().join(",")}`}
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

        {/* ── RIGHT 1 COLUMN: ORDER SUMMARY SIDEBAR ── */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs sticky top-20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <h3 className="font-extrabold text-sm text-foreground">Order Summary</h3>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Subtotal ({items.length} items)</span>
                <span className="font-bold text-foreground">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center bg-red-50/60 dark:bg-red-950/40 p-2 rounded-xl border border-red-200/60 dark:border-red-800/40">
                  <span className="text-red-600 dark:text-red-400 font-extrabold">Discount</span>
                  <span className="font-extrabold text-red-600 dark:text-red-400">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-border/50">
                <span className="text-muted-foreground font-medium">Delivery Fee</span>
                <span className="font-extrabold text-primary">
                  {deliveryFee > 0 ? `+${formatCurrency(deliveryFee)}` : "Free"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  Tax
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-bold">0%</span>
                </span>
                <span className="font-bold text-foreground">{formatCurrency(taxAmount)}</span>
              </div>

              <div className="bg-primary/10 rounded-xl p-3 border border-primary/25 shadow-2xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Total Amount</span>
                  <span className="text-base font-extrabold text-primary">{formatCurrency(orderTotal)}</span>
                </div>
              </div>

              {discountAmount > 0 && (
                <p className="text-[11px] text-red-600 dark:text-red-400 text-center font-bold bg-red-50/50 dark:bg-red-950/30 p-1.5 rounded-xl border border-red-200/40">
                  🎉 Total Savings: {formatCurrency(discountAmount)}
                </p>
              )}
            </div>

            {!canCheckout && (
              <div className="flex items-start gap-2 p-2.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  Please complete address, contact details, delivery, and payment method to place your order.
                </p>
              </div>
            )}

            <CustomButton
              onClick={handleCheckout}
              disabled={!canCheckout || checkoutState.isProcessing}
              className={cn(
                "w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 shadow-xs hover:shadow-md transition-all cursor-pointer",
                !canCheckout && "opacity-50 cursor-not-allowed"
              )}
            >
              <Lock className="h-3.5 w-3.5" />
              {checkoutState.isProcessing ? "Processing Order..." : "Place Order"}
            </CustomButton>

            <p className="text-[11px] text-muted-foreground text-center font-medium flex items-center justify-center gap-1">
              <span>🔒</span> Secure 256-bit Encrypted Checkout
            </p>
          </div>
        </div>
      </div>

      {/* Order Success Custom Modal */}
      {placedOrder && (
        <CustomModal
          isOpen={!!placedOrder}
          onClose={() => {
            setPlacedOrder(null);
            router.push("/orders");
          }}
          size="md"
          className="p-4"
        >
          <div className="py-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5px]" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-foreground">Thank You for Your Order!</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Order <span className="font-extrabold text-foreground">#{placedOrder.orderNumber}</span> has been created.
              </p>
            </div>

            <div className="bg-muted/40 rounded-xl p-3 border border-border/60 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Customer:</span>
                <span className="font-bold text-foreground">{placedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Total Amount:</span>
                <span className="font-black text-primary">{formatCurrency(placedOrder.pricing?.finalTotal || orderTotal)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <CustomButton
                variant="outline"
                className="flex-1 rounded-xl text-xs font-bold py-2.5 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                onClick={() => router.push("/products")}
              >
                Continue Shopping
              </CustomButton>
              <CustomButton
                className="flex-1 rounded-xl text-xs font-extrabold py-2.5 gap-1 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                onClick={() => router.push("/orders")}
              >
                View My Orders
                <ChevronRight className="h-3.5 w-3.5" />
              </CustomButton>
            </div>
          </div>
        </CustomModal>
      )}
    </PageContainer>
  );
}

function CheckoutPageSkeleton() {
  return (
    <PageContainer className="py-0 pb-28 sm:pb-14 lg:pb-5">
      {/* Header Skeleton */}
      <div className="py-4 mb-4 border-b border-border/60 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-36 bg-muted/60 rounded-lg animate-pulse" />
          <div className="h-3.5 w-48 bg-muted/40 rounded-md animate-pulse" />
        </div>
        <div className="h-8 w-24 bg-muted/50 rounded-full animate-pulse" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left Column: Delivery & Items Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card 1: Delivery & Contact Skeleton */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <div className="h-4 w-4 bg-muted/60 rounded-full animate-pulse" />
              <div className="h-4 w-40 bg-muted/60 rounded-md animate-pulse" />
            </div>

            {/* Address Combobox Skeleton */}
            <div className="space-y-2">
              <div className="h-3.5 w-28 bg-muted/50 rounded-md animate-pulse" />
              <div className="h-9 w-full bg-muted/40 rounded-xl border border-border/60 animate-pulse" />
            </div>

            {/* Customer Info Inputs Skeleton */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="h-3.5 w-24 bg-muted/50 rounded-md animate-pulse" />
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="h-3 w-16 bg-muted/40 rounded-md animate-pulse" />
                  <div className="h-9 w-full bg-muted/30 rounded-xl border border-border/60 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-20 bg-muted/40 rounded-md animate-pulse" />
                  <div className="h-9 w-full bg-muted/30 rounded-xl border border-border/60 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Method Selectors Skeleton */}
            <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-border/50">
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 bg-muted/50 rounded-md animate-pulse" />
                <div className="h-9 w-full bg-muted/40 rounded-xl border border-border/60 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 bg-muted/50 rounded-md animate-pulse" />
                <div className="h-9 w-full bg-muted/40 rounded-xl border border-border/60 animate-pulse" />
              </div>
            </div>

            {/* Textarea Skeleton */}
            <div className="space-y-1.5 pt-3 border-t border-border/50">
              <div className="h-3.5 w-32 bg-muted/50 rounded-md animate-pulse" />
              <div className="h-20 w-full bg-muted/30 rounded-xl border border-border/60 animate-pulse" />
            </div>
          </div>

          {/* Card 2: Order Items Skeleton */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="h-4 w-28 bg-muted/60 rounded-md animate-pulse" />
              <div className="h-5 w-24 bg-muted/40 rounded-full animate-pulse" />
            </div>

            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20">
                  <div className="w-14 h-14 bg-muted/50 rounded-xl shrink-0 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 bg-muted/60 rounded-md animate-pulse" />
                    <div className="h-3 w-1/3 bg-muted/40 rounded-md animate-pulse" />
                  </div>
                  <div className="h-7 w-20 bg-muted/50 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="h-4 w-28 bg-muted/60 rounded-md animate-pulse" />
              <div className="h-4 w-4 bg-muted/50 rounded-full animate-pulse" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-3 w-20 bg-muted/40 rounded-md animate-pulse" />
                  <div className="h-3.5 w-14 bg-muted/60 rounded-md animate-pulse" />
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t-2 border-border/60">
                <div className="h-4 w-24 bg-muted/70 rounded-md animate-pulse" />
                <div className="h-5 w-20 bg-muted/80 rounded-md animate-pulse" />
              </div>
            </div>

            <div className="h-10 w-full bg-primary/20 rounded-xl animate-pulse" />
            <div className="h-3 w-40 bg-muted/30 rounded-md mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
