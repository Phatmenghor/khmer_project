"use client";

import { Receipt, Truck, Wallet, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { ComboboxSelectDelivery } from "@/components/shared/combobox/combobox-select-delivery-option";
import { ComboboxSelectPaymentPublic } from "@/components/shared/combobox/combobox-select-payment-public";
import { formatCurrency } from "@/utils/common/currency-format";
import { OrderContext } from "@/utils/order/order-context";
import { AppDefault } from "@/constants/app-resource/default/default";

interface CheckoutSummarySectionProps {
  orderContext: OrderContext;
  itemsCount: number;
  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  orderTotal: number;
  selectedDeliveryOption: any;
  selectedPaymentOption: any;
  selectedDeliveryOptionId: string | null;
  selectedPaymentOptionId: string | null;
  onDeliveryChange: (id: string | null) => void;
  onPaymentChange: (id: string | null) => void;
  isProcessing: boolean;
  canCheckout: boolean;
  onPlaceOrder: () => void;
}

export function CheckoutSummarySection({
  orderContext,
  itemsCount,
  totalQuantity,
  subtotal,
  discountAmount,
  deliveryFee,
  orderTotal,
  selectedDeliveryOption,
  selectedPaymentOption,
  selectedDeliveryOptionId,
  selectedPaymentOptionId,
  onDeliveryChange,
  onPaymentChange,
  isProcessing,
  canCheckout,
  onPlaceOrder,
}: CheckoutSummarySectionProps) {
  return (
    <div className="bg-gradient-to-b from-card via-card to-muted/20 border border-border/60 rounded-2xl p-4 sticky top-16 shadow-sm space-y-3">
      <h2 className="text-xs font-bold flex items-center justify-between pb-2 border-b border-border/40">
        <span className="flex items-center gap-1.5">
          <Receipt className="h-3.5 w-3.5 text-primary" />
          Order Summary
        </span>
        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          {itemsCount} {itemsCount === 1 ? "item" : "items"}
        </span>
      </h2>

      {/* Delivery & Payment Selection Grid (Hidden for Table Orders) */}
      {!orderContext.isTable && (
        <div className="grid grid-cols-1 gap-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-foreground leading-tight flex items-center gap-1 min-h-[16px]">
              <Truck className="h-3 w-3 text-primary" />
              <span>Delivery Option</span>
              <span className="text-destructive">*</span>
            </label>
            <ComboboxSelectDelivery
              dataSelect={selectedDeliveryOption as any}
              onChangeSelected={(item) => onDeliveryChange(item ? item.id : null)}
              placeholder="Select delivery..."
              error={!selectedDeliveryOptionId ? "Please select delivery option" : ""}
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
              onChangeSelected={(item) => onPaymentChange(item ? item.id : null)}
              placeholder="Select payment..."
              error={!selectedPaymentOptionId ? "Please select payment method" : ""}
              label=""
              businessId={AppDefault.BUSINESS_ID}
              statuses={["ACTIVE"]}
            />
          </div>
        </div>
      )}

      {/* Pricing Breakdown matching Cart Page */}
      <div className="space-y-2 text-xs pt-1 border-t border-border/40">
        <div className="bg-muted/40 rounded-xl p-2.5 border border-border/40 space-y-1">
          <div className="text-[11px] font-semibold text-muted-foreground">Items Breakdown</div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-foreground">{itemsCount} unique {itemsCount === 1 ? "product" : "products"}</span>
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

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span className="font-bold text-foreground">
            {orderContext.isTable ? "$0.00 (Table)" : formatCurrency(deliveryFee)}
          </span>
        </div>

        <div className="bg-primary/10 rounded-xl p-3 border border-primary/25 shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-foreground">Order Total</span>
            <span className="text-base font-extrabold text-primary">{formatCurrency(orderTotal)}</span>
          </div>
        </div>
      </div>

      <CustomButton
        variant="default"
        size="default"
        className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs py-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
        onClick={onPlaceOrder}
        disabled={isProcessing || !canCheckout}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending Order...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            <span>{orderContext.isTable ? "Send Table Order to Kitchen" : "Place Order Now"}</span>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </>
        )}
      </CustomButton>
    </div>
  );
}
