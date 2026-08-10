"use client";

import React, { useEffect, useState } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton, SubmitButton, CustomButton } from "@/components/shared/button/custom-button";
import { CustomSelect, SelectOption } from "@/components/shared/common/custom-select";
import { formatCurrency } from "@/utils/common/currency-format";
import { Clock, QrCode, AlertCircle, Copy, Check, Building2, ShieldCheck, RefreshCw } from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { cn } from "@/lib/utils";

interface BankQrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (status: "PAID" | "UNPAID") => Promise<void>;
  paymentOptionName: string;
  paymentOptionDescription?: string;
  qrImageUrl?: string;
  totalAmount: number;
  isSubmitting?: boolean;
}

const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: "PAID", label: "PAID (Mark as Paid)" },
  { value: "UNPAID", label: "UNPAID (Pending Payment)" },
];

export function BankQrPaymentModal({
  isOpen,
  onClose,
  onConfirmPayment,
  paymentOptionName,
  paymentOptionDescription,
  qrImageUrl,
  totalAmount,
  isSubmitting = false,
}: BankQrPaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes (300s)
  const [copied, setCopied] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "UNPAID">("PAID");

  // Countdown timer logic
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(300);
      setPaymentStatus("PAID");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(totalAmount.toFixed(2));
    setCopied(true);
    showToast.success("Amount copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetTimer = () => {
    setTimeLeft(300);
    showToast.info("QR timer reset to 05:00");
  };

  const isExpired = timeLeft === 0;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="max-h-[92vh] gap-0 p-0 flex flex-col overflow-hidden rounded-2xl"
      disableScrollWrapper={true}
    >
      {/* FormHeader */}
      <FormHeader
        title="Scan KHQR Payment"
        description="Scan with Bakong, ABA, or any mobile banking app to pay"
        icon={QrCode}
      />

      {/* FormBody Content with Top-Positioned QR & Side Details */}
      <FormBody contentClassName="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
          {/* LEFT: Tall KHQR Poster Image (Top & Prominent for instant scanning) */}
          <div className="sm:col-span-6 flex flex-col items-center justify-center">
            <div className="relative group w-full max-w-[260px] aspect-[2/3] max-h-[360px] rounded-2xl border-2 border-primary/25 bg-background p-1 flex flex-col items-center justify-center shadow-md transition-all hover:border-primary/50 overflow-hidden">
              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt={paymentOptionName || "Bank QR Code"}
                  className="w-full h-full object-contain rounded-xl hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                  <Building2 className="w-10 h-10 text-muted-foreground/40" />
                  <p className="text-xs font-semibold text-muted-foreground">
                    No QR image for <span className="font-bold text-foreground">{paymentOptionName}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground/80">
                    Collect payment manually.
                  </p>
                </div>
              )}

              {isExpired && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-3 text-center z-10 space-y-2">
                  <AlertCircle className="w-7 h-7 text-destructive" />
                  <p className="text-xs font-bold text-destructive">QR Session Expired</p>
                  <CustomButton
                    variant="outline"
                    size="sm"
                    onClick={handleResetTimer}
                    className="h-7 px-2 text-[11px] gap-1 rounded-md"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset Timer
                  </CustomButton>
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Scan QR code to pay
            </span>
          </div>

          {/* RIGHT: Total Price, Bank Info & Live Countdown Timer */}
          <div className="sm:col-span-6 space-y-3.5 text-left">
            {/* Total Amount Due Box */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-muted/20 border border-primary/20 rounded-xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total Amount Due
              </span>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                  {formatCurrency(totalAmount)}
                </span>
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAmount}
                  className="h-7 px-2.5 text-[11px] font-bold gap-1 rounded-lg border-primary/20 hover:bg-primary/10 text-primary"
                  title="Copy exact amount"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </CustomButton>
              </div>
            </div>

            {/* Bank Name & Countdown Timer Row */}
            <div className="bg-muted/30 border border-border/80 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">Payment Method:</span>
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/20">
                  {paymentOptionName || "Bank Transfer"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground">Session Timer:</span>
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors shadow-2xs",
                    isExpired
                      ? "bg-destructive/10 text-destructive border-destructive/30 animate-pulse"
                      : timeLeft < 60
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : "bg-primary/15 text-primary border-primary/25"
                  )}
                >
                  <Clock className="w-3 h-3" />
                  <span className="font-mono text-xs font-black">{formatTimer(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Payment Status Action CustomSelect */}
            <div className="bg-muted/30 border border-border/80 rounded-xl p-3 space-y-1.5">
              <CustomSelect
                label="Payment Status Action"
                options={PAYMENT_STATUS_OPTIONS}
                value={paymentStatus}
                onValueChange={(val) => setPaymentStatus(val as "PAID" | "UNPAID")}
                size="sm"
              />
            </div>

            {/* Account Info Description */}
            {paymentOptionDescription && (
              <div className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-xl border border-border/60 space-y-1">
                <span className="font-extrabold text-foreground block text-[11px]">Account Details:</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {paymentOptionDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </FormBody>

      {/* FormFooter */}
      <FormFooter
        isSubmitting={isSubmitting}
        isDirty={true}
        isCreate={true}
        createMessage="Processing POS order..."
        updateMessage="Processing POS order..."
        showStatusText={false}
      >
        <CancelButton onClick={onClose} disabled={isSubmitting} />
        <SubmitButton
          isSubmitting={isSubmitting}
          isDirty={true}
          isCreate={true}
          onClick={() => onConfirmPayment(paymentStatus)}
          createText={paymentStatus === "PAID" ? "Confirm Paid & Complete" : "Save Unpaid & Complete"}
          updateText={paymentStatus === "PAID" ? "Confirm Paid & Complete" : "Save Unpaid & Complete"}
          submittingCreateText="Completing Order..."
          submittingUpdateText="Completing Order..."
        />
      </FormFooter>
    </CustomModal>
  );
}
