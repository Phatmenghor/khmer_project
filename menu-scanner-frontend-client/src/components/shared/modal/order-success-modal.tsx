"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Printer, Check, Copy, CheckCheck } from "lucide-react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { useDownloadReceipt } from "@/hooks/use-download-receipt";
import { formatCurrency } from "@/utils/common/currency-format";
import { showToast } from "@/components/shared/common/show-toast";

interface OrderSuccessModalProps {
  open: boolean;
  onClose: () => void;
  order: OrderResponse | null;
}

export function OrderSuccessModal({
  open,
  onClose,
  order,
}: OrderSuccessModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const {
    handleDownloadReceipt,
    handlePrintReceipt,
    downloadingOrderId,
    printingOrderId,
  } = useDownloadReceipt();

  if (!order) return null;

  const isDownloading = downloadingOrderId === order.id;
  const isPrinting = printingOrderId === order.id;
  const orderNumber = order.orderNumber || order.id?.slice(0, 8).toUpperCase() || "";
  const isPaid = order.payment?.paymentStatus === "PAID";
  const itemsCount = order.items?.length || 0;

  const handleCopyOrderNumber = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    showToast.success("Order number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrackOrder = () => {
    onClose();
    if (order.id) {
      router.push(`/orders/${order.id}`);
    } else {
      router.push("/orders");
    }
  };

  const handleContinueShopping = () => {
    onClose();
    router.push("/products");
  };

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      size="sm"
      disableScrollWrapper={true}
    >
      {/* Centered Success Header — POS Style */}
      <div className="flex flex-col items-center justify-center text-center p-6 pb-2">
        <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shadow-2xs border border-emerald-500/20 mb-4 animate-in zoom-in duration-300">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs">
            <Check className="h-6 w-6" strokeWidth={3} />
          </div>
        </div>
        <DialogTitle className="text-lg font-black text-foreground tracking-tight">
          Order Placed Successfully!
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
          Your order has been successfully created and sent to the store.
        </DialogDescription>
      </div>

      {/* Order Details Card — POS Style */}
      <div className="px-6 py-2 space-y-4">
        <div className="rounded-[12px] border border-border/80 bg-muted/20 p-4 space-y-3 text-xs shadow-3xs">
          {/* Order Number */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-semibold">Order Number</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-foreground">#{orderNumber}</span>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5"
                title="Copy order number"
              >
                {copied ? (
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-semibold">Payment Status</span>
            <span
              className={
                isPaid
                  ? "px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20"
                  : "px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20"
              }
            >
              {order.payment?.paymentStatus || "UNPAID"}
            </span>
          </div>

          {/* Payment Method */}
          {order.payment?.paymentMethod && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">Payment Method</span>
              <span className="font-bold text-foreground">{order.payment.paymentMethod}</span>
            </div>
          )}

          {/* Items Count */}
          {itemsCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">Total Items</span>
              <span className="font-bold text-foreground">
                {itemsCount} {itemsCount === 1 ? "item" : "items"}
              </span>
            </div>
          )}

          {/* Grand Total */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <span className="font-extrabold text-foreground">Total Amount</span>
            <span className="font-black text-primary text-base">
              {formatCurrency(order.pricing?.finalTotal || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons — Unified Standard Height (h-10) */}
      <div className="p-5 pt-3.5 flex flex-col gap-2.5">
        {/* Receipt Action Buttons (Print & Download PDF) */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          <CustomButton
            onClick={() => handlePrintReceipt(order)}
            variant="outline"
            className="gap-2 h-10 text-xs font-bold rounded-xl border-border/80 hover:bg-muted/50 transition-all duration-200 cursor-pointer"
            isLoading={isPrinting}
            icon={<Printer className="h-3.5 w-3.5" />}
          >
            {isPrinting ? "Printing..." : "Print Receipt"}
          </CustomButton>
          <CustomButton
            onClick={() => handleDownloadReceipt(order)}
            variant="outline"
            className="gap-2 h-10 text-xs font-bold rounded-xl border-border/80 hover:bg-muted/50 transition-all duration-200 cursor-pointer"
            isLoading={isDownloading}
            icon={<Download className="h-3.5 w-3.5" />}
          >
            {isDownloading ? "Downloading..." : "Download PDF"}
          </CustomButton>
        </div>

        {/* Primary CTA: Track Live Order */}
        <CustomButton
          onClick={handleTrackOrder}
          className="w-full h-10 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-xs hover:shadow transition-all duration-300 cursor-pointer"
        >
          Track Live Order Status
        </CustomButton>

        {/* Secondary CTA: Continue Shopping */}
        <CustomButton
          onClick={handleContinueShopping}
          variant="ghost"
          className="w-full h-10 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl transition-all duration-200 cursor-pointer"
        >
          Continue Shopping
        </CustomButton>
      </div>
    </CustomModal>
  );
}
