"use client";

import { useRef } from "react";
import { Download, Printer, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Receipt } from "./receipt";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSelector } from "react-redux";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { RootState } from "@/store";

interface POSOrderSuccessModalProps {
  open: boolean;
  onClose: () => void;
  orderId?: string;
  orderNumber: string;
  totalAmount: number;
  items?: PosPageCartItem[];
  itemCount?: number;
  orderData?: {
    date: Date;
    businessName: string;
    subtotalWithAddons: number;
    discountAmount: number;
    subtotalAfterDiscount: number;
    taxAmount: number;
    deliveryFee: number;
    paymentMethod: string;
  };
}

export function POSOrderSuccessModal({
  open,
  onClose,
  orderId,
  orderNumber,
  totalAmount,
  items = [],
  itemCount = 0,
  orderData,
}: POSOrderSuccessModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const businessSettings = useSelector((state: RootState) =>
    selectBusinessSettings(state)
  );
  const primaryColor = businessSettings?.primaryColor || "#000000";

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "", "width=400,height=600");
      if (printWindow) {
        printWindow.document.write(receiptRef.current.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (receiptRef.current) {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const jsPDF = (await import("jspdf")).jsPDF;

        const canvas = await html2canvas(receiptRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
        });

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [80, 210] as [number, number],
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 80;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(`receipt-${orderNumber}.pdf`);
      } catch (error) {
        console.error("Failed to generate PDF:", error);
      }
    }
  };

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
            {/* Order Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Order Number</span>
                  <span className="text-base font-semibold">#{orderNumber}</span>
                </div>
                {orderId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Order ID</span>
                    <span className="text-sm font-mono text-foreground truncate max-w-xs">{orderId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm font-medium text-foreground">Total Amount</span>
                  <span className="text-lg font-semibold text-foreground">${totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Receipt Preview Card */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Receipt Preview</h3>
              <div
                ref={receiptRef}
                className="bg-white rounded-lg shadow-sm border overflow-hidden"
              >
                {orderData && (
                  <Receipt
                    orderNumber={orderNumber}
                    date={orderData.date}
                    businessName={orderData.businessName}
                    items={items}
                    subtotalWithAddons={orderData.subtotalWithAddons}
                    discountAmount={orderData.discountAmount}
                    subtotalAfterDiscount={orderData.subtotalAfterDiscount}
                    taxAmount={orderData.taxAmount}
                    deliveryFee={orderData.deliveryFee}
                    totalAmount={totalAmount}
                    paymentMethod={orderData.paymentMethod}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-6 py-4 border-t space-y-3 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <CustomButton
              onClick={handlePrint}
              variant="outline"
              className="gap-2 h-10"
            >
              <Printer className="h-4 w-4" />
              Print
            </CustomButton>
            <CustomButton
              onClick={handleDownloadPDF}
              variant="outline"
              className="gap-2 h-10"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </CustomButton>
          </div>

          <CustomButton
            onClick={onClose}
            style={{
              backgroundColor: primaryColor,
              color: "white"
            }}
            className="w-full h-11 font-medium hover:opacity-90"
          >
            Done & Next Order
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
