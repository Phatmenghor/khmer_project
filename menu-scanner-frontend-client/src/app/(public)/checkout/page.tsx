"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ShoppingBag, Receipt } from "lucide-react";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useCartState } from "@/features/main/store/state/cart-state";
import { useLocationState } from "@/features/location/store/state/location-state";
import { usePaymentOptionsState } from "@/features/master-data/store/state/payment-options-state";
import { useDeliveryOptionsState } from "@/features/master-data/store/state/delivery-options-state";
import { useAppDispatch } from "@/store";
import { fetchDefaultAddressService } from "@/features/location/store/thunks/location-thunks";
import { fetchPublicPaymentOptionsService } from "@/features/master-data/store/thunks/payment-options-thunks";
import { fetchPublicDeliveryOptionsService } from "@/features/master-data/store/thunks/delivery-options-thunks";
import { createOrderService, CheckoutPayload } from "@/features/main/store/thunks/order-thunks";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { OrderFromEnum } from "@/enums/order.enum";
import { updateLocalCartItem, resetCart, loadCartFromStorage } from "@/features/main/store/slice/cart-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { getActiveTableSession, appendTableParamToUrl } from "@/utils/table/table-session";
import { CartItemCard } from "@/components/shared/cart-item-card/cart-item-card";
import { AppDefault } from "@/constants/app-resource/default/default";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { OrderSuccessModal } from "@/components/shared/modal/order-success-modal";
import { PageState } from "@/components/shared/page-state";
import { CheckoutSkeleton } from "@/components/checkout/checkout-skeleton";
import { CheckoutTableServiceCard } from "@/components/checkout/checkout-table-service-card";
import { CheckoutCustomerSection } from "@/components/checkout/checkout-customer-section";
import { CheckoutSummarySection } from "@/components/checkout/checkout-summary-section";
import { getOrderContext } from "@/utils/order/order-context";

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

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isAuthenticated, profile, authReady } = useAuthState();
  const { items, totalQuantity, subtotal, discountAmount, finalTotal, loaded: cartLoaded } = useCartState();
  const { locations } = useLocationState();
  const { paymentOptionsData } = usePaymentOptionsState();
  const { deliveryOptionsData } = useDeliveryOptionsState();

  const addresses = locations || [];
  const paymentOptions = paymentOptionsData?.content || [];
  const deliveryOptions = deliveryOptionsData?.content || [];

  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<OrderResponse | null>(null);
  const [activeTableSession, setActiveTableSessionState] = useState<any>(null);

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
    if (typeof window !== "undefined") {
      setActiveTableSessionState(getActiveTableSession());
    }
  }, []);

  const orderContext = getOrderContext(isAuthenticated, activeTableSession);

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated && !cartLoaded) {
      dispatch(loadCartFromStorage());
    }
  }, [authReady, isAuthenticated, cartLoaded, dispatch]);

  useEffect(() => {
    if (!mounted || !authReady || !isAuthenticated) return;

    const fetchDefaults = async () => {
      try {
        const defaultAddr = await dispatch(fetchDefaultAddressService()).unwrap();
        setDefaultAddress(defaultAddr);
        if (defaultAddr?.id) {
          setCheckoutState((prev) => ({
            ...prev,
            selectedAddressId: defaultAddr.id,
          }));
        }
      } catch {}
    };

    fetchDefaults();
  }, [mounted, authReady, isAuthenticated, dispatch]);

  useEffect(() => {
    if (!mounted) return;
    dispatch(fetchPublicPaymentOptionsService({ businessId: AppDefault.BUSINESS_ID, pageNo: 1, pageSize: 15 }));
    dispatch(fetchPublicDeliveryOptionsService({ businessId: AppDefault.BUSINESS_ID, pageNo: 1, pageSize: 15, statuses: ["ACTIVE"] }));
  }, [mounted, dispatch]);

  useEffect(() => {
    if (deliveryOptions && deliveryOptions.length > 0 && !checkoutState.selectedDeliveryOptionId) {
      setCheckoutState((prev) => ({ ...prev, selectedDeliveryOptionId: deliveryOptions[0].id || null }));
    }
  }, [deliveryOptions, checkoutState.selectedDeliveryOptionId]);

  useEffect(() => {
    if (paymentOptions && paymentOptions.length > 0 && !checkoutState.selectedPaymentOptionId) {
      const cashOption = paymentOptions.find((opt) => opt.paymentOptionType === "CASH");
      const defaultOption = cashOption || paymentOptions[0];
      setCheckoutState((prev) => ({ ...prev, selectedPaymentOptionId: defaultOption.id || null }));
    }
  }, [paymentOptions, checkoutState.selectedPaymentOptionId]);

  useEffect(() => {
    if (orderContext.isTable) {
      setCheckoutState((prev) => ({
        ...prev,
        customerName: orderContext.tableName || "Table 01",
        customerPhone: prev.customerPhone || "Table Service",
      }));
    } else if (profile && mounted && authReady) {
      setCheckoutState((prev) => ({
        ...prev,
        customerName: prev.customerName || profile?.fullName || "",
        customerPhone: prev.customerPhone || profile?.phoneNumber || "",
        customerEmail: prev.customerEmail || profile?.email || "",
      }));
    }
  }, [orderContext.isTable, orderContext.tableName, profile, mounted, authReady]);

  const selectedAddress = useMemo(
    () => addresses?.find((addr: any) => addr.id === checkoutState.selectedAddressId) || defaultAddress,
    [addresses, checkoutState.selectedAddressId, defaultAddress]
  );

  const selectedDeliveryOption = useMemo(
    () => deliveryOptions?.find((opt: any) => opt.id === checkoutState.selectedDeliveryOptionId),
    [deliveryOptions, checkoutState.selectedDeliveryOptionId]
  );

  const selectedPaymentOption = useMemo(
    () => paymentOptions?.find((opt: any) => opt.id === checkoutState.selectedPaymentOptionId),
    [paymentOptions, checkoutState.selectedPaymentOptionId]
  );

  const deliveryFee = orderContext.isTable ? 0 : (selectedDeliveryOption?.price || 0);
  const orderTotal = finalTotal + deliveryFee;

  const handleQuantityChange = (productId: string, productSizeId: string | null, newQuantity: number) => {
    if (newQuantity < 0) return;
    dispatch(updateLocalCartItem({ productId, productSizeId, quantity: newQuantity }));
  };

  const canCheckout = useMemo(() => {
    if (items.length === 0) return false;
    if (orderContext.isTable) return true;
    if (!checkoutState.selectedPaymentOptionId) return false;
    if (!checkoutState.customerName.trim()) return false;
    if (!checkoutState.customerPhone.trim()) return false;
    if (isAuthenticated) return Boolean(checkoutState.selectedAddressId || defaultAddress);
    return true;
  }, [items.length, orderContext.isTable, checkoutState.selectedPaymentOptionId, checkoutState.customerName, checkoutState.customerPhone, isAuthenticated, checkoutState.selectedAddressId, defaultAddress]);

  const handleCheckout = async () => {
    if (!canCheckout) {
      showToast.error("Please fill in required fields to complete order.");
      return;
    }

    setCheckoutState((prev) => ({ ...prev, isProcessing: true }));

    try {
      const isValidUuid = (val?: string | null) =>
        Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

      const isValidIsoDate = (val?: string | null) =>
        Boolean(val && typeof val === "string" && val.trim() !== "" && !isNaN(Date.parse(val)));

      const rawPaymentMethod = String(selectedPaymentOption?.paymentOptionType || "CASH");
      const validPaymentMethod =
        rawPaymentMethod === "BANK" || rawPaymentMethod === "BANK_TRANSFER" ? "BANK" : "CASH";

      const validAddressId =
        !orderContext.isTable && isAuthenticated && isValidUuid(selectedAddress?.id)
          ? selectedAddress.id
          : undefined;

      const checkoutPayload: CheckoutPayload = {
        businessId: AppDefault.BUSINESS_ID,
        orderFrom: OrderFromEnum.CUSTOMER,
        addressId: validAddressId,
        deliveryOption: {
          name: orderContext.isTable ? "Table Dine-In Service" : (selectedDeliveryOption?.name || "Standard Delivery"),
          description: orderContext.isTable ? `Served to ${orderContext.tableName}` : (selectedDeliveryOption?.description || "Dine-in or direct delivery"),
          imageUrl: selectedDeliveryOption?.image?.sm || selectedDeliveryOption?.image?.md || "",
          price: deliveryFee,
        },
        customerName: orderContext.isTable ? orderContext.tableName : (checkoutState.customerName?.trim() || "Guest Customer"),
        customerPhone: orderContext.isTable ? (checkoutState.customerPhone?.trim() || "Table Service") : (checkoutState.customerPhone?.trim() || undefined),
        customerEmail: checkoutState.customerEmail?.trim() || undefined,
        cart: {
          businessId: AppDefault.BUSINESS_ID,
          businessName: "Default Business",
          items: items.map((item: any) => {
            const validItemUuid = isValidUuid(item.id) ? item.id : undefined;
            const validProductUuid = isValidUuid(item.productId) ? item.productId : item.productId;
            const validSizeUuid = isValidUuid(item.productSizeId) ? item.productSizeId : null;

            const sanitizedCustomizations = (item.customizations ?? [])
              .filter((c: any) => isValidUuid(c.productCustomizationId))
              .map((c: any) => ({
                productCustomizationId: c.productCustomizationId,
                name: c.name || "",
                priceAdjustment: Number(c.priceAdjustment ?? 0),
              }));

            return {
              id: validItemUuid,
              productId: validProductUuid,
              productName: item.productName || "Product Item",
              productImageUrl: item.productImageUrl || "",
              productSizeId: validSizeUuid,
              sizeName: item.sizeName || "",
              status: item.status || "ACTIVE",
              sku: item.sku || "",
              barcode: item.barcode || "",
              currentPrice: Number(item.currentPrice ?? 0),
              finalPrice: Number(item.finalPrice ?? 0),
              hasPromotion: Boolean(item.hasPromotion),
              promotionType: item.promotionType || undefined,
              promotionValue: item.promotionValue ? Number(item.promotionValue) : undefined,
              promotionFromDate: isValidIsoDate(item.promotionFromDate) ? item.promotionFromDate : undefined,
              promotionToDate: isValidIsoDate(item.promotionToDate) ? item.promotionToDate : undefined,
              quantity: Number(item.quantity ?? 1),
              totalBeforeDiscount: Number(item.totalBeforeDiscount ?? 0),
              discountAmount: Number(item.discountAmount ?? 0),
              totalPrice: Number(item.totalPrice ?? 0),
              customizations: sanitizedCustomizations,
            };
          }) as any,
          totalItems: items.length,
          totalQuantity: totalQuantity,
          subtotalBeforeDiscount: subtotal + discountAmount,
          subtotal: subtotal,
          customizationTotal: 0,
          totalDiscount: discountAmount,
          finalTotal: finalTotal,
        },
        pricing: {
          subtotal,
          deliveryFee,
          taxPercentage: 0,
          taxAmount: 0,
          discountAmount,
          finalTotal: orderTotal,
        },
        payment: {
          paymentMethod: validPaymentMethod as any,
          paymentStatus: "UNPAID" as const,
        },
        customerNote: orderContext.isTable
          ? checkoutState.customerNote ? `[${orderContext.tableName}] ${checkoutState.customerNote}` : `[${orderContext.tableName}]`
          : checkoutState.customerNote,
      };

      const orderResult = await dispatch(createOrderService(checkoutPayload)).unwrap();
      dispatch(resetCart());

      setSuccessOrder(orderResult);
      setSuccessModalOpen(true);
      showToast.success(Messages.orders.placed);
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
      showToast.error(axiosErr?.response?.data?.message || axiosErr?.message || "Failed to complete checkout.");
    } finally {
      setCheckoutState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  if (!mounted || !authReady || !cartLoaded) return <CheckoutSkeleton />;

  if (items.length === 0 && !successModalOpen && !successOrder) {
    return (
      <PageContainer className="min-h-screen flex flex-col py-8 sm:py-14">
        <PageState
          type="empty"
          title="Cart is Empty"
          description="Add items to your cart before checking out."
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
          title="Checkout"
          subtitle={`Review your details and place your order (${totalQuantity} total quantity)`}
          icon={CreditCard}
          count={items.length}
          countLabel="items"
          showBackButton={true}
          backHref="/cart"
        />

        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 space-y-3">
            {/* Table Service Card */}
            <CheckoutTableServiceCard
              orderContext={orderContext}
              itemsCount={items.length}
              totalQuantity={totalQuantity}
            />

            {/* Customer & Location Form Section */}
            <CheckoutCustomerSection
              orderContext={orderContext}
              isAuthenticated={isAuthenticated}
              selectedAddress={selectedAddress}
              defaultAddress={defaultAddress}
              selectedAddressId={checkoutState.selectedAddressId}
              onAddressSelect={(id) => setCheckoutState((prev) => ({ ...prev, selectedAddressId: id }))}
              customerName={checkoutState.customerName}
              customerPhone={checkoutState.customerPhone}
              customerNote={checkoutState.customerNote}
              onNameChange={(val) => setCheckoutState((prev) => ({ ...prev, customerName: val }))}
              onPhoneChange={(val) => setCheckoutState((prev) => ({ ...prev, customerPhone: val }))}
              onNoteChange={(val) => setCheckoutState((prev) => ({ ...prev, customerNote: val }))}
              onSignInClick={() => setLoginModalOpen(true)}
            />

            {/* Cart Items Summary List */}
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
                    onQuantityChange={(newQty) => handleQuantityChange(item.productId, item.productSizeId || null, newQty)}
                    onRemove={() => handleQuantityChange(item.productId, item.productSizeId || null, 0)}
                    showLink={false}
                    showControls={true}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Order Summary Section */}
          <div className="hidden lg:block lg:col-span-1">
            <CheckoutSummarySection
              orderContext={orderContext}
              itemsCount={items.length}
              totalQuantity={totalQuantity}
              subtotal={subtotal}
              discountAmount={discountAmount}
              deliveryFee={deliveryFee}
              orderTotal={orderTotal}
              selectedDeliveryOption={selectedDeliveryOption}
              selectedPaymentOption={selectedPaymentOption}
              selectedDeliveryOptionId={checkoutState.selectedDeliveryOptionId}
              selectedPaymentOptionId={checkoutState.selectedPaymentOptionId}
              onDeliveryChange={(id) => setCheckoutState((prev) => ({ ...prev, selectedDeliveryOptionId: id }))}
              onPaymentChange={(id) => setCheckoutState((prev) => ({ ...prev, selectedPaymentOptionId: id }))}
              isProcessing={checkoutState.isProcessing}
              canCheckout={canCheckout}
              onPlaceOrder={handleCheckout}
            />
          </div>
        </div>
      </PageContainer>

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />

      {successModalOpen && successOrder && (
        <OrderSuccessModal
          open={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          order={successOrder}
        />
      )}
    </div>
  );
}
