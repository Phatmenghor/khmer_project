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
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/commune-selector";
import {
  createCommuneService,
  fetchCommuneByIdService,
  updateCommuneService,
} from "../store/thunks/commune-thunks";
import {
  CommuneFormData,
  createCommuneSchema,
  updateCommuneSchema,
} from "../store/models/schema/commune-schema";
import {
  CreateCommuneRequest,
  UpdateCommuneRequest,
} from "../store/models/request/commune-request";
import { clearError, clearSelectedCommune } from "../store/slice/commune-slice";
import { ComboboxSelectDistrict } from "@/components/shared/combo-box/combobox-district";
import { DistrictResponseModel } from "../store/models/response/district-response";

type Props = {
  mode: ModalMode;
  communeId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function CommuneModal({
  isOpen,
  onClose,
  communeId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictResponseModel | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CommuneFormData>({
    resolver: zodResolver(
      isCreate ? createCommuneSchema : updateCommuneSchema
    ) as any,
    defaultValues: {
      communeCode: "",
      communeEn: "",
      communeKh: "",
      districtCode: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!communeId || !isOpen || isCreate) return;
      try {
        const resultAction = await dispatch(fetchCommuneByIdService(communeId));
        if (fetchCommuneByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;
          setSelectedDistrict(data.district || null);
          reset({
            id: data.id,
            communeCode: data.communeCode,
            communeEn: data.communeEn,
            communeKh: data.communeKh,
            districtCode: data.districtCode,
          });
        }
      } catch (error) {
        console.error("Error fetching commune data:", error);
      }
    };
    fetchData();
  }, [communeId, isOpen, isCreate, reset, dispatch]);

  useEffect(() => {
    if (isOpen && isCreate) {
      setSelectedDistrict(null);
      reset({ communeCode: "", communeEn: "", communeKh: "", districtCode: "" });
    }
  }, [isOpen, isCreate, reset]);

  useEffect(() => {
    if (isOpen) dispatch(clearError());
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CommuneFormData) => {
    try {
      if (isCreate) {
        const payload: CreateCommuneRequest = {
          communeCode: data.communeCode,
          communeEn: data.communeEn,
          communeKh: data.communeKh,
          districtCode: data.districtCode,
        };
        const result = await dispatch(createCommuneService(payload)).unwrap();
        showToast.success(`Commune "${result.communeEn}" created successfully`);
        handleClose();
      } else {
        const payload: UpdateCommuneRequest = {
          communeCode: data.communeCode,
          communeEn: data.communeEn,
          communeKh: data.communeKh,
          districtCode: data.districtCode,
        };
        const result = await dispatch(
          updateCommuneService({ communeId: data.id!, communeData: payload })
        ).unwrap();
        showToast.success(`Commune "${result.communeEn}" updated successfully`);
        handleClose();
      }
    } catch (error: any) {
      showToast.error(error || "Failed to save commune");
    }
  };

  const handleClose = () => {
    reset();
    setSelectedDistrict(null);
    dispatch(clearError());
    dispatch(clearSelectedCommune());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create Commune" : "Edit Commune"}
          description={
            isCreate
              ? "Fill out the form to create a new commune"
              : "Update commune information below"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="communeCode"
                      label="Commune Code"
                      placeholder="Enter Commune Code"
                      disabled={isSubmitting}
                      required
                      error={getFieldError(errors.communeCode)}
                    />
                    <TextField
                      control={control}
                      name="communeEn"
                      label="Commune EN"
                      placeholder="Enter Commune EN"
                      disabled={isSubmitting}
                      required
                      error={getFieldError(errors.communeEn)}
                    />
                    <TextField
                      control={control}
                      name="communeKh"
                      label="Commune KH"
                      placeholder="Enter Commune KH"
                      disabled={isSubmitting}
                      required
                      error={getFieldError(errors.communeKh)}
                    />
                    <div className="space-y-1">
                      <ComboboxSelectDistrict
                        dataSelect={selectedDistrict}
                        onChangeSelected={(district) => {
                          setSelectedDistrict(district);
                          setValue("districtCode", district?.districtCode || "", {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        label="District"
                        required
                        disabled={isSubmitting}
                        showAllOption={false}
                        placeholder="Select District"
                      />
                      {errors.districtCode && (
                        <p className="text-sm text-destructive">
                          {errors.districtCode.message}
                        </p>
                      )}
                    </div>
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating commune..."
              updateMessage="Updating commune..."
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Commune"
                updateText="Update Commune"
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
