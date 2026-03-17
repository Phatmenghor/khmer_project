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
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import {
  selectError,
  selectIsFetchingDetail,
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
  fetchExchangeRateByIdService,
  updateExchangeRateService,
} from "../store/thunks/exchange-rate-thunks";
import {
  clearError,
  clearSelectedExchangeRate,
} from "../store/slice/exchange-rate-slice";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { Loading } from "@/components/shared/common/loading";

type Props = {
  mode: ModalMode;
  exchangeRateId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function ExchangeRateModal({
  isOpen,
  onClose,
  exchangeRateId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
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
      usdToThbRate: undefined,
      usdToVndRate: undefined,
      notes: "",
    },
    mode: "onChange",
  });

  // Reset form when modal opens in create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      reset({
        usdToKhrRate: undefined,
        usdToCnyRate: undefined,
        usdToThbRate: undefined,
        usdToVndRate: undefined,
        notes: "",
      });
    }
  }, [isOpen, isCreate, reset]);

  // Fetch exchange rate data for edit mode
  useEffect(() => {
    const fetchExchangeRateData = async () => {
      if (!exchangeRateId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(
          fetchExchangeRateByIdService(exchangeRateId),
        );

        if (fetchExchangeRateByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            usdToKhrRate: data?.usdToKhrRate || undefined,
            usdToCnyRate: data?.usdToCnyRate || undefined,
            usdToThbRate: data?.usdToThbRate || undefined,
            usdToVndRate: data?.usdToVndRate || undefined,
            notes: data?.notes || "",
          });
        }
      } catch (error) {
        console.error("Error fetching exchange rate data:", error);
      }
    };

    fetchExchangeRateData();
  }, [exchangeRateId, isOpen, isCreate, reset, dispatch]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreateExchangeRateData) => {
    try {
      const payload: CreateExchangeRateData = {
        usdToKhrRate: data.usdToKhrRate,
        usdToCnyRate: data.usdToCnyRate,
        usdToThbRate: data.usdToThbRate,
        usdToVndRate: data.usdToVndRate,
        notes: data.notes,
      };

      if (isCreate) {
        await dispatch(createExchangeRateService(payload)).unwrap();
        showToast.success("Exchange rate created successfully");
        handleClose();
      } else {
        await dispatch(
          updateExchangeRateService({
            id: exchangeRateId!,
            payload,
          }),
        ).unwrap();
        showToast.success("Exchange rate updated successfully");
        handleClose();
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
                name="usdToThbRate"
                label="USD To THB Rate"
                placeholder="Enter USD to THB rate (optional)"
                type="number"
                valueAsNumber
                disabled={isSubmitting}
                error={errors.usdToThbRate}
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
