"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { SmartImage } from "@/components/shared/image/smart-image";
import { Building2, QrCode, Check, Copy, Info, ShieldCheck, Loader2 } from "lucide-react";
import { usePlatformBankState } from "@/features/platform-bank/store/state/use-platform-bank-state";
import { fetchPublicActivePlatformBanksService } from "@/features/platform-bank/store/thunks/platform-bank-thunks";
import { PlatformBankResponseModel } from "@/features/platform-bank/store/models/response/platform-bank-response";

interface BankPaymentDetailsCardProps {
  onSelectBank?: (bank: PlatformBankResponseModel) => void;
}

export function BankPaymentDetailsCard({ onSelectBank }: BankPaymentDetailsCardProps) {
  const { dispatch, publicBanks, isFetchingPublic } = usePlatformBankState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedAcc, setCopiedAcc] = useState(false);

  useEffect(() => {
    if (!publicBanks && !isFetchingPublic) {
      dispatch(fetchPublicActivePlatformBanksService());
    }
  }, [publicBanks, isFetchingPublic, dispatch]);

  const defaultBank: PlatformBankResponseModel = {
    id: "default-aba",
    name: "ABA KHQR Merchant Bank Payment",
    accountName: "MENU SCANNER PLATFORM CO., LTD.",
    accountNumber: "000 999 888",
    description: "Scan QR code or transfer to account number above. Enter reference ID to confirm.",
    status: "ACTIVE",
    displayOrder: 0,
    image: null,
  };

  const banks = (publicBanks && publicBanks.length > 0) ? publicBanks : [defaultBank];
  const selectedBank = banks[selectedIndex] || banks[0] || defaultBank;

  useEffect(() => {
    if (selectedBank) {
      onSelectBank?.(selectedBank);
    }
  }, [selectedBank, onSelectBank]);

  const copyAccountNumber = (accNo: string) => {
    navigator.clipboard.writeText(accNo.replace(/\s+/g, ""));
    setCopiedAcc(true);
    showToast.success("Account number copied to clipboard!");
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const imageUrl = selectedBank.image?.sm || selectedBank.image?.md || selectedBank.image?.o;

  return (
    <Card className="border-primary/30 shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-card via-card to-primary/5">
      {/* Header */}
      <CardHeader className="py-3 px-4 sm:px-5 border-b border-border/50 bg-primary/10">
        <CardTitle className="text-xs font-black flex items-center justify-between text-foreground">
          <span className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary shrink-0" />
            {selectedBank.name}
          </span>
          <span className="text-[10px] bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase flex items-center gap-1 shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-white" />
            KHQR Verified
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Dynamic Bank Account Selectors / Tabs */}
        {banks.length > 1 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
              Select Bank Account:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {banks.map((bank, idx) => {
                const isSelected = idx === selectedIndex;
                const bankLogo = bank.image?.sm || bank.image?.md;
                return (
                  <button
                    key={bank.id || idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]"
                        : "bg-background text-foreground border-border/60 hover:bg-accent/60"
                    }`}
                  >
                    {bankLogo ? (
                      <SmartImage src={bankLogo} alt={bank.name} width={18} height={18} className="rounded-sm object-cover" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{bank.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isFetchingPublic && !publicBanks ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading active bank payment options...</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* QR Code / Logo Visual Box */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col items-center shrink-0 space-y-2">
              <div className="w-36 h-36 bg-slate-950 rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
                {imageUrl ? (
                  <SmartImage src={imageUrl} alt={selectedBank.name} fill className="object-contain p-1" />
                ) : (
                  <div className="w-full h-full border-2 border-dashed border-red-500/60 rounded-lg flex flex-col items-center justify-center text-center bg-slate-900 p-1">
                    <span className="text-[9px] font-black text-red-500 tracking-widest uppercase">
                      KHQR
                    </span>
                    <QrCode className="w-16 h-16 text-white my-1" />
                    <span className="text-[8px] font-bold text-slate-300">
                      Scan to Pay
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider text-center max-w-[140px] truncate">
                {selectedBank.name}
              </span>
            </div>

            {/* Account Details */}
            <div className="flex-1 space-y-3 w-full">
              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase text-muted-foreground block tracking-wider">
                  Account Owner Name
                </span>
                <span className="text-xs font-black text-foreground block tracking-wide">
                  {selectedBank.accountName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-background border border-border/60 flex items-center justify-between gap-2 shadow-2xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-muted-foreground block tracking-wider">
                    {selectedBank.name} Account Number
                  </span>
                  <span className="text-sm font-black text-primary tracking-widest font-mono">
                    {selectedBank.accountNumber}
                  </span>
                </div>
                <CustomButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyAccountNumber(selectedBank.accountNumber)}
                  className="h-8 text-xs font-extrabold gap-1.5 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
                  icon={copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  <span>{copiedAcc ? "Copied" : "Copy"}</span>
                </CustomButton>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-xs text-muted-foreground">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  {selectedBank.description || "Scan the QR code or transfer to the account number above. Enter your Transaction Reference ID below to confirm payment."}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
