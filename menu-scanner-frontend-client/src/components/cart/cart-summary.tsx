"use client";

import { CreditCard, Loader2, ArrowRight, ShoppingBag, Utensils } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { OrderContext } from "@/utils/order/order-context";

interface CartSummaryProps {
  orderContext: OrderContext;
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  checkoutLoading: boolean;
  onCheckout: () => void;
  className?: string;
}

export function CartSummary({
  orderContext,
  totalItems,
  totalQuantity,
  subtotal,
  discountAmount,
  finalTotal,
  checkoutLoading,
  onCheckout,
  className = "",
}: CartSummaryProps) {
  return (
    <div className={`bg-gradient-to-b from-card via-card to-muted/20 border border-border/60 rounded-2xl p-4 shadow-sm space-y-3 ${className}`}>
      <h2 className="text-xs font-bold flex items-center justify-between pb-2 border-b border-border/40">
        <span className="flex items-center gap-1.5">
          <ShoppingBag className="h-3.5 w-3.5 text-primary" />
          Order Summary
        </span>
        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </h2>

      {orderContext.isTable && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate">{orderContext.tableName} (Dine-In)</span>
        </div>
      )}

      <div className="space-y-2.5 text-xs">
        <div className="bg-muted/40 rounded-xl p-2.5 border border-border/40 space-y-1">
          <div className="text-[11px] font-semibold text-muted-foreground">Items Breakdown</div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-foreground">{totalItems} unique {totalItems === 1 ? "product" : "products"}</span>
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

        <div className="flex justify-between items-center pt-2 border-t border-border/40">
          <span className="text-muted-foreground">Shipping &amp; Fees</span>
          <span className="text-[11px] text-muted-foreground font-medium">
            {orderContext.isTable ? "$0.00 (Table Service)" : "Calculated at checkout"}
          </span>
        </div>

        <div className="bg-primary/10 rounded-xl p-3 border border-primary/25 shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-foreground">Total Amount</span>
            <span className="text-base font-extrabold text-primary">{formatCurrency(finalTotal)}</span>
          </div>
        </div>
      </div>

      <CustomButton
        variant="default"
        size="default"
        className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 shadow-xs hover:shadow-md transition-all cursor-pointer"
        onClick={onCheckout}
        disabled={checkoutLoading}
      >
        {checkoutLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
        {checkoutLoading ? "Preparing Checkout..." : orderContext.isTable ? "Proceed to Table Checkout" : "Proceed to Checkout"}
        {!checkoutLoading && <ArrowRight className="h-3.5 w-3.5 ml-auto" />}
      </CustomButton>
    </div>
  );
}
