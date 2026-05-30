"use client";

import { useRef } from "react";
import { Download, Printer, Check, Clock, Package } from "lucide-react";
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
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Check className="h-10 w-10 text-white" strokeWidth={3} />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
              <p className="text-green-100 text-sm">Your order has been successfully created</p>
            </div>
          </div>
        </div>

        {/* Body - Order Details */}
        <div className="flex-1 overflow-y-auto">
          {/* Order Summary Card */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Order Number</div>
                <div className="text-2xl font-bold text-green-600">#{orderNumber}</div>
              </div>
              {orderId && (
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Order ID</div>
                  <div className="text-sm font-mono text-gray-700 truncate">{orderId}</div>
                </div>
              )}
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center border">
                <Package className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{itemCount || items.length}</div>
                <div className="text-xs text-gray-500">Items</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border">
                <Clock className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-900">{new Date().toLocaleTimeString()}</div>
                <div className="text-xs text-gray-500">Time</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border">
                <div className="text-xl font-bold text-green-600">${totalAmount.toFixed(2)}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="p-6">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Receipt Preview</h3>
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
              className="gap-2 h-11 border-2 hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              Print
            </CustomButton>
            <CustomButton
              onClick={handleDownloadPDF}
              className="gap-2 h-11 bg-blue-500 hover:bg-blue-600 text-white font-medium"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </CustomButton>
          </div>

          <CustomButton
            onClick={onClose}
            className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-semibold text-lg"
          >
            Done & Next Order
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
