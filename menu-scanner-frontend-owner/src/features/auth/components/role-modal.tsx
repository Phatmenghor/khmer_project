"use client";

import React, { useEffect, useState } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { useAppDispatch, useAppSelector } from "@/store";
import { showToast } from "@/components/shared/common/show-toast";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode, UserGropeType } from "@/constants/app-resource/status/status";
import {
  selectError,
  selectOperations,
  selectRoleContent,
} from "../store/selectors/role-selectors";
import {
  createRoleSchema,
  RoleFormData,
  updateRoleSchema,
} from "../store/models/schema/role.schema";
import {
  createRoleService,
  updateRoleService,
} from "../store/thunks/role-thunks";
import { clearError, clearSelectedRole } from "../store/slice/role-slice";
import {
  CreateRoleRequest,
  UpdateRoleRequest,
} from "../store/models/request/role-request";

type Props = {
  mode: ModalMode;
  roleId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function RoleModal({ isOpen, onClose, roleId, mode }: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const rolesContent = useAppSelector(selectRoleContent);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const roleData = rolesContent.find((role) => role.id === roleId);

  const isPlatformOwnerRole = roleData?.name === "PLATFORM_OWNER";

  const {
    control: formControl,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<RoleFormData>({
    resolver: zodResolver(isCreate ? createRoleSchema : updateRoleSchema) as any,
    defaultValues: {
      id: "",
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  const control = formControl as any;

  const convertApiFormatToDisplay = (name: string): string => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    if (!roleId || !isOpen || isCreate || !roleData) return;
    reset({
      id: roleData.id,
      name: convertApiFormatToDisplay(roleData.name),
      description: roleData?.description || "",
    });
  }, [roleId, isOpen, isCreate, roleData, reset]);

  useEffect(() => {
    if (isOpen && isCreate) {
      reset({ id: "", name: "", description: "" });
    }
  }, [isOpen, isCreate, reset]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: RoleFormData) => {
    try {
      const convertedName = data.name!.toUpperCase().replace(/\s+/g, "_");

      if (isCreate) {
        const payload: CreateRoleRequest = {
          name: convertedName,
          description: data.description || "",
          businessId: "",
          userType: UserGropeType.PLATFORM_USER,
        };
        const result = await dispatch(createRoleService(payload)).unwrap();
        showToast.success(`Role "${result.name}" created successfully`);
        handleClose();
      } else {
        const payload: UpdateRoleRequest = {
          name: convertedName,
          description: data.description || "",
        };
        const result = await dispatch(
          updateRoleService({ roleId: data.id, roleData: payload }),
        ).unwrap();
        showToast.success(`Role "${result.name}" updated successfully`);
        handleClose();
      }
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message ||
          `Failed to ${isCreate ? "create" : "update"} role`,
      );
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    dispatch(clearSelectedRole());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="2xl">
        <FormHeader
          title={isCreate ? "Create New Role" : "Edit Role"}
          description={
            isCreate
              ? "Fill out the form to create a new role"
              : "Update role information below"
          }
          isCreate={isCreate}
        />

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

            <TextField
              control={control}
              name="name"
              label="Role Name"
              placeholder="Enter role name"
              required
              disabled={isSubmitting || (!isCreate && isPlatformOwnerRole)}
              error={errors.name}
              pattern="[a-zA-Z ]"
            />

            <TextareaField
              control={control}
              name="description"
              label="Description"
              placeholder="Enter description"
              rows={5}
              disabled={isSubmitting}
              error={errors.description}
            />
          </FormBody>

          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            isCreate={isCreate}
            createMessage="Creating role..."
            updateMessage="Updating role..."
          >
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createText="Create role"
              updateText="Update role"
              submittingCreateText="Creating..."
              submittingUpdateText="Updating..."
            />
          </FormFooter>
        </form>
    </CustomModal>
  );
}
