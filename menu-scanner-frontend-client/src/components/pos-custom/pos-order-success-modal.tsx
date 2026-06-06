"use client";

import { Download, Printer, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { useAppSelector } from "@/store";
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
  const businessSettings = useAppSelector(selectBusinessSettings);
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
      <DialogContent className="w-full sm:max-w-lg max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="h-4 w-4 text-green-600" strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-semibold text-foreground">Order Confirmed!</h2>
              <p className="text-xs text-foreground mt-1">Your order has been successfully created</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2.5 space-y-3">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Order Number</span>
                  <span className="text-xs font-semibold">#{order.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs font-medium text-foreground">Total Amount</span>
                  <span className="text-xs font-semibold text-foreground">${order.pricing?.finalTotal?.toFixed(2) ?? "0.00"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-4 py-3 border-t space-y-2 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <CustomButton
              onClick={() => handlePrintReceipt(order)}
              variant="outline"
              className="gap-1 h-6"
              isLoading={isPrinting}
              icon={<Printer className="h-3 w-3" />}
            >
              {isPrinting ? "Printing..." : "Print"}
            </CustomButton>
            <CustomButton
              onClick={() => handleDownloadReceipt(order)}
              variant="outline"
              className="gap-1 h-6"
              isLoading={isDownloading}
              icon={<Download className="h-3 w-3" />}
            >
              {isDownloading ? "Downloading..." : "Download PDF"}
            </CustomButton>
          </div>

          <CustomButton
            onClick={onClose}
            style={{ backgroundColor: primaryColor, color: "white" }}
            className="w-full h-6 font-medium hover:opacity-90"
          >
            Done & Next Order
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
