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
} from "../store/selectors/district-selector";
import {
  createDistrictService,
  fetchDistrictByIdService,
  updateDistrictService,
} from "../store/thunks/district-thunks";
import {
  createDistrictSchema,
  DistrictFormData,
  updateDistrictSchema,
} from "../store/models/schema/district-schema";
import {
  CreateDistrictRequest,
  UpdateDistrictRequest,
} from "../store/models/request/district-request";
import {
  clearError,
  clearSelectedDistrict,
} from "../store/slice/district-slice";
import { ComboboxSelectProvince } from "@/components/shared/combo-box/combobox-province";
import { ProvinceResponseModel } from "../store/models/response/province-response";

type Props = {
  mode: ModalMode;
  districtId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function DistrictModal({
  isOpen,
  onClose,
  districtId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const [selectedProvince, setSelectedProvince] =
    useState<ProvinceResponseModel | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<DistrictFormData>({
    resolver: zodResolver(
      isCreate ? createDistrictSchema : updateDistrictSchema
    ) as any,
    defaultValues: {
      districtCode: "",
      districtEn: "",
      districtKh: "",
      provinceCode: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!districtId || !isOpen || isCreate) return;
      try {
        const resultAction = await dispatch(fetchDistrictByIdService(districtId));
        if (fetchDistrictByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;
          setSelectedProvince(data.province || null);
          reset({
            id: data.id,
            districtCode: data.districtCode,
            districtEn: data.districtEn,
            districtKh: data.districtKh,
            provinceCode: data.provinceCode,
          });
        }
      } catch (error) {
        console.error("Error fetching district data:", error);
      }
    };
    fetchData();
  }, [districtId, isOpen, isCreate, reset, dispatch]);

  useEffect(() => {
    if (isOpen && isCreate) {
      setSelectedProvince(null);
      reset({ districtCode: "", districtEn: "", districtKh: "", provinceCode: "" });
    }
  }, [isOpen, isCreate, reset]);

  useEffect(() => {
    if (isOpen) dispatch(clearError());
  }, [isOpen, dispatch]);

  const onSubmit = async (data: DistrictFormData) => {
    try {
      if (isCreate) {
        const payload: CreateDistrictRequest = {
          districtCode: data.districtCode,
          districtEn: data.districtEn,
          districtKh: data.districtKh,
          provinceCode: data.provinceCode,
        };
        const result = await dispatch(createDistrictService(payload)).unwrap();
        showToast.success(`District "${result.districtEn}" created successfully`);
        handleClose();
      } else {
        const payload: UpdateDistrictRequest = {
          districtCode: data.districtCode,
          districtEn: data.districtEn,
          districtKh: data.districtKh,
          provinceCode: data.provinceCode,
        };
        const result = await dispatch(
          updateDistrictService({ districtId: data.id!, districtData: payload })
        ).unwrap();
        showToast.success(`District "${result.districtEn}" updated successfully`);
        handleClose();
      }
    } catch (error: any) {
      showToast.error(error || "Failed to save district");
    }
  };

  const handleClose = () => {
    reset();
    setSelectedProvince(null);
    dispatch(clearError());
    dispatch(clearSelectedDistrict());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create District" : "Edit District"}
          description={
            isCreate
              ? "Fill out the form to create a new district"
              : "Update district information below"
          }
          showAvatar={false}
          isCreate={isCreate}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-4 flex items-center justify-center min-h-[300px] flex-1">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextField
                      control={control}
                      name="districtCode"
                      label="District Code"
                      placeholder="Enter District Code"
                      disabled={isSubmitting}
                      required
                      error={getFieldError(errors.districtCode)}
                    />
                    <TextField
                      control={control}
                      name="districtEn"
                      label="District EN"
                      placeholder="Enter District EN"
                      disabled={isSubmitting}
                      required
                      error={getFieldError(errors.districtEn)}
                    />
                    <TextField
                      control={control}
                      name="districtKh"
                      label="District KH"
                      placeholder="Enter District KH"
                      disabled={isSubmitting}
                      required
                      error={getFieldError(errors.districtKh)}
                    />
                    <div className="space-y-1">
                      <ComboboxSelectProvince
                        dataSelect={selectedProvince}
                        onChangeSelected={(province) => {
                          setSelectedProvince(province);
                          setValue("provinceCode", province?.provinceCode || "", {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        label="Province"
                        required
                        disabled={isSubmitting}
                        showAllOption={false}
                        placeholder="Select Province"
                      />
                      {errors.provinceCode && (
                        <p className="text-xs text-destructive">
                          {errors.provinceCode.message}
                        </p>
                      )}
                    </div>
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating district..."
              updateMessage="Updating district..."
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create District"
                updateText="Update District"
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
