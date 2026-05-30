"use client";

import { useRef } from "react";
import { Download, Printer, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Receipt } from "./receipt";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";

interface POSOrderSuccessModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
  totalAmount: number;
  items?: PosPageCartItem[];
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
  orderNumber,
  totalAmount,
  items = [],
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
        // Dynamic import to avoid build issues
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
      <DialogContent className="w-full sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Check className="h-8 w-8 text-white" strokeWidth={3} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Order Confirmed!</h2>
              <p className="text-green-100">Your order has been successfully created</p>
            </div>
          </div>
        </div>

        {/* Order Number */}
        <div className="bg-green-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Order Number</span>
            <span className="text-2xl font-bold text-green-600">#{orderNumber}</span>
          </div>
        </div>

        {/* Receipt Preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div
            ref={receiptRef}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
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

        {/* Total Amount */}
        <div className="bg-white px-6 py-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total Amount</span>
            <span className="text-3xl font-bold text-primary">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
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
              className="gap-2 h-11 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </CustomButton>
          </div>

          <CustomButton
            onClick={onClose}
            className="w-full h-11 bg-green-500 hover:bg-green-600 text-white"
          >
            Done
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
