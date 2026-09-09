"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { usePlatformBankState } from "../store/state/use-platform-bank-state";
import {
  createPlatformBankService,
  updatePlatformBankService,
} from "../store/thunks/platform-bank-thunks";
import { PlatformBankResponseModel } from "../store/models/response/platform-bank-response";
import { Building2 } from "lucide-react";

interface PlatformBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankToEdit?: PlatformBankResponseModel | null;
  onSuccess?: () => void;
}

export function PlatformBankModal({
  isOpen,
  onClose,
  bankToEdit,
  onSuccess,
}: PlatformBankModalProps) {
  const { dispatch, operations } = usePlatformBankState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(bankToEdit);

  const { control, handleSubmit, reset, setValue, formState: { isDirty } } = useForm({
    defaultValues: {
      name: "",
      accountName: "",
      accountNumber: "",
      description: "",
      status: "ACTIVE",
      displayOrder: 0,
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (bankToEdit) {
      setValue("name", bankToEdit.name || "");
      setValue("accountName", bankToEdit.accountName || "");
      setValue("accountNumber", bankToEdit.accountNumber || "");
      setValue("description", bankToEdit.description || "");
      setValue("status", bankToEdit.status || "ACTIVE");
      setValue("displayOrder", bankToEdit.displayOrder ?? 0);
      setValue("imageUrl", bankToEdit.image?.sm || bankToEdit.image?.md || "");
    } else {
      reset({
        name: "",
        accountName: "",
        accountNumber: "",
        description: "",
        status: "ACTIVE",
        displayOrder: 0,
        imageUrl: "",
      });
    }
  }, [bankToEdit, setValue, reset, isOpen]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        description: data.description,
        status: data.status,
        displayOrder: Number(data.displayOrder) || 0,
        image: data.imageUrl
          ? { sm: data.imageUrl, md: data.imageUrl, o: data.imageUrl }
          : null,
      };

      if (isEditing && bankToEdit) {
        await dispatch(
          updatePlatformBankService({ id: bankToEdit.id, data: payload })
        ).unwrap();
        showToast.success("Platform bank account updated");
      } else {
        await dispatch(createPlatformBankService(payload)).unwrap();
        showToast.success("Platform bank account created");
      }
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      showToast.error(
        getErrorMessage(
          error,
          `Failed to ${isEditing ? "update" : "create"} platform bank account`
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title={isEditing ? "Edit Platform Bank" : "New Platform Bank"}
      disableScrollWrapper={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
        <FormHeader
          title={isEditing ? "Edit Platform Bank" : "New Platform Bank"}
          subtitle={isEditing ? "Update receiving bank details" : "Add receiving bank details for payments"}
          icon={Building2}
          isCreate={!isEditing}
        />

        <FormBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <TextField
                control={control}
                name="name"
                label="Bank Name"
                placeholder="e.g. ABA Bank"
                disabled={isSubmitting}
                required
              />

              <TextField
                control={control}
                name="accountName"
                label="Account Holder Name"
                placeholder="e.g. SCANME KH CO., LTD."
                disabled={isSubmitting}
                required
              />

              <TextField
                control={control}
                name="accountNumber"
                label="Account Number"
                placeholder="e.g. 000 123 456"
                disabled={isSubmitting}
                required
              />

              <TextField
                control={control}
                name="displayOrder"
                label="Display Order"
                placeholder="0"
                type="number"
                disabled={isSubmitting}
              />

              <SelectField
                control={control}
                name="status"
                label="Status"
                options={statusOptions}
                disabled={isSubmitting}
              />

              <TextField
                control={control}
                name="imageUrl"
                label="Logo / QR Image URL"
                placeholder="https://example.com/logo.png"
                disabled={isSubmitting}
              />
            </div>

            <TextareaField
              control={control}
              name="description"
              label="Payment Instructions"
              placeholder="e.g. Transfer via mobile app or scan KHQR code..."
              rows={2}
              disabled={isSubmitting}
            />
          </div>
        </FormBody>

        <FormFooter
          isSubmitting={isSubmitting || operations.isCreating || operations.isUpdating}
          isDirty={isDirty || !isEditing}
          isCreate={!isEditing}
          createMessage="Creating platform bank..."
          updateMessage="Updating platform bank..."
        >
          <CancelButton onClick={handleClose} disabled={isSubmitting} />
          <SubmitButton
            isSubmitting={isSubmitting || operations.isCreating || operations.isUpdating}
            isDirty={isDirty || !isEditing}
            isCreate={!isEditing}
            createText="Create Bank Account"
            updateText="Update Bank Account"
            submittingCreateText="Creating..."
            submittingUpdateText="Updating..."
          />
        </FormFooter>
      </form>
    </CustomModal>
  );
}
