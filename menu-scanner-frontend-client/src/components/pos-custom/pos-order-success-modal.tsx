"use client";

import { Download, Printer, Check } from "lucide-react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { useDownloadReceipt } from "@/hooks/use-download-receipt";
import { formatCurrency } from "@/utils/common/currency-format";

interface POSOrderSuccessModalProps {
  open: boolean;
  onClose: () => void;
  order: OrderResponse | null;
}

export function POSOrderSuccessModal({
  open,
  onClose,
  order,
}: POSOrderSuccessModalProps) {
  const { handleDownloadReceipt, handlePrintReceipt, downloadingOrderId, printingOrderId } = useDownloadReceipt();

  if (!order) return null;

  const isDownloading = downloadingOrderId === order.id;
  const isPrinting = printingOrderId === order.id;

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      size="sm"
      disableScrollWrapper={true}
    >
      {/* Centered Success Header */}
      <div className="flex flex-col items-center justify-center text-center p-6 pb-2">
        <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shadow-2xs border border-emerald-500/20 mb-4 animate-in zoom-in duration-300">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs">
            <Check className="h-6 w-6" strokeWidth={3} />
          </div>
        </div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Order Confirmed!</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
          Your order has been successfully created and sent to the kitchen.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="px-6 py-2 space-y-4">
        <div className="rounded-[12px] border border-border/80 bg-muted/20 p-4 space-y-3 text-xs shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-semibold">Order Number</span>
            <span className="font-mono font-bold text-foreground">#{order.orderNumber || ""}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-semibold">Payment Status</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
              PAID
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <span className="font-extrabold text-foreground">Total Paid</span>
            <span className="font-black text-primary text-base">
              {formatCurrency(order.pricing?.finalTotal || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 pt-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 w-full">
          <CustomButton
            onClick={() => handlePrintReceipt(order)}
            variant="outline"
            className="gap-2 h-9 text-xs font-bold rounded-[10px] border-border hover:bg-muted/50 transition-all duration-200"
            isLoading={isPrinting}
            icon={<Printer className="h-3.5 w-3.5" />}
          >
            {isPrinting ? "Printing..." : "Print Receipt"}
          </CustomButton>
          <CustomButton
            onClick={() => handleDownloadReceipt(order)}
            variant="outline"
            className="gap-2 h-9 text-xs font-bold rounded-[10px] border-border hover:bg-muted/50 transition-all duration-200"
            isLoading={isDownloading}
            icon={<Download className="h-3.5 w-3.5" />}
          >
            {isDownloading ? "Downloading..." : "Download PDF"}
          </CustomButton>
        </div>

        <CustomButton
          onClick={onClose}
          className="w-full h-10 text-xs font-extrabold bg-primary text-primary-foreground hover:bg-primary/90 rounded-[12px] shadow-sm hover:shadow transition-all duration-300"
        >
          Done & Next Order
        </CustomButton>
      </div>
    </CustomModal>
  );
}
