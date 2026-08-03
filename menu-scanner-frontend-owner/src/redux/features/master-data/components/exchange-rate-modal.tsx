"use client";

import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalMode } from "@/constants/app-resource/status/status";
import { AppDefault } from "@/constants/app-resource/default/default";
import Loading from "@/components/shared/common/loading";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import {
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
} from "../store/slice/exchage-rate-slice";
import {
  CreateExchangeRateRequest,
  UpdateExchangeRateRequest,
} from "../store/models/request/exchange-rate-request";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/exchange-rate-selector";
import { getFieldError } from "@/utils/common/get-field-error";

type Props = {
  mode: ModalMode;
  exchangeId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function ExchangeRateModal({
  isOpen,
  onClose,
  exchangeId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const dispatch = useAppDispatch();

  // Get operations state from Redux
  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ExchangeRateFormData>({
    resolver: zodResolver(
      isCreate ? createExchangeRateSchema : updateExchangeRateSchema
    ) as any,
    defaultValues: {
      usdToKhrRate: 0,
      status: "ACTIVE",
      notes: "",
    },
    mode: "onChange",
  });

  // Fetch exchange-rate data for edit mode
  useEffect(() => {
    const fetchUserData = async () => {
      if (!exchangeId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(
          fetchExchangeRateByIdService(exchangeId)
        );

        if (fetchExchangeRateByIdService.fulfilled.match(resultAction)) {
          const resposne = resultAction.payload;

          reset({
            id: resposne.id,
            usdToKhrRate: resposne.usdToKhrRate,
            status: resposne.status || "ACTIVE",
            notes: resposne.notes,
          });
        }
      } catch (error) {
        console.error("Error fetching ex data:", error);
      }
    };

    fetchUserData();
  }, [exchangeId, isOpen, isCreate, reset, dispatch]);

  // Reset form for create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      reset({
        usdToKhrRate: 0,
        status: "ACTIVE",
        notes: "",
      });
    }
  }, [isOpen, isCreate, reset]);

  // Clear errors when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: ExchangeRateFormData) => {
    try {
      if (isCreate) {
        const payload: CreateExchangeRateRequest = {
          businessId: AppDefault.BUSINESS_ID,
          usdToKhrRate: data.usdToKhrRate!,
          notes: data?.notes,
          status: data.status || "ACTIVE",
        };

        const result = await dispatch(
          createExchangeRateService(payload)
        ).unwrap();

        showToast.success(
          `Exchange Rate "${result.name || result.email}" created successfully`
        );

        handleClose();
      } else {
        const payload: UpdateExchangeRateRequest = {
          usdToKhrRate: data.usdToKhrRate!,
          notes: data?.notes,
        };

        const result = await dispatch(
          updateExchangeRateService({
            exchangeRateId: data.id!,
            exchangeRateData: payload,
          })
        ).unwrap();

        showToast.success(
          `Exchange Rate "${
            result.fullName || result.email
          }" updated successfully`
        );

        handleClose();
      }
    } catch (error: any) {
      console.error("Error saving Exchange Rate:", error);
      showToast.error(error || "Failed to save Exchange Rate");
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
      <DialogContent className="w-full sm:max-w-md max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create Exchange Rate" : "Edit Exchange Rate"}
          description={
            isCreate
              ? "Configure the USD to KHR exchange rate"
              : "Update the USD to KHR exchange rate"
          }
          showAvatar={false}
          isCreate={isCreate}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-4 flex items-center justify-center min-h-[200px] flex-1">
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
                  <p className="text-xs text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  control={control}
                  name="usdToKhrRate"
                  label="USD To KHR Rate"
                  placeholder="e.g. 4100"
                  type="text"
                  disabled={isSubmitting}
                  required
                  error={getFieldError(errors.usdToKhrRate)}
                />

                <SelectField
                  control={control}
                  name="status"
                  label="Status"
                  disabled={isSubmitting}
                  error={getFieldError(errors.status)}
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                  ]}
                />
              </div>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
