"use client";

import React, { useEffect, useState } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { CustomInput } from "@/components/shared/form-field/custom-input";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { useAppDispatch, useAppSelector } from "@/store";
import { Loader2 } from "lucide-react";
import { createAccountThunk, updateAccountThunk } from "../store/thunks/bakong-thunks";
import { selectIsBakongSubmitting } from "../store/selectors/bakong-selectors";
import { BakongAccountModel } from "../models/bakong-models";

import { bakongApiService } from "../services/bakong-api-service";

interface BakongAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId?: string | null;
  onSuccess: () => void;
}

export function BakongAccountModal({ isOpen, onClose, accountId, onSuccess }: BakongAccountModalProps) {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsBakongSubmitting) ?? false;
  const isCreate = !accountId;

  const [formData, setFormData] = useState({
    accountId: "",
    merchantName: "",
    merchantCity: "Phnom Penh",
    acquiringBank: "Bakong Bank",
    currency: "USD",
    isDefault: false,
    enabled: false,
  });

  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (accountId) {
      setIsLoadingDetail(true);
      bakongApiService
        .getAccountById(accountId)
        .then((res) => {
          if (res) {
            setFormData({
              accountId: res.accountId || "",
              merchantName: res.merchantName || "",
              merchantCity: res.merchantCity || "Phnom Penh",
              acquiringBank: res.acquiringBank || "Bakong Bank",
              currency: res.currency || "USD",
              isDefault: res.isDefault ?? false,
              enabled: res.enabled ?? false,
            });
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingDetail(false));
    } else {
      setFormData({
        accountId: "",
        merchantName: "",
        merchantCity: "Phnom Penh",
        acquiringBank: "Bakong Bank",
        currency: "USD",
        isDefault: false,
        enabled: false,
      });
    }
  }, [accountId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId.trim() || !formData.merchantName.trim()) {
      showToast.error("Please fill in account ID and merchant name");
      return;
    }

    try {
      if (accountId) {
        await dispatch(updateAccountThunk({ id: accountId, payload: formData })).unwrap();
        showToast.success("Bakong merchant account updated successfully");
      } else {
        await dispatch(createAccountThunk(formData)).unwrap();
        showToast.success("Bakong merchant account created successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Failed to save account"));
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="2xl">
      <FormHeader
        title={isCreate ? "Create Account" : "Edit Account"}
        description={isCreate ? "Fill out form to create merchant account" : "Update merchant account details"}
        isCreate={isCreate}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <FormBody className="space-y-3">
          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading account details...</p>
            </div>
          ) : (
            <>
              <CustomInput
                label="Bakong Account ID"
                required
                placeholder="Enter Bakong account ID"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="font-mono"
              />

              <CustomInput
                label="Merchant Name"
                required
                placeholder="Enter merchant name"
                value={formData.merchantName}
                onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3 items-start">
                <CustomInput
                  label="Merchant City"
                  placeholder="Enter merchant city"
                  value={formData.merchantCity}
                  onChange={(e) => setFormData({ ...formData, merchantCity: e.target.value })}
                />

                <CustomInput
                  label="Acquiring Bank"
                  placeholder="Enter acquiring bank"
                  value={formData.acquiringBank}
                  onChange={(e) => setFormData({ ...formData, acquiringBank: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-start">
                <CustomSelect
                  label="Currency"
                  required
                  clearable={false}
                  size="md"
                  options={[
                    { label: "USD ($)", value: "USD" },
                    { label: "KHR (៛)", value: "KHR" },
                  ]}
                  value={formData.currency}
                  onValueChange={(val) => setFormData({ ...formData, currency: val })}
                />

                <CustomSelect
                  label="Account Status"
                  required
                  clearable={false}
                  size="md"
                  options={[
                    { label: "Active Primary", value: "true" },
                    { label: "Inactive", value: "false" },
                  ]}
                  value={formData.enabled || formData.isDefault ? "true" : "false"}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      enabled: val === "true",
                      isDefault: val === "true",
                    })
                  }
                />
              </div>

              <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40">
                <strong>Note:</strong> Multiple accounts can exist, but activating this account automatically deactivates all other accounts to maintain a single active receiver.
              </p>
            </>
          )}
        </FormBody>

        <FormFooter isSubmitting={isSubmitting || isLoadingDetail} isDirty={true} isCreate={isCreate} showStatusText={false}>
          <CancelButton onClick={onClose} disabled={isSubmitting || isLoadingDetail} />
          <SubmitButton
            isSubmitting={isSubmitting}
            isCreate={isCreate}
            createText="Create Account"
            updateText="Update Account"
            submittingCreateText="Creating..."
            submittingUpdateText="Updating..."
            disabled={isLoadingDetail}
          />
        </FormFooter>
      </form>
    </CustomModal>
  );
}
