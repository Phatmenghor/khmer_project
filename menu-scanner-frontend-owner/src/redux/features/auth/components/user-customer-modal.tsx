"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalMode, UserGropeType, UserRole, AccountStatus } from "@/constants/app-resource/status/status";
import {
  ACCOUNT_STATUS_CREATE_UPDATE,
  GENDER_OPTIONS,
} from "@/constants/app-resource/status/create-update-status";
import Loading from "@/components/shared/common/loading";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DatePickerField } from "@/components/shared/form-field/date-picker-field";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { PasswordField } from "@/components/shared/form-field/password-field";
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

type Props = {
  mode: ModalMode;
  userId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function UserCustomerModal({ isOpen, onClose, userId, mode }: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const userData = useAppSelector(selectSelectedUser);
  const { isCreating, isUpdating } = operations;

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
      password: "",
      userType: UserGropeType.CUSTOMER,
      roles: [UserRole.CUSTOMER],
      accountStatus: AccountStatus.ACTIVE,
      remark: "",
    },
    mode: "onChange",
  });

  const userIdentifier = watch("userIdentifier");
  const email = watch("email");

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
            accountStatus: data.accountStatus,
            roles: [UserRole.CUSTOMER],
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
        password: "",
        userType: UserGropeType.CUSTOMER,
        roles: [UserRole.CUSTOMER],
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
          userType: data.userType!,
          accountStatus: data.accountStatus,
          roles: data.roles,
          remark: data.remark || undefined,
        };
        const result = await dispatch(createUserService(payload)).unwrap();
        showToast.success(`Customer "${result.userIdentifier || result.email}" created successfully`);
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
          accountStatus: data.accountStatus,
          roles: data.roles,
          remark: data.remark || undefined,
        };
        const result = await dispatch(updateUserService({ userId: data.id, userData: payload })).unwrap();
        showToast.success(`Customer "${result.userIdentifier || result.email}" updated successfully`);
        handleClose();
      }
    } catch (error: any) {
      showToast.error(error || `Failed to ${isCreate ? "create" : "update"} customer`);
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    dispatch(clearSelectedUser());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Customer" : "Edit Customer"}
          description={
            isCreate
              ? "Fill out the form to create a new customer account"
              : "Update customer information below"
          }
          avatarName={userIdentifier || email}
          avatarImageUrl={userData?.profileImageUrl}
          showAvatar={true}
          isCreate={isCreate}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-4 flex items-center justify-center min-h-[300px] flex-1">
            <Loading />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <FormBody>
              {reduxError && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded">
                  <p className="text-xs text-destructive font-medium">{reduxError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                {isCreate ? (
                  <>
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
                      disabled={isSubmitting}
                      error={getFieldError(errors.email)}
                    />
                  </>
                ) : (
                  <>
                    <TextField
                      control={control}
                      name="email"
                      label="Email"
                      type="email"
                      placeholder="Enter email address"
                      disabled={isSubmitting}
                      error={getFieldError(errors.email)}
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
                  </>
                )}

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
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="Enter phone number"
                  required
                  disabled={isSubmitting}
                  error={getFieldError(errors.phoneNumber)}
                />

                <TextField
                  control={control}
                  name="nickname"
                  label="Nickname"
                  placeholder="Enter nickname (optional)"
                  disabled={isSubmitting}
                  error={getFieldError(errors.nickname)}
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

                {isCreate && (
                  <PasswordField
                    control={control}
                    name="password"
                    label="Password"
                    placeholder="Enter password"
                    required
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    className="md:col-span-2"
                    disabled={isSubmitting}
                    error={getFieldError(errors.password)}
                  />
                )}
              </div>

              <TextareaField
                control={control}
                name="remark"
                label="Remark"
                placeholder="Enter any additional remark (optional)"
                rows={4}
                disabled={isSubmitting}
                error={getFieldError(errors.remark)}
              />
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating customer..."
              updateMessage="Updating customer..."
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Customer"
                updateText="Update Customer"
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
