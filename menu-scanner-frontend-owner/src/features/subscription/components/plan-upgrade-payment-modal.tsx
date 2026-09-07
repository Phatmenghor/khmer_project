"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { TextField } from "@/components/shared/form-field/text-field";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { useAppDispatch } from "@/store";
import { updateBusinessOwnerChangePlanService } from "@/features/auth/store/thunks/business-owner-thunks";
import { fetchMySubscriptionSummaryService } from "@/features/subscription/store/thunks/subscription-history-thunks";
import { getBusinessProfileService } from "@/features/auth/store/thunks/auth-thunks";
import { PlanUpgradeHeaderSummary } from "./plan-upgrade-header-summary";
import { BankPaymentDetailsCard } from "./bank-payment-details-card";
import { ShieldCheck } from "lucide-react";

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

export function PlanUpgradePaymentModal({
  isOpen,
  onClose,
  selectedPlan,
  userProfile,
  onSuccess,
}: PlanUpgradePaymentModalProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      newPlanId: selectedPlan?.id || "",
      paymentAmount: selectedPlan?.price,
      paymentMethod: "BANK",
      paymentReference: "",
    },
  });

  useEffect(() => {
    if (selectedPlan) {
      setValue("newPlanId", selectedPlan.id || "");
      setValue("paymentAmount", selectedPlan.price);
    }
  }, [selectedPlan, setValue]);

  const handleClose = () => {
    reset();
    onClose();
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
            paymentAmount: Number(data.paymentAmount),
            paymentMethod: "BANK",
            paymentReference: data.paymentReference,
          },
        })
      ).unwrap();

      showToast.success(`Payment confirmed! Successfully upgraded to ${selectedPlan?.name || "new plan"}.`);
      dispatch(fetchMySubscriptionSummaryService());
      dispatch(getBusinessProfileService());
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to confirm subscription payment"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      title="Order Payment & Plan Upgrade"
      disableScrollWrapper={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 py-3.5 sm:px-6 border-b border-border/60 flex items-center justify-between bg-muted/10 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-sm sm:text-base font-black text-foreground">Order Payment & Plan Upgrade</h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[72vh] flex-1">
          {/* Selected Plan Header Summary Component */}
          {selectedPlan && (
            <PlanUpgradeHeaderSummary selectedPlan={selectedPlan} />
          )}

          {/* Bank Payment Details Component (Bank Payment Only) */}
          <BankPaymentDetailsCard />

          {/* Input Fields (Normal Text Inputs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <TextField
              control={control}
              name="paymentAmount"
              label="Payment Amount ($ USD)"
              placeholder="Enter payment amount..."
              disabled={isSubmitting}
              required
            />

            <TextField
              control={control}
              name="paymentReference"
              label="Transaction Reference / Reference No."
              placeholder="Enter transaction reference..."
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 sm:px-6 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-2 shrink-0">
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
