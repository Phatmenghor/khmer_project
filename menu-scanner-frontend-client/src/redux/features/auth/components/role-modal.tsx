"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode, UserGropeType } from "@/constants/status/status";
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
import { AppDefault } from "@/constants/app-resource/default/default";

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

  const roleData = rolesContent.find(role => role.id === roleId);

  const {
    control: formControl,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<RoleFormData>({
    resolver: zodResolver(
      isCreate ? createRoleSchema : updateRoleSchema,
    ) as any,
    defaultValues: {
      id: "",
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  // Cast control to any for compatibility with field components
  const control = formControl as any;

  // Helper function to convert API format (UPPERCASE_WITH_UNDERSCORES) to display format (Title Case With Spaces)
  const convertApiFormatToDisplay = (name: string): string => {
    return name
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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
      reset({
        id: "",
        name: "",
        description: "",
      });
    }
  }, [isOpen, isCreate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: RoleFormData) => {
    try {
      // Convert name to uppercase with underscores for spaces
      const convertedName = data.name!
        .toUpperCase()
        .replace(/\s+/g, "_");

      if (isCreate) {
        const payload: CreateRoleRequest = {
          name: convertedName,
          description: data.description || "",
          businessId: AppDefault.BUSINESS_ID,
          userType: UserGropeType.BUSINESS_USER,
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
    } catch (error: any) {
      showToast.error(
        error || `Failed to ${isCreate ? "create" : "update"} role`,
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-sm p-0 flex flex-col">
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
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm text-destructive font-medium">
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
                disabled={isSubmitting}
                error={errors.name}
                pattern="[a-zA-Z ]"
              />

              <TextareaField
                control={control}
                name="description"
                label="Description"
                placeholder="Enter any description (optional)"
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
      </DialogContent>
    </Dialog>
  );
}
