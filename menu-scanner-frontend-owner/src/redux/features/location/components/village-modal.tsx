"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalMode } from "@/constants/app-resource/status/status";
import Loading from "@/components/shared/common/loading";
import { TextField } from "@/components/shared/form-field/text-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { getFieldError } from "@/utils/common/get-field-error";
import {
  createVillageService,
  fetchVillageByIdService,
  updateVillageService,
} from "../store/thunks/village-thunks";
import {
  createVillageSchema,
  updateVillageSchema,
  VillageFormData,
} from "../store/models/schema/village-schema";
import {
  CreateVillageRequest,
  UpdateVillageRequest,
} from "../store/models/request/village-request";
import { clearError, clearSelectedVillage } from "../store/slice/village-slice";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/vaillage-selector";
import { ComboboxSelectCommune } from "@/components/shared/combo-box/combobox-commune";
import { CommuneResponseModel } from "../store/models/response/commune-response";

type Props = {
  mode: ModalMode;
  villageId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function VillageModal({
  isOpen,
  onClose,
  villageId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const [selectedCommune, setSelectedCommune] =
    useState<CommuneResponseModel | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<VillageFormData>({
    resolver: zodResolver(
      isCreate ? createVillageSchema : updateVillageSchema
    ) as any,
    defaultValues: {
      villageCode: "",
      villageEn: "",
      villageKh: "",
      communeCode: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!villageId || !isOpen || isCreate) return;
      try {
        const resultAction = await dispatch(fetchVillageByIdService(villageId));
        if (fetchVillageByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;
          setSelectedCommune(data.commune || null);
          reset({
            id: data.id,
            communeCode: data.communeCode,
            villageCode: data.villageCode,
            villageEn: data.villageEn,
            villageKh: data.villageKh,
          });
        }
      } catch (error) {
        console.error("Error fetching village data:", error);
      }
    };
    fetchData();
  }, [villageId, isOpen, isCreate, reset, dispatch]);

  useEffect(() => {
    if (isOpen && isCreate) {
      setSelectedCommune(null);
      reset({ villageCode: "", villageEn: "", villageKh: "", communeCode: "" });
    }
  }, [isOpen, isCreate, reset]);

  useEffect(() => {
    if (isOpen) dispatch(clearError());
  }, [isOpen, dispatch]);

  const onSubmit = async (data: VillageFormData) => {
    try {
      if (isCreate) {
        const payload: CreateVillageRequest = {
          communeCode: data.communeCode,
          villageCode: data.villageCode,
          villageEn: data.villageEn,
          villageKh: data.villageKh,
        };
        const result = await dispatch(createVillageService(payload)).unwrap();
        showToast.success(`Village "${result.villageEn}" created successfully`);
        handleClose();
      } else {
        const payload: UpdateVillageRequest = {
          communeCode: data.communeCode,
          villageCode: data.villageCode,
          villageEn: data.villageEn,
          villageKh: data.villageKh,
        };
        const result = await dispatch(
          updateVillageService({ villageId: data.id!, villageData: payload })
        ).unwrap();
        showToast.success(`Village "${result.villageEn}" updated successfully`);
        handleClose();
      }
    } catch (error: any) {
      showToast.error(error || "Failed to save village");
    }
  };

  const handleClose = () => {
    reset();
    setSelectedCommune(null);
    dispatch(clearError());
    dispatch(clearSelectedVillage());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create Village" : "Edit Village"}
          description={
            isCreate
              ? "Fill out the form to create a new village"
              : "Update village information below"
          }
          showAvatar={false}
          isCreate={isCreate}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-6 flex items-center justify-center min-h-[300px] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              {reduxError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm text-destructive font-medium">{reduxError}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Village Details <span className="text-destructive">*</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="villageCode"
                      label="Village Code"
                      placeholder="Enter Village Code"
                      disabled={isSubmitting}
                      required
                      error={getFieldError(errors.villageCode)}
                    />
                    <TextField
                      control={control}
                      name="villageEn"
                      label="Village EN"
                      placeholder="Enter Village EN"
                      disabled={isSubmitting}
                      required
                      error={getFieldError(errors.villageEn)}
                    />
                    <TextField
                      control={control}
                      name="villageKh"
                      label="Village KH"
                      placeholder="Enter Village KH"
                      disabled={isSubmitting}
                      required
                      error={getFieldError(errors.villageKh)}
                    />
                    <div className="space-y-1">
                      <ComboboxSelectCommune
                        dataSelect={selectedCommune}
                        onChangeSelected={(commune) => {
                          setSelectedCommune(commune);
                          setValue("communeCode", commune?.communeCode || "", {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        label="Commune"
                        required
                        disabled={isSubmitting}
                        showAllOption={false}
                        placeholder="Select Commune"
                      />
                      {errors.communeCode && (
                        <p className="text-sm text-destructive">
                          {errors.communeCode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating village..."
              updateMessage="Updating village..."
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Village"
                updateText="Update Village"
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
