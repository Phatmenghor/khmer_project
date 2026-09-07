"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { Building2, QrCode, Check, Copy, Info, ShieldCheck } from "lucide-react";

export function BankPaymentDetailsCard() {
  const [copiedAcc, setCopiedAcc] = useState(false);

  const copyAccountNumber = (accNo: string) => {
    navigator.clipboard.writeText(accNo);
    setCopiedAcc(true);
    showToast.success("Account number copied to clipboard!");
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  return (
    <Card className="border-primary/30 shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="py-3 px-4 sm:px-5 border-b border-border/50 bg-primary/10">
        <CardTitle className="text-xs font-black flex items-center justify-between text-foreground">
          <span className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary shrink-0" />
            ABA KHQR Merchant Bank Payment
          </span>
          <span className="text-[10px] bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase flex items-center gap-1 shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-white" />
            KHQR Official
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* QR Code Visual Box */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col items-center shrink-0 space-y-2">
            <div className="w-36 h-36 bg-slate-950 rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
              <div className="w-full h-full border-2 border-dashed border-red-500/60 rounded-lg flex flex-col items-center justify-center text-center bg-slate-900 p-1">
                <span className="text-[9px] font-black text-red-500 tracking-widest uppercase">
                  KHQR
                </span>
                <QrCode className="w-16 h-16 text-white my-1" />
                <span className="text-[8px] font-bold text-slate-300">
                  Scan to Pay
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
              Bakong / ABA KHQR
            </span>
          </div>

          {/* Account Details */}
          <div className="flex-1 space-y-3 w-full">
            <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground block tracking-wider">
                Account Owner Name
              </span>
              <span className="text-xs font-black text-foreground block tracking-wide">
                MENU SCANNER PLATFORM CO., LTD.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border/60 flex items-center justify-between gap-2 shadow-2xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-muted-foreground block tracking-wider">
                  ABA Bank Account Number
                </span>
                <span className="text-sm font-black text-primary tracking-widest font-mono">
                  000 999 888
                </span>
              </div>
              <CustomButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyAccountNumber("000999888")}
                className="h-8 text-xs font-extrabold gap-1.5 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
                icon={copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                <span>{copiedAcc ? "Copied" : "Copy"}</span>
              </CustomButton>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-xs text-muted-foreground">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">
                Scan the QR code with any mobile banking app (ABA, Wing, ACLEDA, Sathapana). Enter the <strong>Transaction Reference ID</strong> below to complete payment.
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
