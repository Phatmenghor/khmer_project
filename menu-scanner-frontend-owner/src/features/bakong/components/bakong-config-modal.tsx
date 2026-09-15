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
import { createConfigThunk, updateConfigThunk } from "../store/thunks/bakong-thunks";
import { selectIsBakongSubmitting } from "../store/selectors/bakong-selectors";
import { BakongConfigModel } from "../models/bakong-models";

import { bakongApiService } from "../services/bakong-api-service";

interface BakongConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  configId?: string | null;
  onSuccess: () => void;
}

export function BakongConfigModal({ isOpen, onClose, configId, onSuccess }: BakongConfigModalProps) {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsBakongSubmitting) ?? false;
  const isCreate = !configId;

  const [formData, setFormData] = useState({
    configName: "",
    apiUrl: "https://api-bakong.nbc.gov.kh",
    email: "",
    dailyRateLimit: 100,
    enabled: true,
  });

  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (configId) {
      setIsLoadingDetail(true);
      bakongApiService
        .getConfigById(configId)
        .then((res) => {
          if (res) {
            setFormData({
              configName: res.configName || "",
              apiUrl: res.apiUrl || "https://api-bakong.nbc.gov.kh",
              email: res.email || "",
              dailyRateLimit: res.dailyRateLimit || 100,
              enabled: res.enabled ?? true,
            });
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingDetail(false));
    } else {
      setFormData({
        configName: "",
        apiUrl: "https://api-bakong.nbc.gov.kh",
        email: "",
        dailyRateLimit: 100,
        enabled: true,
      });
    }
  }, [configId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.configName.trim() || !formData.email.trim() || !formData.apiUrl.trim()) {
      showToast.error("Please fill in all required fields");
      return;
    }

    try {
      if (configId) {
        await dispatch(updateConfigThunk({ id: configId, payload: formData })).unwrap();
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
    <CustomModal isOpen={isOpen} onClose={onClose} size="2xl">
      <FormHeader
        title={isCreate ? "Create Config" : "Edit Config"}
        description={isCreate ? "Fill out form to create configuration" : "Update configuration information"}
        isCreate={isCreate}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <FormBody className="space-y-3">
          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading configuration details...</p>
            </div>
          ) : (
            <>
              <CustomInput
                label="Configuration Name"
                required
                placeholder="Enter configuration name"
                value={formData.configName}
                onChange={(e) => setFormData({ ...formData, configName: e.target.value })}
              />

              <CustomInput
                label="API Base URL"
                required
                type="url"
                placeholder="Enter API base URL"
                value={formData.apiUrl}
                onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              />

              <CustomInput
                label="Registered Developer Email"
                required
                type="email"
                placeholder="Enter developer email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3 items-start">
                <CustomInput
                  label="Daily Rate Limit"
                  required
                  type="number"
                  min={1}
                  max={1000}
                  placeholder="Enter daily rate limit"
                  value={formData.dailyRateLimit}
                  onChange={(e) => setFormData({ ...formData, dailyRateLimit: parseInt(e.target.value, 10) || 100 })}
                />

                <CustomSelect
                  label="Status"
                  required
                  clearable={false}
                  size="md"
                  options={[
                    { label: "Enabled", value: "true" },
                    { label: "Disabled", value: "false" },
                  ]}
                  value={formData.enabled ? "true" : "false"}
                  onValueChange={(val) => setFormData({ ...formData, enabled: val === "true" })}
                />
              </div>
            </>
          )}
        </FormBody>

        <FormFooter isSubmitting={isSubmitting || isLoadingDetail} isDirty={true} isCreate={isCreate} showStatusText={false}>
          <CancelButton onClick={onClose} disabled={isSubmitting || isLoadingDetail} />
          <SubmitButton
            isSubmitting={isSubmitting}
            isCreate={isCreate}
            createText="Create Config"
            updateText="Update Config"
            submittingCreateText="Creating..."
            submittingUpdateText="Updating..."
            disabled={isLoadingDetail}
          />
        </FormFooter>
      </form>
    </CustomModal>
  );
}
