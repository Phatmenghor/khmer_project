"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Loading from "@/components/shared/common/loading";
import { TextField } from "@/components/shared/form-field/text-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { getFieldError } from "@/utils/common/get-field-error";
import {
  selectError,
  selectOperations,
} from "../store/selectors/business-owner-selectors";
import { clearError } from "../store/slice/business-owner-slice";
import {
  CreateBusinessOwnerData,
  createBusinessOwnerSchema,
} from "../store/models/schema/business-owner.schema";
import { createBusinessOwnerService } from "../store/thunks/business-owner-thunks";
import {
  selectAllSubscriptionPlans,
  selectIsLoading as selectPlanLoading,
} from "@/redux/features/master-data/store/selectors/subscription-plan-selector";
import { fetchAllSubscriptionPlansService } from "@/redux/features/master-data/store/thunks/subscription-plan-thunks";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateBusinessOwnerModal({ isOpen, onClose }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const reduxError = useAppSelector(selectError);
  const { isCreating } = operations;

  const allPlans = useAppSelector(selectAllSubscriptionPlans);
  const planOptions = (allPlans?.content ?? []).map((p) => ({
    value: p.id,
    label: `${p.name} — $${p.price}`,
  }));

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<CreateBusinessOwnerData>({
    resolver: zodResolver(createBusinessOwnerSchema),
    defaultValues: {
      ownerUserIdentifier: "",
      ownerEmail: "",
      ownerPassword: "",
      ownerFullName: "",
      ownerPhone: "",
      businessName: "",
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      planId: "",
      paymentAmount: undefined,
      paymentMethod: "",
      paymentReference: "",
      paymentNotes: "",
    },
    mode: "onChange",
  });

  const businessName = watch("businessName");

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
      reset();
      dispatch(fetchAllSubscriptionPlansService({ pageNo: 1, pageSize: 100 }));
    }
  }, [isOpen, dispatch, reset]);

  const onSubmit = async (data: CreateBusinessOwnerData) => {
    try {
      const result = await dispatch(
        createBusinessOwnerService({
          ownerUserIdentifier: data.ownerUserIdentifier,
          ownerEmail: data.ownerEmail,
          ownerPassword: data.ownerPassword,
          ownerFullName: data.ownerFullName,
          ownerPhone: data.ownerPhone,
          businessName: data.businessName,
          businessEmail: data.businessEmail,
          businessPhone: data.businessPhone,
          businessAddress: data.businessAddress,
          planId: data.planId || undefined,
          paymentAmount: data.paymentAmount,
          paymentMethod: data.paymentMethod || undefined,
          paymentReference: data.paymentReference || undefined,
          paymentNotes: data.paymentNotes || undefined,
        })
      ).unwrap();

      showToast.success(
        `Business owner "${result.businessName}" created successfully`
      );
      handleClose();
    } catch (error: any) {
      showToast.error(error || "Failed to create business owner");
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title="Create New Business Owner"
          description="Fill out the form to register a new business owner account"
          avatarName={businessName}
          showAvatar={true}
          isCreate={true}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <FormBody>
            {reduxError && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {/* Account Credentials */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Account Credentials <span className="text-destructive">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    control={control}
                    name="ownerUserIdentifier"
                    label="User Identifier"
                    placeholder="Enter user identifier"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.ownerUserIdentifier)}
                  />
                  <TextField
                    control={control}
                    name="ownerEmail"
                    label="Email"
                    type="email"
                    placeholder="Enter email address"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.ownerEmail)}
                  />
                  <PasswordField
                    control={control}
                    name="ownerPassword"
                    label="Password"
                    placeholder="Enter password"
                    required
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    disabled={isCreating}
                    error={getFieldError(errors.ownerPassword)}
                  />
                </div>
              </div>

              {/* Owner Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Owner Information <span className="text-destructive">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    control={control}
                    name="ownerFullName"
                    label="Full Name"
                    placeholder="Enter owner full name"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.ownerFullName)}
                  />
                  <TextField
                    control={control}
                    name="ownerPhone"
                    label="Phone"
                    placeholder="Enter phone number"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.ownerPhone)}
                  />
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Business Information <span className="text-destructive">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    control={control}
                    name="businessName"
                    label="Business Name"
                    placeholder="Enter business name"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.businessName)}
                  />
                  <TextField
                    control={control}
                    name="businessEmail"
                    label="Business Email"
                    type="email"
                    placeholder="Enter business email"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.businessEmail)}
                  />
                  <TextField
                    control={control}
                    name="businessPhone"
                    label="Business Phone"
                    placeholder="Enter business phone"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.businessPhone)}
                  />
                  <TextField
                    control={control}
                    name="businessAddress"
                    label="Business Address"
                    placeholder="Enter business address"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.businessAddress)}
                  />
                </div>
              </div>

              {/* Subscription Plan (optional) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Subscription Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    control={control}
                    name="planId"
                    label="Subscription Plan"
                    placeholder="Select a plan (optional)"
                    options={planOptions}
                    disabled={isCreating}
                    error={getFieldError(errors.planId)}
                  />
                </div>
              </div>
            </div>
          </FormBody>

          <FormFooter
            isSubmitting={isCreating}
            isDirty={isDirty}
            isCreate={true}
            createMessage="Creating business owner..."
          >
            <CancelButton onClick={handleClose} disabled={isCreating} />
            <SubmitButton
              isSubmitting={isCreating}
              isDirty={isDirty}
              isCreate={true}
              createText="Create Business Owner"
              submittingCreateText="Creating..."
            />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
