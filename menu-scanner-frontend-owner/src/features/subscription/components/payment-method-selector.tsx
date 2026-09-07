"use client";

import React from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { QrCode, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodSelectorProps {
  paymentMethod: "BANK" | "CASH";
  onSelectMethod: (method: "BANK" | "CASH") => void;
}

export function PaymentMethodSelector({
  paymentMethod,
  onSelectMethod,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
        Select Payment Method
      </label>
      <div className="grid grid-cols-2 gap-3">
        <CustomButton
          type="button"
          variant="unstyled"
          size="unstyled"
          onClick={() => onSelectMethod("BANK")}
          className={cn(
            "p-3.5 rounded-2xl border-2 flex items-center gap-3 text-left transition-all cursor-pointer",
            paymentMethod === "BANK"
              ? "border-primary bg-primary/5 text-foreground shadow-2xs"
              : "border-border/80 bg-card hover:border-border text-muted-foreground"
          )}
        >
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black block text-foreground">ABA KHQR / Bank Transfer</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Instant Mobile App Transfer</span>
          </div>
        </CustomButton>

        <CustomButton
          type="button"
          variant="unstyled"
          size="unstyled"
          onClick={() => onSelectMethod("CASH")}
          className={cn(
            "p-3.5 rounded-2xl border-2 flex items-center gap-3 text-left transition-all cursor-pointer",
            paymentMethod === "CASH"
              ? "border-primary bg-primary/5 text-foreground shadow-2xs"
              : "border-border/80 bg-card hover:border-border text-muted-foreground"
          )}
        >
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black block text-foreground">Cash / In-Person Payment</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Manual Verification</span>
          </div>
        </CustomButton>
      </div>
    </div>
  );
}
