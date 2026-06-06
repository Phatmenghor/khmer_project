"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { PaymentOptionResponse } from "../store/models/response/payment-option-response";
import { cn } from "@/lib/utils";
import { CreditCard } from "lucide-react";

interface PaymentOptionDetailModalProps {
  paymentOption: PaymentOptionResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <h3 className="text-xs font-bold text-foreground">{children}</h3>
    </div>
  );
}

function InfoRow({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", fullWidth && "col-span-2")}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground break-words">{value || "-"}</span>
    </div>
  );
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
        <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No payment option data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isActive = paymentOption.status === "ACTIVE";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Payment Option Details - {paymentOption.name}</DialogTitle>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted border border-border/50 flex items-center justify-center">
            {paymentOption.imageUrl ? (
              <img src={paymentOption.imageUrl} alt={paymentOption.name} className="w-full h-full object-cover" />
            ) : (
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Payment Options</p>
            <p className="text-xs text-muted-foreground mt-0.5">Manage payment methods for your business</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-3">
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Payment Option Information</SectionTitle>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <InfoRow label="Payment Method Name" value={paymentOption.name} />
                  <InfoRow
                    label="Status"
                    value={
                      <span className={cn("font-semibold", isActive ? "text-green-700" : "text-gray-500")}>
                        {paymentOption.status ? formatEnumValue(paymentOption.status) : "-"}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Type"
                    value={paymentOption.paymentOptionType ? formatEnumValue(paymentOption.paymentOptionType) : "-"}
                  />
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-3">
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>System Info</SectionTitle>
                <div className="space-y-2.5">
                  <InfoRow label="Created At" value={dateTimeFormat(paymentOption.createdAt ?? "")} />
                  <InfoRow label="Last Updated" value={dateTimeFormat(paymentOption.updatedAt ?? "")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
