"use client";

import { Download, Printer, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSelector } from "react-redux";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { RootState } from "@/store";
import { useDownloadReceipt } from "@/hooks/use-download-receipt";

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
  const businessSettings = useSelector((state: RootState) =>
    selectBusinessSettings(state)
  );
  const primaryColor = businessSettings?.primaryColor || "#000000";

  const { handleDownloadReceipt, handlePrintReceipt, downloadingOrderId, printingOrderId } = useDownloadReceipt();

  if (!order) return null;

  const isDownloading = downloadingOrderId === order.id;
  const isPrinting = printingOrderId === order.id;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <VisuallyHidden>
        <DialogTitle>Order Success</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="h-6 w-6 text-green-600" strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">Order Confirmed!</h2>
              <p className="text-sm text-foreground mt-1">Your order has been successfully created</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Order Number</span>
                  <span className="text-base font-semibold">#{order.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm font-medium text-foreground">Total Amount</span>
                  <span className="text-lg font-semibold text-foreground">${order.pricing?.finalTotal?.toFixed(2) ?? "0.00"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-6 py-4 border-t space-y-3 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <CustomButton
              onClick={() => handlePrintReceipt(order)}
              variant="outline"
              className="gap-2 h-10"
              isLoading={isPrinting}
            >
              <Printer className="h-4 w-4" />
              {isPrinting ? "Printing..." : "Print"}
            </CustomButton>
            <CustomButton
              onClick={() => handleDownloadReceipt(order)}
              variant="outline"
              className="gap-2 h-10"
              isLoading={isDownloading}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download PDF"}
            </CustomButton>
          </div>

          <CustomButton
            onClick={onClose}
            style={{ backgroundColor: primaryColor, color: "white" }}
            className="w-full h-11 font-medium hover:opacity-90"
          >
            Done & Next Order
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
