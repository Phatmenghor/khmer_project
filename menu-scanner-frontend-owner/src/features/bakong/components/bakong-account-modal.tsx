"use client";

import React, { useEffect, useState } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { useAppDispatch, useAppSelector } from "@/store";
import { createAccountThunk, updateAccountThunk } from "../store/thunks/bakong-thunks";
import { selectIsBakongSubmitting } from "../store/selectors/bakong-selectors";
import { BakongAccountModel } from "../models/bakong-models";
import { QrCode } from "lucide-react";

interface BakongAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit: BakongAccountModel | null;
  onSuccess: () => void;
}

export function BakongAccountModal({ isOpen, onClose, accountToEdit, onSuccess }: BakongAccountModalProps) {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsBakongSubmitting) ?? false;
  const isCreate = !accountToEdit;

  const [formData, setFormData] = useState({
    accountId: "",
    merchantName: "",
    merchantCity: "Phnom Penh",
    acquiringBank: "Bakong Bank",
    currency: "USD",
    isDefault: false,
    enabled: false,
  });

  useEffect(() => {
    if (accountToEdit) {
      setFormData({
        accountId: accountToEdit.accountId || "",
        merchantName: accountToEdit.merchantName || "",
        merchantCity: accountToEdit.merchantCity || "Phnom Penh",
        acquiringBank: accountToEdit.acquiringBank || "Bakong Bank",
        currency: accountToEdit.currency || "USD",
        isDefault: accountToEdit.isDefault ?? false,
        enabled: accountToEdit.enabled ?? false,
      });
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
  }, [accountToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId.trim() || !formData.merchantName.trim()) {
      showToast.error("Please fill in account ID and merchant name");
      return;
    }

    try {
      if (accountToEdit) {
        await dispatch(updateAccountThunk({ id: accountToEdit.id, payload: formData })).unwrap();
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
    <CustomModal isOpen={isOpen} onClose={onClose} size="lg">
      <FormHeader
        title={isCreate ? "Create Bakong Merchant Account" : "Edit Bakong Merchant Account"}
        description="Manage payment receiver merchant account details and active status"
        isCreate={isCreate}
        icon={QrCode}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <FormBody className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Bakong Account ID *</label>
            <input
              type="text"
              required
              placeholder="e.g. phat_menghor@bkrt"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Merchant Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. MENGHOR PHAT"
              value={formData.merchantName}
              onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Merchant City</label>
              <input
                type="text"
                placeholder="Phnom Penh"
                value={formData.merchantCity}
                onChange={(e) => setFormData({ ...formData, merchantCity: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Acquiring Bank</label>
              <input
                type="text"
                placeholder="Bakong Bank"
                value={formData.acquiringBank}
                onChange={(e) => setFormData({ ...formData, acquiringBank: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              >
                <option value="USD">USD ($)</option>
                <option value="KHR">KHR (៛)</option>
              </select>
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={formData.enabled || formData.isDefault}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enabled: e.target.checked,
                      isDefault: e.target.checked,
                    })
                  }
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-medium text-foreground text-xs">Active Primary Account</span>
              </label>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40">
            <strong>Note:</strong> Multiple accounts can exist, but activating this account automatically deactivates all other accounts to maintain a single active receiver.
          </p>
        </FormBody>

        <FormFooter isSubmitting={isSubmitting} isDirty={true} isCreate={isCreate} showStatusText={false}>
          <CancelButton onClick={onClose} disabled={isSubmitting} />
          <SubmitButton
            isSubmitting={isSubmitting}
            isCreate={isCreate}
            createText="Create Account"
            updateText="Update Account"
            submittingCreateText="Creating..."
            submittingUpdateText="Updating..."
          />
        </FormFooter>
      </form>
    </CustomModal>
  );
}
