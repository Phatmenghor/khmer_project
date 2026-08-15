"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState, useMemo } from "react";
import { OrderStatus } from "@/enums/order-status.enum";
import { OrderFromEnum } from "@/enums/order.enum";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CreditCard,
  MessageSquare,
  Lock,
  AlertCircle,
  User,
  Phone,
  Truck,
  Wallet,
  ShoppingBag,
  Receipt,
  ShieldCheck,
  Loader2,
  ArrowRight,
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
import { updateLocalCartItem, resetCart } from "@/features/main/store/slice/cart-slice";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomInput, CustomTextarea } from "@/components/shared";
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
        const axiosError = error as { response?: { status?: number } };
        const isExpectedError =
          axiosError?.response?.status === 404 ||
          (typeof error === "string" && error.includes("No default")) ||
          (typeof error === "string" && error.includes("not found"));

        if (!isExpectedError) {
          // Expected when no default address set yet
        }
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
        // Handled silently
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
    if (newQuantity === 0) {
      dispatch(updateLocalCartItem({ productId, productSizeId, quantity: 0 }));
      return;
    }
    dispatch(updateLocalCartItem({ productId, productSizeId, quantity: newQuantity }));
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
          items: items.map((item) => {
            const itemQty = Number(item.quantity ?? 1) > 0 ? Number(item.quantity ?? 1) : 1;
            const currentPrice = Number(item.currentPrice ?? item.finalPrice ?? 0);
            const finalPrice = Number(item.finalPrice ?? item.currentPrice ?? 0);
            const totalPrice = Number(item.totalPrice ?? finalPrice * itemQty);
            const totalBeforeDiscount = Number(item.totalBeforeDiscount ?? currentPrice * itemQty);
            const discountAmount = Number(item.discountAmount ?? Math.max(0, totalBeforeDiscount - totalPrice));

            const isValidUuid = (val?: string | null) =>
              Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

            const resolvedProductId = isValidUuid(item.productId)
              ? item.productId
              : isValidUuid(item.id)
              ? item.id
              : item.productId;

            return {
              id: isValidUuid(item.id) ? item.id : undefined,
              productId: resolvedProductId,
              productName: item.productName,
              productImageUrl: item.productImageUrl || "",
              productSizeId: isValidUuid(item.productSizeId) ? item.productSizeId : null,
              sizeName: item.sizeName || "",
              status: item.status || "",
              sku: item.sku || "",
              barcode: item.barcode || "",
              currentPrice: currentPrice,
              finalPrice: finalPrice,
              hasPromotion: Boolean(
                item.hasPromotion === "ACTIVE" ||
                  item.hasPromotion === "FUTURE_PROMOTION" ||
                  item.hasPromotion === true
              ),
              quantity: itemQty,
              totalBeforeDiscount: totalBeforeDiscount,
              discountAmount: discountAmount,
              totalPrice: totalPrice,
              promotionType: item.promotionType || "",
              promotionValue: Number(item.promotionValue ?? 0),
              promotionFromDate: item.promotionFromDate || new Date().toISOString(),
              promotionToDate: item.promotionToDate || new Date().toISOString(),
              customizations: item.customizations || [],
            };
          }),
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

      // Clear cart items immediately on successful order placement
      dispatch(resetCart());

      showToast.success(Messages.orders.placed);

      setTimeout(() => {
        router.push("/orders");
      }, 1200);
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

  if (!mounted || !authReady) {
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

  if (items.length === 0) {
    return (
      <PageContainer className="min-h-screen flex flex-col py-8 sm:py-14">
        <PageState
          type="empty"
          title="Cart is Empty"
          description="Add items to your cart before checking out."
          actionLabel="Browse Products"
          onAction={() => router.push("/products")}
          size="lg"
        />
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background glow — matching Cart and Category pages */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-primary/5 blur-[120px] rounded-full opacity-60" />

      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5 pb-28 sm:pb-11 lg:pb-5 relative z-10">
        <PageHeader
          title="Checkout"
          subtitle={`Review your delivery details and place your order (${totalQuantity} total quantity)`}
          icon={CreditCard}
          count={items.length}
          countLabel="items"
        />

        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Left Side: Delivery Details & Items */}
          <div className="lg:col-span-2 space-y-3">
            {/* Card 1: Delivery Address, Contact Info, & Instructions */}
            <div className="bg-gradient-to-b from-card via-card to-muted/20 border border-border/60 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3.5">
              {/* Header: Delivery Address */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Delivery Address
                  </span>
                  <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    Required
                  </span>
                </div>

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
              <div className="pt-2 border-t border-border/40 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  Contact Information
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5">
                  <CustomInput
                    label="Full Name"
                    required
                    leftIcon={<User className="h-3.5 w-3.5 text-muted-foreground" />}
                    value={checkoutState.customerName}
                    onChange={(e) =>
                      setCheckoutState((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    placeholder="Your full name"
                    size="sm"
                  />

                  <CustomInput
                    label="Phone Number"
                    required
                    type="tel"
                    leftIcon={<Phone className="h-3.5 w-3.5 text-muted-foreground" />}
                    value={checkoutState.customerPhone}
                    onChange={(e) =>
                      setCheckoutState((prev) => ({
                        ...prev,
                        customerPhone: e.target.value,
                      }))
                    }
                    placeholder="Your phone number"
                    size="sm"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div className="pt-2 border-t border-border/40">
                <CustomTextarea
                  label="Special Instructions"
                  leftIcon={<MessageSquare className="h-3.5 w-3.5 text-amber-500" />}
                  value={checkoutState.customerNote}
                  onChange={(e) =>
                    setCheckoutState((prev) => ({
                      ...prev,
                      customerNote: e.target.value.slice(0, 500),
                    }))
                  }
                  placeholder="Add any special requests or delivery notes for your order..."
                  maxLength={500}
                  showCount
                  rows={2}
                />
              </div>
            </div>

            {/* Card 2: Order Items */}
            <div className="bg-card border border-border/80 rounded-2xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <ShoppingBag className="h-3.5 w-3.5 text-emerald-500" />
                  Order Items
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/60">
                  {items.length} {items.length === 1 ? "item" : "items"} • {totalQuantity} qty
                </span>
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

          {/* Right Side: Desktop Order Summary Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-gradient-to-b from-card via-card to-muted/20 border border-border/60 rounded-2xl p-4 sticky top-16 shadow-sm space-y-3">
              <h2 className="text-xs font-bold flex items-center justify-between pb-2 border-b border-border/40">
                <span className="flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-primary" />
                  Order Summary
                </span>
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </h2>

              {/* Delivery & Payment Selection Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-foreground leading-tight flex items-center gap-1 min-h-[16px]">
                    <Truck className="h-3 w-3 text-primary" />
                    <span>Delivery Option</span>
                    <span className="text-destructive">*</span>
                  </label>
                  <ComboboxSelectDelivery
                    dataSelect={selectedDeliveryOption as any}
                    onChangeSelected={(item) => {
                      setCheckoutState((prev) => ({
                        ...prev,
                        selectedDeliveryOptionId: item ? item.id : null,
                      }));
                    }}
                    placeholder="Select delivery..."
                    error={!checkoutState.selectedDeliveryOptionId ? "Please select delivery option" : ""}
                    label=""
                    businessId={AppDefault.BUSINESS_ID}
                    statuses={["ACTIVE"]}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-foreground leading-tight flex items-center gap-1 min-h-[16px]">
                    <Wallet className="h-3 w-3 text-emerald-500" />
                    <span>Payment Method</span>
                    <span className="text-destructive">*</span>
                  </label>
                  <ComboboxSelectPaymentPublic
                    dataSelect={selectedPaymentOption as any}
                    onChangeSelected={(item) => {
                      setCheckoutState((prev) => ({
                        ...prev,
                        selectedPaymentOptionId: item ? item.id : null,
                      }));
                    }}
                    placeholder="Select payment..."
                    error={!checkoutState.selectedPaymentOptionId ? "Please select payment method" : ""}
                    label=""
                    businessId={AppDefault.BUSINESS_ID}
                    statuses={["ACTIVE"]}
                  />
                </div>
              </div>

              {/* Pricing Breakdown matching Cart Page */}
              <div className="space-y-2 text-xs pt-1 border-t border-border/40">
                <div className="bg-muted/40 rounded-xl p-2.5 border border-border/40 space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground">Items Breakdown</div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{items.length} unique {items.length === 1 ? "product" : "products"}</span>
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

                <div className="flex justify-between items-center pt-1.5 border-t border-border/40">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-semibold text-primary">
                    {deliveryFee > 0 ? `+${formatCurrency(deliveryFee)}` : "Free"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Tax
                    <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded font-medium">0%</span>
                  </span>
                  <span className="font-medium text-foreground">{formatCurrency(taxAmount)}</span>
                </div>

                {/* Total Box */}
                <div className="bg-primary/10 rounded-xl p-3 border border-primary/25 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">Total Amount</span>
                    <span className="text-base font-extrabold text-primary">{formatCurrency(orderTotal)}</span>
                  </div>
                </div>

                {discountAmount > 0 && (
                  <div className="text-center py-1 px-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20 text-[11px] font-bold">
                    🎉 You are saving {formatCurrency(discountAmount)} on this order!
                  </div>
                )}
              </div>

              {(!checkoutState.selectedAddressId ||
                !checkoutState.selectedDeliveryOptionId ||
                !checkoutState.selectedPaymentOptionId) && (
                <div className="flex items-center gap-1.5 p-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-500/20 text-[11px] font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Complete all required fields</span>
                </div>
              )}

              {/* Checkout Button matching Cart Page */}
              <CustomButton
                variant="default"
                className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 shadow-xs hover:shadow-md transition-all cursor-pointer"
                onClick={handleCheckout}
                disabled={!canCheckout || checkoutState.isProcessing}
              >
                {checkoutState.isProcessing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
                {checkoutState.isProcessing
                  ? "Processing Order..."
                  : `Place Order • ${formatCurrency(orderTotal)}`}
                {!checkoutState.isProcessing && <ArrowRight className="h-3.5 w-3.5 ml-auto" />}
              </CustomButton>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-medium pt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>256-bit Encrypted & Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Mobile Bottom Section & Floating Action Bar */}
      <div className="lg:hidden">
        {/* Mobile Summary Settings Card */}
        <div className="px-3 pb-24 space-y-3">
          <div className="bg-gradient-to-b from-card via-card to-muted/20 border border-border/60 rounded-2xl p-3.5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold flex items-center justify-between pb-2 border-b border-border/40">
              <span className="flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-primary" />
                Delivery & Payment
              </span>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                Options
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-foreground leading-tight flex items-center gap-1 min-h-[16px]">
                  <Truck className="h-3 w-3 text-primary" />
                  <span>Delivery Option</span>
                  <span className="text-destructive">*</span>
                </label>
                <ComboboxSelectDelivery
                  dataSelect={selectedDeliveryOption as any}
                  onChangeSelected={(item) => {
                    setCheckoutState((prev) => ({
                      ...prev,
                      selectedDeliveryOptionId: item ? item.id : null,
                    }));
                  }}
                  placeholder="Select delivery option..."
                  error={!checkoutState.selectedDeliveryOptionId ? "Please select delivery option" : ""}
                  label=""
                  businessId={AppDefault.BUSINESS_ID}
                  statuses={["ACTIVE"]}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-foreground leading-tight flex items-center gap-1 min-h-[16px]">
                  <Wallet className="h-3 w-3 text-emerald-500" />
                  <span>Payment Method</span>
                  <span className="text-destructive">*</span>
                </label>
                <ComboboxSelectPaymentPublic
                  dataSelect={selectedPaymentOption as any}
                  onChangeSelected={(item) => {
                    setCheckoutState((prev) => ({
                      ...prev,
                      selectedPaymentOptionId: item ? item.id : null,
                    }));
                  }}
                  placeholder="Select payment method..."
                  error={!checkoutState.selectedPaymentOptionId ? "Please select payment method" : ""}
                  label=""
                  businessId={AppDefault.BUSINESS_ID}
                  statuses={["ACTIVE"]}
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs pt-2 border-t border-border/40">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-semibold text-primary">
                  {deliveryFee > 0 ? `+${formatCurrency(deliveryFee)}` : "Free"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Floating Bottom Bar — matching Cart Page */}
        <div className="fixed bottom-12 left-2 right-2 z-40 lg:hidden bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-muted-foreground font-semibold">
                {items.length} {items.length === 1 ? "item" : "items"} • {totalQuantity} qty
              </div>
              <div className="text-base font-extrabold text-primary">{formatCurrency(orderTotal)}</div>
            </div>

            <CustomButton
              variant="default"
              className="gap-1.5 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 shadow-md cursor-pointer"
              onClick={handleCheckout}
              disabled={!canCheckout || checkoutState.isProcessing}
            >
              {checkoutState.isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              {checkoutState.isProcessing ? "Processing..." : "Place Order"}
              {!checkoutState.isProcessing && <ArrowRight className="h-3.5 w-3.5 ml-1" />}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutPageSkeleton() {
  return (
    <PageContainer className="py-3 sm:py-5 pb-28 sm:pb-5">
      <div className="mb-4 space-y-2">
        <div className="h-6 w-36 rounded-lg bg-muted/40 animate-pulse" />
        <div className="h-3.5 w-56 rounded-md bg-muted/30 animate-pulse" />
      </div>
      <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-card border border-border/80 rounded-2xl h-48 animate-pulse" />
          <div className="bg-card border border-border/80 rounded-2xl h-64 animate-pulse" />
        </div>
        <div className="hidden lg:block">
          <div className="h-64 w-full rounded-2xl border border-border/80 bg-card animate-pulse" />
        </div>
      </div>
    </PageContainer>
  );
}

