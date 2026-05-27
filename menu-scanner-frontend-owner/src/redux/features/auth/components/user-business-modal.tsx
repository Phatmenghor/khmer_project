"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalMode, UserGropeType, AccountStatus } from "@/constants/app-resource/status/status";
import {
  ACCOUNT_STATUS_CREATE_UPDATE,
  GENDER_OPTIONS,
} from "@/constants/app-resource/status/create-update-status";
import { fetchAllRolesListService } from "../store/thunks/role-thunks";
import { selectRolesList } from "../store/selectors/role-selectors";
import { formatEnumLabel } from "@/utils/common/enum-convert";
import Loading from "@/components/shared/common/loading";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DatePickerField } from "@/components/shared/form-field/date-picker-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { CreateUserRequest, UpdateUserRequest } from "../store/models/request/users-request";
import { createUserSchema, updateUserSchema, UserFormData } from "../store/models/schema/user.schema";
import { fetchUserByIdService, createUserService, updateUserService } from "../store/thunks/users-thunks";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { clearError, clearSelectedUser } from "../store/slice/users-slice";
import {
  selectError,
  selectOperations,
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { getFieldError } from "@/utils/common/get-field-error";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";

type Props = {
  mode: ModalMode;
  userId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function UserBusinessModal({ isOpen, onClose, userId, mode }: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const [showPassword, setShowPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const dispatch = useAppDispatch();
  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const userData = useAppSelector(selectSelectedUser);
  const rolesList = useAppSelector(selectRolesList);
  const { isCreating, isUpdating } = operations;

  const roleOptions = rolesList
    .filter((role: any, index: number, self: any[]) =>
      self.findIndex((r) => r.name === role.name) === index
    )
    .map((role: any) => ({
      value: role.name,
      label: formatEnumLabel(role.name) ?? role.name,
    }));

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UserFormData>({
    resolver: zodResolver(isCreate ? createUserSchema : updateUserSchema) as any,
    defaultValues: {
      id: "",
      userIdentifier: "",
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      nickname: "",
      gender: "",
      dateOfBirth: "",
      profileImageUrl: "",
      password: "",
      userType: UserGropeType.BUSINESS_USER,
      roles: [],
      accountStatus: AccountStatus.ACTIVE,
      remark: "",
    },
    mode: "onChange",
  });

  const userIdentifier = watch("userIdentifier");
  const email = watch("email");

  useEffect(() => {
    if (isOpen) {
      dispatch(
        fetchAllRolesListService({
          includeAll: false,
          userTypes: [UserGropeType.BUSINESS_USER],
        })
      );
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !isOpen || isCreate) return;
      try {
        const resultAction = await dispatch(fetchUserByIdService(userId));
        if (fetchUserByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;
          reset({
            id: data.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            nickname: data.nickname || "",
            gender: data.gender || "",
            dateOfBirth: data.dateOfBirth || "",
            profileImageUrl: data.profileImageUrl || "",
            accountStatus: data.accountStatus,
            roles: Array.isArray(data.roles) ? data.roles : [],
            remark: data.remark || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [userId, isOpen, isCreate, reset, dispatch]);

  useEffect(() => {
    if (isOpen && isCreate) {
      reset({
        userIdentifier: "",
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        nickname: "",
        gender: "",
        dateOfBirth: "",
        profileImageUrl: "",
        password: "",
        userType: UserGropeType.BUSINESS_USER,
        roles: [],
        accountStatus: AccountStatus.ACTIVE,
        remark: "",
      });
    }
  }, [isOpen, isCreate, reset]);

  useEffect(() => {
    if (isOpen) dispatch(clearError());
  }, [isOpen, dispatch]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsUploadingImage(true);

      let profileImageUrl = data.profileImageUrl;
      if (profileImageUrl && isBase64Image(profileImageUrl)) {
        try {
          profileImageUrl = await uploadImage(profileImageUrl);
        } catch {
          showToast.error("Failed to upload profile image");
          setIsUploadingImage(false);
          return;
        }
      }

      setIsUploadingImage(false);

      if (isCreate) {
        const payload: CreateUserRequest = {
          userIdentifier: data.userIdentifier!,
          email: data.email,
          password: data.password!,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          nickname: data.nickname || undefined,
          gender: data.gender || undefined,
          dateOfBirth: data.dateOfBirth || undefined,
          profileImageUrl: profileImageUrl || undefined,
          userType: data.userType!,
          accountStatus: data.accountStatus,
          roles: data.roles,
          remark: data.remark || undefined,
        };
        const result = await dispatch(createUserService(payload)).unwrap();
        showToast.success(`Business user "${result.userIdentifier || result.email}" created successfully`);
        handleClose();
      } else {
        const payload: UpdateUserRequest = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || undefined,
          phoneNumber: data.phoneNumber,
          nickname: data.nickname || undefined,
          gender: data.gender || undefined,
          dateOfBirth: data.dateOfBirth || undefined,
          profileImageUrl: profileImageUrl || undefined,
          accountStatus: data.accountStatus,
          roles: data.roles,
          remark: data.remark || undefined,
        };
        const result = await dispatch(updateUserService({ userId: data.id, userData: payload })).unwrap();
        showToast.success(`Business user "${result.userIdentifier || result.email}" updated successfully`);
        handleClose();
      }
    } catch (error: any) {
      showToast.error(error || `Failed to ${isCreate ? "create" : "update"} business user`);
    }
  };

  const handleClose = () => {
    reset();
    setShowPassword(false);
    setIsUploadingImage(false);
    dispatch(clearError());
    dispatch(clearSelectedUser());
    onClose();
  };

  const isSubmitting = (isCreate ? isCreating : isUpdating) || isUploadingImage;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Business User" : "Edit Business User"}
          description={
            isCreate
              ? "Fill out the form to create a new business user account"
              : "Update business user information below"
          }
          avatarName={userIdentifier || email}
          avatarImageUrl={userData?.profileImageUrl}
          showAvatar={true}
          isCreate={isCreate}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-6 flex items-center justify-center min-h-[300px] flex-1">
            <Loading />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <FormBody>
              {reduxError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm text-destructive font-medium">{reduxError}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Account Credentials — create only */}
                {isCreate && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Account Credentials <span className="text-destructive">*</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        control={control}
                        name="userIdentifier"
                        label="User Identifier"
                        placeholder="Enter user identifier"
                        required
                        disabled={isSubmitting}
                        error={getFieldError(errors.userIdentifier)}
                      />
                      <TextField
                        control={control}
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="Enter email address"
                        required
                        disabled={isSubmitting}
                        error={getFieldError(errors.email)}
                      />
                      <PasswordField
                        control={control}
                        name="password"
                        label="Password"
                        placeholder="Enter password"
                        required
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                        error={getFieldError(errors.password)}
                      />
                      <SelectField
                        control={control}
                        name="roles"
                        label="Role"
                        placeholder="Select role"
                        options={roleOptions}
                        required
                        disabled={isSubmitting}
                        error={getFieldError(errors.roles)}
                        onValueChange={(value) =>
                          setValue("roles", [value], { shouldDirty: true, shouldValidate: true })
                        }
                      />
                      <SelectField
                        control={control}
                        name="accountStatus"
                        label="Account Status"
                        placeholder="Select account status"
                        options={ACCOUNT_STATUS_CREATE_UPDATE}
                        required
                        disabled={isSubmitting}
                        error={getFieldError(errors.accountStatus)}
                      />
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Personal Information <span className="text-destructive">*</span>
                  </h3>
                  <div className="space-y-4">
                    {/* Role + Status for edit mode */}
                    {!isCreate && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                          control={control}
                          name="roles"
                          label="Role"
                          placeholder="Select role"
                          options={roleOptions}
                          required
                          disabled={isSubmitting}
                          error={getFieldError(errors.roles)}
                          onValueChange={(value) =>
                            setValue("roles", [value], { shouldDirty: true, shouldValidate: true })
                          }
                        />
                        <SelectField
                          control={control}
                          name="accountStatus"
                          label="Account Status"
                          placeholder="Select account status"
                          options={ACCOUNT_STATUS_CREATE_UPDATE}
                          required
                          disabled={isSubmitting}
                          error={getFieldError(errors.accountStatus)}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        control={control}
                        name="firstName"
                        label="First Name"
                        placeholder="Enter first name"
                        required
                        disabled={isSubmitting}
                        error={getFieldError(errors.firstName)}
                      />
                      <TextField
                        control={control}
                        name="lastName"
                        label="Last Name"
                        placeholder="Enter last name"
                        required
                        disabled={isSubmitting}
                        error={getFieldError(errors.lastName)}
                      />
                      <TextField
                        control={control}
                        name="nickname"
                        label="Nickname"
                        placeholder="Enter nickname (optional)"
                        disabled={isSubmitting}
                        error={getFieldError(errors.nickname)}
                      />
                      <TextField
                        control={control}
                        name="phoneNumber"
                        label="Phone Number"
                        placeholder="Enter phone number"
                        required
                        disabled={isSubmitting}
                        error={getFieldError(errors.phoneNumber)}
                      />
                      <SelectField
                        control={control}
                        name="gender"
                        label="Gender"
                        placeholder="Select gender"
                        options={GENDER_OPTIONS}
                        disabled={isSubmitting}
                        error={getFieldError(errors.gender)}
                      />
                      <DatePickerField
                        control={control}
                        name="dateOfBirth"
                        label="Date of Birth"
                        placeholder="Select date of birth"
                        disabled={isSubmitting}
                        error={errors.dateOfBirth}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ClickableImageUpload
                        label="Profile Image"
                        value={watch("profileImageUrl") || ""}
                        onChange={(base64) =>
                          setValue("profileImageUrl", base64, { shouldDirty: true })
                        }
                        aspectRatio="square"
                        required={false}
                        disabled={isSubmitting}
                        error={errors.profileImageUrl}
                        placeholder="Click to upload profile image"
                      />
                    </div>
                  </div>
                </div>

                <TextareaField
                  control={control}
                  name="remark"
                  label="Remark"
                  placeholder="Enter any additional remark (optional)"
                  rows={3}
                  disabled={isSubmitting}
                  error={getFieldError(errors.remark)}
                />
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage={isUploadingImage ? "Uploading image..." : "Creating business user..."}
              updateMessage={isUploadingImage ? "Uploading image..." : "Updating business user..."}
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Business User"
                updateText="Update Business User"
                submittingCreateText={isUploadingImage ? "Uploading..." : "Creating..."}
                submittingUpdateText={isUploadingImage ? "Uploading..." : "Updating..."}
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
