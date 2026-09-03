"use client";

import React, { useEffect } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Loading from "@/components/shared/common/loading";
import { TextField } from "@/components/shared/form-field/text-field";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { SelectField } from "@/components/shared/form-field/select-field";
import { useAppDispatch, useAppSelector } from "@/store";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { getFieldError } from "@/utils/common/get-field-error";
import {
  ACCOUNT_STATUS_CREATE_UPDATE,
  BUSINESS_STATUS_CREATE_UPDATE,
} from "@/constants/app-resource/status/create-update-status";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
  selectSelectedBusinessOwner,
} from "../store/selectors/business-owner-selectors";
import { clearError, clearSelectedBusinessOwner } from "../store/slice/business-owner-slice";
import {
  UpdateBusinessOwnerData,
  updateBusinessOwnerSchema,
} from "../store/models/schema/business-owner.schema";
import {
  fetchBusinessOwnerByIdService,
  updateBusinessOwnerService,
} from "../store/thunks/business-owner-thunks";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  ownerId?: string;
};

export default function UpdateBusinessOwnerModal({ isOpen, onClose, ownerId }: Props) {
  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const reduxError = useAppSelector(selectError);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const ownerData = useAppSelector(selectSelectedBusinessOwner);
  const { isUpdating } = operations;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateBusinessOwnerData>({
    resolver: zodResolver(updateBusinessOwnerSchema),
    defaultValues: {
      ownerFullName: "",
      ownerEmail: "",
      ownerPhone: "",
      ownerAccountStatus: "",
      businessName: "",
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      businessStatus: "",
    },
    mode: "onChange",
  });

  const businessName = watch("businessName");

  useEffect(() => {
    if (isOpen && ownerId) {
      dispatch(clearError());
      dispatch(fetchBusinessOwnerByIdService(ownerId))
        .unwrap()
        .then((data) => {
          reset({
            ownerFullName: data.ownerFullName || "",
            ownerEmail: data.ownerEmail || "",
            ownerPhone: data.ownerPhone || "",
            ownerAccountStatus: data.ownerAccountStatus || "",
            businessName: data.businessName || "",
            businessEmail: data.businessEmail || "",
            businessPhone: data.businessPhone || "",
            businessAddress: data.businessAddress || "",
            businessStatus: data.businessStatus || "",
          });
        })
        .catch(() => {});
    }
  }, [isOpen, ownerId, dispatch, reset]);

  const onSubmit = async (data: UpdateBusinessOwnerData) => {
    if (!ownerId) return;
    try {
      const result = await dispatch(
        updateBusinessOwnerService({
          ownerId,
          data: {
            ownerFullName: data.ownerFullName,
            ownerEmail: data.ownerEmail || undefined,
            ownerPhone: data.ownerPhone || undefined,
            ownerAccountStatus: data.ownerAccountStatus || undefined,
            businessName: data.businessName,
            businessEmail: data.businessEmail || undefined,
            businessPhone: data.businessPhone || undefined,
            businessAddress: data.businessAddress || undefined,
            businessStatus: data.businessStatus || undefined,
          },
        })
      ).unwrap();

      showToast.success(`Business owner "${result.businessName}" updated successfully`);
      handleClose();
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to update business owner"));
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    dispatch(clearSelectedBusinessOwner());
    onClose();
  };

  const isSubmitting = isUpdating;

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl">
        <FormHeader
          title="Edit Business Owner"
          description="Update business owner information below"
          useImageTile
          imageUrl={ownerData?.logoBusinessUrl}
          avatarName={businessName || ownerData?.businessName}
          isCreate={false}
        />

        {isFetchingDetail ? (
          <div className="flex items-center justify-center flex-1 min-h-[300px]">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              {reduxError && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded">
                  <p className="text-xs text-destructive font-medium">{reduxError}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Owner Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold">
                    Owner Information <span className="text-destructive">*</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextField
                      control={control}
                      name="ownerFullName"
                      label="Full Name"
                      placeholder="Enter owner full name"
                      required
                      disabled={isSubmitting}
                      error={getFieldError(errors.ownerFullName)}
                    />
                    <TextField
                      control={control}
                      name="ownerEmail"
                      label="Email"
                      type="email"
                      placeholder="Enter email address"
                      disabled={isSubmitting}
                      error={getFieldError(errors.ownerEmail)}
                    />
                    <TextField
                      control={control}
                      name="ownerPhone"
                      label="Phone"
                      placeholder="Enter phone number"
                      disabled={isSubmitting}
                      error={getFieldError(errors.ownerPhone)}
                    />
                    <SelectField
                      control={control}
                      name="ownerAccountStatus"
                      label="Account Status"
                      placeholder="Select account status"
                      options={ACCOUNT_STATUS_CREATE_UPDATE}
                      disabled={isSubmitting}
                      error={getFieldError(errors.ownerAccountStatus)}
                    />
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold">
                    Business Information <span className="text-destructive">*</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextField
                      control={control}
                      name="businessName"
                      label="Business Name"
                      placeholder="Enter business name"
                      required
                      disabled={isSubmitting}
                      error={getFieldError(errors.businessName)}
                    />
                    <TextField
                      control={control}
                      name="businessEmail"
                      label="Business Email"
                      type="email"
                      placeholder="Enter business email"
                      disabled={isSubmitting}
                      error={getFieldError(errors.businessEmail)}
                    />
                    <TextField
                      control={control}
                      name="businessPhone"
                      label="Business Phone"
                      placeholder="Enter business phone"
                      disabled={isSubmitting}
                      error={getFieldError(errors.businessPhone)}
                    />
                    <SelectField
                      control={control}
                      name="businessStatus"
                      label="Business Status"
                      placeholder="Select business status"
                      options={BUSINESS_STATUS_CREATE_UPDATE}
                      disabled={isSubmitting}
                      error={getFieldError(errors.businessStatus)}
                    />
                    <div className="md:col-span-2">
                      <TextField
                        control={control}
                        name="businessAddress"
                        label="Business Address"
                        placeholder="Enter business address"
                        disabled={isSubmitting}
                        error={getFieldError(errors.businessAddress)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={false}
              updateMessage="Updating business owner..."
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={false}
                updateText="Update Business Owner"
                submittingUpdateText="Updating..."
              />
            </FormFooter>
          </form>
        )}
    </CustomModal>
  );
}
