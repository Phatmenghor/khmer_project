"use client";

import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode } from "@/constants/status/status";
import { SelectField } from "@/components/shared/form-field/select-field";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import {
  selectError,
  selectOperations,
} from "../store/selectors/exchange-rate-selector";
import {
  CreateExchangeRateData,
  createExchangeRateSchema,
  ExchangeRateFormData,
  updateExchangeRateSchema,
} from "../store/models/schema/exchange-rate-schema";
import {
  createExchangeRateService,
  updateExchangeRateService,
} from "../store/thunks/exchange-rate-thunks";
import {
  clearError,
  clearSelectedExchangeRate,
  updateExchangeRateInList,
  addExchangeRateToList,
} from "../store/slice/exchange-rate-slice";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { Loading } from "@/components/shared/common/loading";
import { ExchangeRateResponseModel } from "../store/models/response/exchange-rate-response";
import { selectSelectedExchangeRate } from "../store/selectors/exchange-rate-selector";

type Props = {
  mode: ModalMode;
  exchangeRate?: ExchangeRateResponseModel | null;
  onClose: () => void;
  isOpen: boolean;
};

export default function ExchangeRateModal({
  isOpen,
  onClose,
  exchangeRate,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ExchangeRateFormData, any, CreateExchangeRateData>({
    resolver: zodResolver(
      isCreate ? createExchangeRateSchema : updateExchangeRateSchema,
    ),
    defaultValues: {
      usdToKhrRate: undefined,
      usdToCnyRate: undefined,
      usdToVndRate: undefined,
      status: "ACTIVE",
      notes: "",
    },
    mode: "onChange",
  });

  // Reset form when modal opens in create mode or when exchangeRate changes
  useEffect(() => {
    if (!isOpen) return;

    if (isCreate) {
      reset({
        usdToKhrRate: undefined,
        usdToCnyRate: undefined,
        usdToVndRate: undefined,
        status: "ACTIVE",
        notes: "",
      });
    } else if (exchangeRate) {
      reset({
        usdToKhrRate: exchangeRate.usdToKhrRate || undefined,
        usdToCnyRate: exchangeRate.usdToCnyRate || undefined,
        usdToVndRate: exchangeRate.usdToVndRate || undefined,
        status: exchangeRate.status || "ACTIVE",
        notes: exchangeRate.notes || "",
      });
    }
  }, [isOpen, isCreate, exchangeRate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreateExchangeRateData) => {
    try {
      const payload: any = {
        usdToKhrRate: data.usdToKhrRate,
        usdToCnyRate: data.usdToCnyRate,
        usdToVndRate: data.usdToVndRate,
        notes: data.notes,
      };

      // Add status only when updating (not for create)
      if (!isCreate && data.status) {
        payload.status = data.status;
      }

      if (isCreate) {
        // Optimistic update: close modal immediately
        showToast.success("Exchange rate created successfully");
        handleClose();

        // Make API call in background (fire and forget with error handling)
        dispatch(createExchangeRateService(payload))
          .unwrap()
          .catch((error: any) => {
            showToast.error(
              error?.message || "Failed to create exchange rate"
            );
          });
      } else {
        // Optimistic update: update local state and close modal immediately
        const updatedRate = {
          ...exchangeRate!,
          usdToKhrRate: data.usdToKhrRate,
          usdToCnyRate: data.usdToCnyRate,
          usdToVndRate: data.usdToVndRate,
          status: (data.status || exchangeRate?.status) as "ACTIVE" | "INACTIVE",
          notes: data.notes || "",
        };

        dispatch(updateExchangeRateInList(updatedRate));
        showToast.success("Exchange rate updated successfully");
        handleClose();

        // Make API call in background (fire and forget with error handling)
        dispatch(
          updateExchangeRateService({
            id: exchangeRate?.id!,
            payload,
          }),
        )
          .unwrap()
          .catch((error: any) => {
            showToast.error(
              error?.message || "Failed to update exchange rate"
            );
          });
      }
    } catch (error: any) {
      showToast.error(
        error?.message ||
          `Failed to ${isCreate ? "create" : "update"} exchange rate`,
      );
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    dispatch(clearSelectedExchangeRate());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Exchange Rate" : "Edit Exchange Rate"}
          description={
            isCreate
              ? "Configure exchange rates for different currencies"
              : "Update exchange rate information below"
          }
          isCreate={isCreate}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <FormBody>
            {/* Display Redux errors */}
            {reduxError && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mb-4">
                <p className="text-sm text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            {/* Exchange Rate Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                control={control}
                name="usdToKhrRate"
                label="USD To KHR Rate"
                placeholder="Enter USD to KHR rate"
                type="number"
                valueAsNumber
                disabled={isSubmitting}
                required
                error={errors.usdToKhrRate}
              />

              <TextField
                control={control}
                name="usdToCnyRate"
                label="USD To CNY Rate"
                placeholder="Enter USD to CNY rate (optional)"
                type="number"
                valueAsNumber
                disabled={isSubmitting}
                error={errors.usdToCnyRate}
              />

              <TextField
                control={control}
                name="usdToVndRate"
                label="USD To VND Rate"
                placeholder="Enter USD to VND rate (optional)"
                type="number"
                valueAsNumber
                disabled={isSubmitting}
                error={errors.usdToVndRate}
              />

              {!isCreate && (
                <SelectField
                  control={control}
                  name="status"
                  label="Status"
                  disabled={isSubmitting}
                  error={errors.status}
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                  ]}
                />
              )}
            </div>

            {/* Notes - Separate Row */}
            <TextareaField
              control={control}
              name="notes"
              label="Remark"
              placeholder="Enter any additional notes (optional)"
              rows={5}
              disabled={isSubmitting}
              error={errors.notes}
            />
          </FormBody>

          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            isCreate={isCreate}
            createMessage="Creating exchange rate..."
            updateMessage="Updating exchange rate..."
          >
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createText="Create Exchange Rate"
              updateText="Update Exchange Rate"
              submittingCreateText="Creating..."
              submittingUpdateText="Updating..."
            />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
