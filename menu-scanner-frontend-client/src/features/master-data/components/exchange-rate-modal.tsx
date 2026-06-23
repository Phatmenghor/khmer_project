"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { CancelButton, SubmitButton } from "@/components/shared/button/custom-button";

import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode } from "@/constants/status/status";
import { SelectField } from "@/components/shared/form-field/select-field";
import { useAppDispatch, useAppSelector } from "@/store";
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
} from "../store/slice/exchange-rate-slice";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { ExchangeRateResponseModel } from "../store/models/response/exchange-rate-response";

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
  } = useForm<ExchangeRateFormData>({
    resolver: zodResolver(isCreate ? createExchangeRateSchema : updateExchangeRateSchema),
    defaultValues: {
      usdToKhrRate: undefined,
      status: "ACTIVE",
      notes: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (isCreate) {
      reset({
        usdToKhrRate: undefined,
        status: "ACTIVE",
        notes: "",
      });
    } else if (exchangeRate) {
      reset({
        usdToKhrRate: exchangeRate.usdToKhrRate || undefined,
        status: exchangeRate.status || "ACTIVE",
        notes: exchangeRate.notes || "",
      });
    }
  }, [isOpen, isCreate, exchangeRate, reset]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: ExchangeRateFormData) => {
    try {
      const payload: CreateExchangeRateData = {
        usdToKhrRate: data.usdToKhrRate,
        notes: data.notes,
        status: !isCreate && data.status ? data.status : undefined,
      };

      if (isCreate) {
        showToast.success(Messages.exchangeRate.created);
        handleClose();

        dispatch(createExchangeRateService(payload))
          .unwrap()
          .catch((error: unknown) => {
            showToast.error(
              (error as { message?: string })?.message || "Failed to create exchange rate"
            );
          });
      } else {
        if (exchangeRate) {
          const updatedRate: ExchangeRateResponseModel = {
            ...exchangeRate,
            usdToKhrRate: data.usdToKhrRate || exchangeRate.usdToKhrRate,
            status: (data.status || exchangeRate.status) as "ACTIVE" | "INACTIVE",
            notes: data.notes || exchangeRate.notes,
          };
          dispatch(updateExchangeRateInList(updatedRate));
        }

        showToast.success(Messages.exchangeRate.updated);
        handleClose();

        dispatch(updateExchangeRateService({ id: exchangeRate?.id!, payload }))
          .unwrap()
          .catch((error: unknown) => {
            showToast.error(
              (error as { message?: string })?.message || "Failed to update exchange rate"
            );
          });
      }
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message ||
          `Failed to ${isCreate ? "create" : "update"} exchange rate`
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
      <DialogContent className="w-full sm:max-w-3xl max-h-[92vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Exchange Rate" : "Edit Exchange Rate"}
          description={
            isCreate
              ? "Configure the USD to KHR exchange rate"
              : "Update exchange rate information below"
          }
          isCreate={isCreate}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-visible">
          <FormBody>
            {reduxError && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded mb-3">
                <p className="text-xs text-destructive font-medium">{reduxError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField
                control={control as any}
                name="usdToKhrRate"
                label="🇰🇭 USD To KHR Rate"
                placeholder="e.g. 4100"
                type="number"
                valueAsNumber
                disabled={isSubmitting}
                required
                error={errors.usdToKhrRate}
              />

              {!isCreate && (
                <SelectField
                  control={control as any}
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

            <TextareaField
              control={control as any}
              name="notes"
              label="Notes / Remark"
              placeholder="Enter any additional notes (optional)"
              rows={4}
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
