"use client";

import { useEffect, useState } from "react";
import { Receipt, AlertCircle } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "./custom-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/common/currency-format";
import { ComboboxSelectPayment } from "@/components/shared/combobox/combobox-select-payment-option";

export type PaymentMethodType = string;

export interface PaymentOptionItem {
  id: string;
  name: string;
  paymentOptionType?: string;
  [key: string]: unknown;
}

interface SettleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettle: (paymentMethod: PaymentMethodType) => Promise<void>;
  title?: string;
  tableNumber?: string;
  sessionNumber?: string;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  grandTotal?: number;
  isSubmitting?: boolean;
}

export function SettleConfirmationModal({
  isOpen,
  onClose,
  onSettle,
  title = "Final Checkout & Settle Bill",
  tableNumber,
  sessionNumber,
  subtotal = 0,
  taxRate = 0,
  taxAmount = 0,
  grandTotal = 0,
  isSubmitting = false,
}: SettleConfirmationModalProps) {
  const [selectedPaymentObj, setSelectedPaymentObj] = useState<PaymentOptionItem | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSettling(false);
      setSelectedPaymentObj(null);
    }
  }, [isOpen]);

  const handleSettle = async () => {
    try {
      setError(null);
      setIsSettling(true);
      const targetMethod =
        selectedPaymentObj?.paymentOptionType ||
        selectedPaymentObj?.name ||
        selectedPaymentObj?.id ||
        "CASH";
      await onSettle(targetMethod);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsSettling(false);
    }
  };

  const inFlight = isSettling || isSubmitting;
  const cleanSessionNum = sessionNumber?.replace(/^(SESS-?|Session\s*)/i, "") || "";
  const displayTable = tableNumber?.startsWith("Table ") ? tableNumber : `Table ${tableNumber || ""}`;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 p-4 px-5 border-b border-border/60 bg-gradient-to-r from-background via-card to-background shrink-0">
        <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 shadow-2xs">
          <Receipt className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base text-foreground leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">Finalize table session & register payment</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-4 px-5 space-y-3.5 bg-card/40">
        {/* Table & Session Summary */}
        <div className="p-3 bg-muted/40 rounded-2xl border border-border/60 flex items-center justify-between text-xs font-semibold">
          <span className="text-foreground font-bold">{displayTable}</span>
          <span className="font-mono text-muted-foreground">Session #{cleanSessionNum}</span>
        </div>

        {/* Payment Method Combobox */}
        <div className="space-y-1">
          <ComboboxSelectPayment
            dataSelect={selectedPaymentObj as any}
            onChangeSelected={(item) => setSelectedPaymentObj(item as any)}
            label="Select Payment Method"
            placeholder="Select payment method..."
            disabled={inFlight}
          />
        </div>

        {/* Pricing Breakdown */}
        <div className="p-3.5 bg-card rounded-2xl border border-border/70 space-y-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground font-medium">
            <span>Subtotal</span>
            <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground font-medium">
            <span>Tax / VAT ({taxRate}%)</span>
            <span className="font-semibold text-foreground">+{formatCurrency(taxAmount)}</span>
          </div>
          <div className="pt-2 border-t border-border/50 flex justify-between items-center font-extrabold text-sm">
            <span className="text-foreground">Total Due</span>
            <span className="text-primary font-black text-base">{formatCurrency(grandTotal || subtotal + taxAmount)}</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="py-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex gap-2 justify-end border-t pt-3 px-4 pb-3 bg-background sticky bottom-0 border-border/80">
        <CustomButton
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={inFlight}
        >
          Cancel
        </CustomButton>
        <CustomButton
          type="button"
          variant="default"
          onClick={handleSettle}
          disabled={inFlight}
          isLoading={inFlight}
        >
          {inFlight ? "Settling..." : `Pay ${formatCurrency(grandTotal || subtotal + taxAmount)}`}
        </CustomButton>
      </div>
    </CustomModal>
  );
}
