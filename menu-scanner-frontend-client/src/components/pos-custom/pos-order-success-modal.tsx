"use client";

import { Download, Printer, Check } from "lucide-react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
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
      size="md"
      disableScrollWrapper={true}
    >
      <FormHeader
        title="Order Confirmed!"
        description={`Your order #${order.orderNumber || ''} has been successfully created.`}
        isCreate={true}
      />

      <FormBody className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-[10px]">
          <div className="w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <Check className="h-5 w-5" strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Order Placed Successfully</h3>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Order reference #{order.orderNumber}</p>
          </div>
        </div>

        <div className="rounded-[10px] border border-border/80 bg-muted/20 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Order Number</span>
            <span className="font-bold text-foreground">#{order.orderNumber}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <span className="font-extrabold text-foreground">Total Amount</span>
            <span className="font-black text-primary text-sm">
              {formatCurrency(order.pricing?.finalTotal || 0)}
            </span>
          </div>
        </div>
      </FormBody>

      <FormFooter
        isSubmitting={false}
        isDirty={true}
        isCreate={false}
      >
        <div className="w-full flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 w-full">
            <CustomButton
              onClick={() => handlePrintReceipt(order)}
              variant="outline"
              className="gap-1.5 h-8 text-xs font-bold"
              isLoading={isPrinting}
              icon={<Printer className="h-3.5 w-3.5" />}
            >
              {isPrinting ? "Printing..." : "Print Receipt"}
            </CustomButton>
            <CustomButton
              onClick={() => handleDownloadReceipt(order)}
              variant="outline"
              className="gap-1.5 h-8 text-xs font-bold"
              isLoading={isDownloading}
              icon={<Download className="h-3.5 w-3.5" />}
            >
              {isDownloading ? "Downloading..." : "Download PDF"}
            </CustomButton>
          </div>

          <CustomButton
            onClick={onClose}
            className="w-full h-9 text-xs font-extrabold bg-primary text-primary-foreground hover:bg-primary/90 rounded-[8px]"
          >
            Done & Next Order
          </CustomButton>
        </div>
      </FormFooter>
    </CustomModal>
  );
}
