"use client";

import { useRef } from "react";
import { Download, Printer, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Receipt } from "./receipt";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
      <DialogContent className="w-full sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header - Success */}
        <div className="px-6 py-8 text-center border-b">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Order Confirmed!</h2>
              <p className="text-sm text-gray-600">Your order has been successfully created</p>
            </div>
          </div>
        </div>

        {/* Body - Order Details */}
        <div className="flex-1 overflow-y-auto">
          {/* Order Summary */}
          <div className="p-6 border-b">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order Number</span>
                <span className="text-lg font-semibold text-gray-900">#{orderNumber}</span>
              </div>
              {orderId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order ID</span>
                  <span className="text-sm font-mono text-gray-700 truncate max-w-xs">{orderId}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">Total Amount</span>
                <span className="text-xl font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Receipt</h3>
            </div>
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

        {/* Footer - Actions */}
        <div className="bg-white px-6 py-4 border-t space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <CustomButton
              onClick={handlePrint}
              variant="outline"
              className="gap-2 h-11"
            >
              <Printer className="h-4 w-4" />
              Print
            </CustomButton>
            <CustomButton
              onClick={handleDownloadPDF}
              variant="outline"
              className="gap-2 h-11"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </CustomButton>
          </div>

          <CustomButton
            onClick={onClose}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium"
          >
            Done & Next Order
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
