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
import { createConfigThunk, updateConfigThunk } from "../store/thunks/bakong-thunks";
import { selectIsBakongSubmitting } from "../store/selectors/bakong-selectors";
import { BakongConfigModel } from "../models/bakong-models";
import { Database } from "lucide-react";

interface BakongConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  configToEdit: BakongConfigModel | null;
  onSuccess: () => void;
}

export function BakongConfigModal({ isOpen, onClose, configToEdit, onSuccess }: BakongConfigModalProps) {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsBakongSubmitting) ?? false;
  const isCreate = !configToEdit;

  const [formData, setFormData] = useState({
    configName: "",
    apiUrl: "https://api-bakong.nbc.gov.kh",
    email: "",
    dailyRateLimit: 100,
    enabled: true,
  });

  useEffect(() => {
    if (configToEdit) {
      setFormData({
        configName: configToEdit.configName || "",
        apiUrl: configToEdit.apiUrl || "https://api-bakong.nbc.gov.kh",
        email: configToEdit.email || "",
        dailyRateLimit: configToEdit.dailyRateLimit || 100,
        enabled: configToEdit.enabled ?? true,
      });
    } else {
      setFormData({
        configName: "",
        apiUrl: "https://api-bakong.nbc.gov.kh",
        email: "",
        dailyRateLimit: 100,
        enabled: true,
      });
    }
  }, [configToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.configName.trim() || !formData.email.trim() || !formData.apiUrl.trim()) {
      showToast.error("Please fill in all required fields");
      return;
    }

    try {
      if (configToEdit) {
        await dispatch(updateConfigThunk({ id: configToEdit.id, payload: formData })).unwrap();
        showToast.success("Bakong configuration updated successfully");
      } else {
        await dispatch(createConfigThunk(formData)).unwrap();
        showToast.success("Bakong configuration created successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Failed to save configuration"));
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="lg">
      <FormHeader
        title={isCreate ? "Create Upstream Bakong Configuration" : "Edit Bakong Configuration"}
        description="Configure upstream NBC developer credentials and daily rate limits for API rotation"
        isCreate={isCreate}
        icon={Database}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <FormBody className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Configuration Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. DEFAULT, SECONDARY_CONFIG"
              value={formData.configName}
              onChange={(e) => setFormData({ ...formData, configName: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">API Base URL *</label>
            <input
              type="url"
              required
              placeholder="https://api-bakong.nbc.gov.kh"
              value={formData.apiUrl}
              onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Registered Developer Email *</label>
            <input
              type="email"
              required
              placeholder="phatmenghor19@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Daily Rate Limit *</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={formData.dailyRateLimit}
                onChange={(e) => setFormData({ ...formData, dailyRateLimit: parseInt(e.target.value, 10) || 100 })}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              />
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-medium text-foreground text-xs">Enabled & Active</span>
              </label>
            </div>
          </div>
        </FormBody>

        <FormFooter isSubmitting={isSubmitting} isDirty={true} isCreate={isCreate} showStatusText={false}>
          <CancelButton onClick={onClose} disabled={isSubmitting} />
          <SubmitButton
            isSubmitting={isSubmitting}
            isCreate={isCreate}
            createText="Create Config"
            updateText="Update Config"
            submittingCreateText="Creating..."
            submittingUpdateText="Updating..."
          />
        </FormFooter>
      </form>
    </CustomModal>
  );
}
