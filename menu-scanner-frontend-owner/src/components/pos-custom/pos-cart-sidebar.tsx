"use client";

import React from "react";
import {
  ShoppingCart,
  Trash2,
  X,
  Tag,
  ReceiptText,
  Loader2,
} from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/utils/common/currency-format";
import { POSCartItem } from "@/components/pos-custom/pos-cart-item";
import { ComboboxSelectDelivery } from "@/components/shared/combobox/combobox-select-delivery-option";
import { ComboboxSelectPayment } from "@/components/shared/combobox/combobox-select-payment-option";
import { AppDefault } from "@/constants/app-resource/default/default";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import {
  setSelectedDeliveryOption,
  setSelectedPaymentOption,
  setShowCart,
  setShowOrderDetailsModal,
} from "@/features/business/store/slice/pos-page-slice";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";

interface POSCartSidebarProps {
  showCart: boolean;
  cartItems: PosPageCartItem[];
  cartSummary: {
    subtotal: number;
    customizationTotal: number;
    deliveryFee: number;
    taxPercentage: number;
    taxAmount: number;
    discountAmount: number;
    finalTotal: number;
    totalQuantity: number;
  };
  selectedDeliveryOption: any;
  selectedPaymentOption: any;
  isSubmitting: boolean;
  clearCart: () => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  handleEditPriceItem: (item: PosPageCartItem) => void;
  handleSubmitOrder: () => void;
}

export function POSCartSidebar({
  showCart,
  cartItems,
  cartSummary,
  selectedDeliveryOption,
  selectedPaymentOption,
  isSubmitting,
  clearCart,
  updateQuantity,
  removeItem,
  handleEditPriceItem,
  handleSubmitOrder,
}: POSCartSidebarProps) {
  const dispatch = useAppDispatch();

  return (
    <div
      className={cn(
        "w-full md:w-[310px] lg:w-[340px] xl:w-[365px] max-md:border-t md:border-l border-border h-full flex flex-col justify-between bg-card shrink-0 overflow-hidden",
        showCart ? "flex fixed inset-0 z-50 md:relative md:z-auto bg-background" : "hidden md:flex"
      )}
    >
      {/* Order Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <ShoppingCart className="w-4 h-4 text-primary" />
          <div>
            <h2 className="font-extrabold text-xs sm:text-sm text-foreground">Current Order</h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} · {cartSummary.totalQuantity} total qty
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cartItems.length > 0 && (
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-[11px] sm:text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-7.5 rounded-[6px] gap-1 px-2.5 font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </CustomButton>
          )}
          <CustomButton
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => dispatch(setShowCart(false))}
          >
            <X className="w-4 h-4" />
          </CustomButton>
        </div>
      </div>

      {/* Cart Item Scroll List */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 h-full">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground flex-1 px-4 my-auto">
            <div className="p-4 rounded-full bg-muted/40 mb-3">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-foreground">Your order is empty</p>
            <p className="text-[11px] sm:text-xs mt-1 text-center text-muted-foreground max-w-[240px] leading-relaxed font-medium">
              Click on products from the grid to add items to your cart
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0 h-full">
            <div className="space-y-3 p-3">
              {cartItems.map((item) => (
                <POSCartItem
                  key={item.id}
                  id={item.id}
                  productName={item.productName}
                  productImageUrl={item.productImageUrl}
                  sizeName={item.sizeName}
                  currentPrice={item.currentPrice}
                  finalPrice={item.finalPrice}
                  quantity={item.quantity}
                  hasPromotion={item.hasPromotion}
                  promotionType={item.promotionType}
                  promotionValue={item.promotionValue}
                  customizations={item.customizations}
                  onQuantityChange={(delta) => updateQuantity(item.id, delta)}
                  onRemove={() => removeItem(item.id)}
                  onEdit={() => handleEditPriceItem(item)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Checkout & Pricing Controls Footer - Fixed to Bottom */}
      <div className="mt-auto border-t border-border bg-card shrink-0 shadow-lg">
        <div className="p-3 space-y-2.5">
          {/* Delivery & Payment Dropdowns */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="min-w-0">
              <ComboboxSelectDelivery
                dataSelect={selectedDeliveryOption as any}
                onChangeSelected={(item) => dispatch(setSelectedDeliveryOption(item as any))}
                placeholder="Select Delivery..."
                label="Delivery"
                businessId={AppDefault.BUSINESS_ID}
                statuses={["ACTIVE"]}
              />
            </div>
            <div className="min-w-0">
              <ComboboxSelectPayment
                dataSelect={selectedPaymentOption as any}
                onChangeSelected={(item) => dispatch(setSelectedPaymentOption(item as any))}
                placeholder="Select Payment..."
                label="Payment"
                statuses={["ACTIVE"]}
              />
            </div>
          </div>

          {/* Pricing Breakdown Summary Card */}
          <div className="rounded-[10px] border border-border/80 bg-muted/20 p-2.5 space-y-1">
            <div className="flex justify-between items-center text-[11px] sm:text-xs">
              <span className="text-muted-foreground font-semibold">
                Subtotal ({cartSummary.totalQuantity} {cartSummary.totalQuantity === 1 ? "item" : "items"})
              </span>
              <span className="font-bold text-foreground">{formatCurrency(cartSummary.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] sm:text-xs">
              <span className="text-muted-foreground font-semibold">Delivery Fee</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {cartSummary.deliveryFee > 0 ? `+${formatCurrency(cartSummary.deliveryFee)}` : "Free"}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] sm:text-xs">
              <span className="text-muted-foreground font-semibold flex items-center gap-1">
                Tax <span className="text-[10px] bg-muted/70 px-1 py-0.2 rounded font-bold border border-border/60">{cartSummary.taxPercentage}%</span>
              </span>
              <span className="font-bold text-foreground">{formatCurrency(cartSummary.taxAmount)}</span>
            </div>
            {cartSummary.discountAmount > 0 && (
              <div className="flex justify-between items-center text-[11px] sm:text-xs py-0.5">
                <span className="text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1">
                  Discount
                </span>
                <span className="text-red-600 dark:text-red-400 font-black">-{formatCurrency(cartSummary.discountAmount)}</span>
              </div>
            )}
            <Separator className="my-1 bg-border/80" />
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-xs font-black text-foreground">Total Amount</span>
              <span className="text-base sm:text-lg font-black text-primary">
                {formatCurrency(cartSummary.finalTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Action Submit Bar */}
        <div className="px-3 pb-3">
          <div className="rounded-[10px] overflow-hidden border border-border shadow-xs flex items-stretch bg-background h-9">
            <CustomButton
              variant="ghost"
              size="sm"
              className="h-full px-3 gap-1.5 text-xs font-bold border-r border-border hover:bg-muted/60 shrink-0"
              onClick={() => dispatch(setShowOrderDetailsModal(true))}
              title="Add order notes & discount"
            >
              <Tag className="w-3.5 h-3.5 text-primary" />
            </CustomButton>
            <div className="flex-1 px-2.5 py-0.5 bg-muted/20 min-w-0 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground font-bold truncate">
                {cartSummary.totalQuantity} {cartSummary.totalQuantity === 1 ? "item" : "items"}
              </p>
              <p className="text-xs sm:text-sm font-black text-primary leading-none">
                {formatCurrency(cartSummary.finalTotal)}
              </p>
            </div>
            <CustomButton
              variant="unstyled"
              size="unstyled"
              onClick={handleSubmitOrder}
              disabled={cartItems.length === 0 || isSubmitting}
              className={cn(
                "flex items-center justify-center px-4 gap-1.5 transition-all shrink-0 font-black h-full",
                cartItems.length === 0 || isSubmitting
                  ? "bg-muted text-muted-foreground cursor-not-allowed text-xs"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 cursor-pointer text-xs shadow-xs"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ReceiptText className="w-3.5 h-3.5" />
              )}
              <span className="text-xs font-extrabold whitespace-nowrap">
                {isSubmitting ? "Processing..." : "Place Order"}
              </span>
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}
