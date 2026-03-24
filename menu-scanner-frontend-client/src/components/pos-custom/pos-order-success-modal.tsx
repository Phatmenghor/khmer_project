"use client";

import { CheckCircle2, Printer, RotateCcw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";

interface POSOrderSuccessModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
  totalAmount: number;
}

export function POSOrderSuccessModal({
  open,
  onClose,
  orderNumber,
  totalAmount,
}: POSOrderSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-[480px] p-0 gap-0">
        {/* Success Content */}
        <div className="p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-200 rounded-full animate-pulse" />
              <div className="relative bg-green-100 rounded-full p-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Order Confirmed!</h2>
            <p className="text-sm text-muted-foreground">Your order has been successfully created</p>
          </div>

          {/* Order Details */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
            {/* Order Number */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Order Number
              </p>
              <p className="text-lg font-mono font-bold text-slate-900">
                #{orderNumber}
              </p>
            </div>

            {/* Total Amount */}
            <div className="border-t border-slate-200 pt-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Amount
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-900">
              Order details have been sent to the customer. You can print the receipt or create a new order.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <CustomButton
              className="w-full bg-primary hover:bg-primary/90"
              onClick={onClose}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Order
            </CustomButton>
            <CustomButton
              variant="outline"
              className="w-full"
              onClick={() => {
                window.print();
              }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </CustomButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
