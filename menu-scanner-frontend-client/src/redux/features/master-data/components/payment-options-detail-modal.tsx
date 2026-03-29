"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { PaymentOptionResponse } from "../store/models/response/payment-option-response";

interface PaymentOptionDetailModalProps {
  paymentOption: PaymentOptionResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentOptionDetailModal({
  paymentOption,
  isOpen,
  onClose,
}: PaymentOptionDetailModalProps) {
  if (!paymentOption) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTitle className="sr-only">Payment Option Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No payment option data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Payment Option Details - {paymentOption.name}</DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground">
              Payment Option Details
            </h2>
            <p className="text-sm text-foreground mt-1">
              {paymentOption.name}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Payment Option Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Option Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="Payment Method Name" value={paymentOption.name || "-"} />
                  <DisplayField
                    label="Payment Type"
                    value={formatEnumValue(paymentOption.paymentOptionType) || "-"}
                  />
                  <DisplayField
                    label="Status"
                    value={formatEnumValue(paymentOption.status) || "-"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="Payment Option ID" value={paymentOption.id} />
                  <DisplayField label="Business ID" value={paymentOption.businessId} />
                  <DisplayField label="Created At" value={dateTimeFormat(paymentOption.createdAt ?? "")} />
                  <DisplayField label="Last Updated" value={dateTimeFormat(paymentOption.updatedAt ?? "")} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
