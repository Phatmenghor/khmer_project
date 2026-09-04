"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/shared/form-field/select-field";
import { TextField } from "@/components/shared/form-field/text-field";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { useAppDispatch } from "@/store";
import { updateBusinessOwnerChangePlanService } from "@/features/auth/store/thunks/business-owner-thunks";
import { fetchMySubscriptionSummaryService } from "@/features/subscription/store/thunks/subscription-history-thunks";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  Sparkles,
  Zap,
  Clock,
  Info,
  CheckCircle2,
  Copy,
  Check,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanUpgradePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: {
    id?: string;
    name: string;
    price: number;
    durationType: string;
    description?: string;
  } | null;
  userProfile?: any;
  onSuccess?: () => void;
}

const KHR_EXCHANGE_RATE = 4100; // 1 USD = 4,100 KHR

export function PlanUpgradePaymentModal({
  isOpen,
  onClose,
  selectedPlan,
  userProfile,
  onSuccess,
}: PlanUpgradePaymentModalProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"BANK" | "CASH">("BANK");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      newPlanId: selectedPlan?.id || "",
      paymentAmount: selectedPlan?.price ?? 0,
      paymentMethod: "BANK",
      paymentReference: "",
    },
  });

  useEffect(() => {
    if (selectedPlan) {
      setValue("newPlanId", selectedPlan.id || "");
      setValue("paymentAmount", selectedPlan.price ?? 0);
    }
  }, [selectedPlan, setValue]);

  const handleClose = () => {
    reset();
    setCopiedAcc(false);
    onClose();
  };

  const copyAccountNumber = (accNo: string) => {
    navigator.clipboard.writeText(accNo);
    setCopiedAcc(true);
    showToast.success("Account number copied to clipboard!");
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const onSubmit = async (data: any) => {
    const ownerId = userProfile?.id;
    if (!ownerId) {
      showToast.error("User session invalid. Please log in to complete subscription payment.");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        updateBusinessOwnerChangePlanService({
          ownerId,
          businessOwnerData: {
            newPlanId: data.newPlanId || selectedPlan?.id,
            paymentAmount: Number(data.paymentAmount) || selectedPlan?.price || 0,
            paymentMethod: paymentMethod,
            paymentReference: data.paymentReference || "",
          },
        })
      ).unwrap();

      showToast.success(`Payment confirmed! Successfully upgraded to ${selectedPlan?.name || "new plan"}.`);
      dispatch(fetchMySubscriptionSummaryService());
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to confirm subscription payment"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlanIcon = (type?: string) => {
    if (type === "FREE_TRIAL") return <Clock className="w-5 h-5 text-emerald-500 shrink-0" />;
    if (type === "YEARLY") return <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />;
    if (type === "SIX_MONTHS") return <Zap className="w-5 h-5 text-amber-500 shrink-0" />;
    return <ShieldCheck className="w-5 h-5 text-primary shrink-0" />;
  };

  const usdPrice = selectedPlan?.price ?? 0;
  const khrPrice = (usdPrice * KHR_EXCHANGE_RATE).toLocaleString();

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      title="Order Payment & Plan Upgrade"
      disableScrollWrapper={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-5">
        {/* Selected Plan Header Summary Card */}
        {selectedPlan && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-card border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 shrink-0">
                {getPlanIcon(selectedPlan.durationType)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-foreground">{selectedPlan.name}</h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {selectedPlan.durationType.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {selectedPlan.description || "Full platform features & POS checkout access"}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
              <div className="flex items-baseline justify-start sm:justify-end gap-1">
                <span className="text-2xl font-black text-primary">${usdPrice.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground font-bold">USD</span>
              </div>
              <span className="text-xs font-bold text-muted-foreground block">
                ≈ ៛ {khrPrice} KHR
              </span>
            </div>
          </div>
        )}

        {/* Payment Method Selector Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
            Select Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <CustomButton
              type="button"
              variant="unstyled"
              size="unstyled"
              onClick={() => {
                setPaymentMethod("BANK");
                setValue("paymentMethod", "BANK");
              }}
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
              onClick={() => {
                setPaymentMethod("CASH");
                setValue("paymentMethod", "CASH");
              }}
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

        {/* KHQR Code & Account Information Card */}
        {paymentMethod === "BANK" && (
          <Card className="border-primary/20 shadow-xs rounded-2xl overflow-hidden bg-gradient-to-br from-card via-card to-primary/5">
            <CardHeader className="py-3 px-4 sm:px-5 border-b border-border/50 bg-primary/5">
              <CardTitle className="text-xs font-black flex items-center justify-between text-foreground">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  ABA KHQR Merchant Payment
                </span>
                <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full tracking-wider uppercase">
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
                  <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">
                      Account Owner Name
                    </span>
                    <span className="text-xs font-black text-foreground block">
                      MENU SCANNER PLATFORM CO., LTD.
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-background border border-border/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">
                        ABA Bank Account Number
                      </span>
                      <span className="text-sm font-black text-primary tracking-wider">
                        000 999 888
                      </span>
                    </div>
                    <CustomButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyAccountNumber("000999888")}
                      className="h-8 text-xs font-bold gap-1 text-primary border-primary/30 hover:bg-primary/10"
                      icon={copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
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
        )}

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <TextField
            control={control}
            name="paymentAmount"
            label="Payment Amount ($ USD)"
            type="number"
            placeholder="0.00"
            disabled={isSubmitting}
            required
          />

          <TextField
            control={control}
            name="paymentReference"
            label="Transaction Reference / Reference No."
            placeholder="e.g. ABA-987654321 or receipt number"
            disabled={isSubmitting}
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
          <CancelButton onClick={handleClose} disabled={isSubmitting} />
          <SubmitButton
            isSubmitting={isSubmitting}
            isDirty={true}
            isCreate={true}
            createText="Confirm Payment & Upgrade Plan"
            submittingCreateText="Processing Payment..."
          />
        </div>
      </form>
    </CustomModal>
  );
}
