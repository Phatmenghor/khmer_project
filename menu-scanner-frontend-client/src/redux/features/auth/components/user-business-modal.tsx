"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { PasswordField } from "@/components/shared/form-field/password-field";
import {
  CreateUserRequest,
  UpdateUserRequest,
} from "../store/models/request/users-request";
import {
  createUserSchema,
  updateUserSchema,
  UserFormData,
} from "../store/models/schema/user.schema";
import {
  fetchUserByIdService,
  createUserService,
  updateUserService,
} from "../store/thunks/users-thunks";
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
import {
  getArrayFieldError,
  getFieldError,
} from "@/utils/common/get-field-error";
import {
  AccountStatus,
  ModalMode,
  UserGropeType,
} from "@/constants/status/status";
import {
  ACCOUNT_STATUS_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { Loading } from "@/components/shared/common/loading";
import { fetchAllRoleService } from "../store/thunks/role-thunks";
import { selectRoleContent } from "../store/selectors/role-selectors";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { AppDefault } from "@/constants/app-resource/default/default";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
];

type Props = {
  mode: ModalMode;
  userId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function UserBusinessModal({
  isOpen,
  onClose,
  userId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const userData = useAppSelector(selectSelectedUser);
  const rolesContent = useAppSelector(selectRoleContent);
  const { isCreating, isUpdating } = operations;

  // Build role options from fetched data
  const roleOptions = rolesContent.map((role) => ({
    value: role.id,
    label: formatEnumValue(role.name),
  }));

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UserFormData>({
    resolver: zodResolver(
      isCreate ? createUserSchema : updateUserSchema,
    ) as any,
    defaultValues: {
      id: "",
      userIdentifier: "",
      email: "",
      firstName: "",
      lastName: "",
      nickname: "",
      phoneNumber: "",
      password: "",
      userType: UserGropeType.BUSINESS_USER,
      roles: [],
      accountStatus: AccountStatus.ACTIVE,
      gender: "",
      dateOfBirth: "",
      profileImageUrl: "",
      employeeId: "",
      position: "",
      department: "",
      employmentType: "",
      joinDate: "",
      leaveDate: "",
      shift: "",
      remark: "",
    },
    mode: "onChange",
  });

  const userIdentifier = watch("userIdentifier");
  const email = watch("email");

  // Fetch roles for the dropdown
  useEffect(() => {
    if (isOpen) {
      dispatch(
        fetchAllRoleService({
          pageNo: 1,
          pageSize: 100,
          includeAll: false,
          businessId: AppDefault.BUSINESS_ID,
          userTypes: [UserGropeType.BUSINESS_USER],
        }),
      );
    }
  }, [isOpen, dispatch]);

  // Fetch user data for edit mode
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
            nickname: data.nickname || "",
            phoneNumber: data.phoneNumber || "",
            accountStatus: data.accountStatus,
            roles: Array.isArray(data.roles) ? data.roles : [],
            gender: data.gender || "",
            dateOfBirth: data.dateOfBirth || "",
            profileImageUrl: data.profileImageUrl || "",
            employeeId: data.employeeId || "",
            position: data.position || "",
            department: data.department || "",
            employmentType: data.employmentType || "",
            joinDate: data.joinDate || "",
            leaveDate: data.leaveDate || "",
            shift: data.shift || "",
            remark: data.remark || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user business data:", error);
      }
    };

    fetchUserData();
  }, [userId, isOpen, isCreate, reset, dispatch]);

  // Reset form for create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      reset({
        id: "",
        userIdentifier: "",
        email: "",
        firstName: "",
        lastName: "",
        nickname: "",
        phoneNumber: "",
        password: "",
        userType: UserGropeType.BUSINESS_USER,
        roles: [],
        accountStatus: AccountStatus.ACTIVE,
        gender: "",
        dateOfBirth: "",
        profileImageUrl: "",
        employeeId: "",
        position: "",
        department: "",
        employmentType: "",
        joinDate: "",
        leaveDate: "",
        shift: "",
        remark: "",
      });
    }
  }, [isOpen, isCreate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
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
          nickname: data.nickname || undefined,
          phoneNumber: data.phoneNumber,
          userType: data.userType!,
          accountStatus: data.accountStatus,
          businessId: AppDefault.BUSINESS_ID,
          roles: data.roles,
          gender: data.gender || undefined,
          dateOfBirth: data.dateOfBirth || undefined,
          profileImageUrl: data.profileImageUrl || undefined,
          employeeId: data.employeeId || undefined,
          position: data.position || undefined,
          department: data.department || undefined,
          employmentType: data.employmentType || undefined,
          joinDate: data.joinDate || undefined,
          leaveDate: data.leaveDate || undefined,
          shift: data.shift || undefined,
          remark: data.remark || undefined,
        };

        const result = await dispatch(createUserService(payload)).unwrap();
        showToast.success(
          `User business "${
            result.userIdentifier || result.email
          }" created successfully`,
        );
        handleClose();
      } else {
        const payload: UpdateUserRequest = {
          firstName: data.firstName,
          lastName: data.lastName,
          nickname: data.nickname || undefined,
          phoneNumber: data.phoneNumber,
          accountStatus: data.accountStatus,
          businessId: AppDefault.BUSINESS_ID,
          roles: data.roles,
          gender: data.gender || undefined,
          dateOfBirth: data.dateOfBirth || undefined,
          profileImageUrl: data.profileImageUrl || undefined,
          employeeId: data.employeeId || undefined,
          position: data.position || undefined,
          department: data.department || undefined,
          employmentType: data.employmentType || undefined,
          joinDate: data.joinDate || undefined,
          leaveDate: data.leaveDate || undefined,
          shift: data.shift || undefined,
          remark: data.remark || undefined,
        };

        const result = await dispatch(
          updateUserService({ userId: data.id, userData: payload }),
        ).unwrap();
        showToast.success(
          `User business "${
            result.fullName || result.email
          }" updated successfully`,
        );
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error || `Failed to ${isCreate ? "create" : "update"} user business`,
      );
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
      <DialogContent className="max-w-7xl max-h-[92dvh] p-0 flex flex-col mx-auto w-full px-4 sm:px-6 lg:px-8">
        <FormHeader
          title={isCreate ? "Create New User Business" : "Edit User Business"}
          description={
            isCreate
              ? "Fill out the form to create a new user business account"
              : "Update user business information below"
          }
          avatarName={userIdentifier || email}
          avatarImageUrl={userData?.profileImageUrl}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-6 flex items-center justify-center min-h-[400px] flex-1">
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
                  <p className="text-sm text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              {/* Account Credentials */}
              {isCreate && (
                <div>
                  <h3 className="text-sm font-semibold mb-4 text-foreground">Account Credentials</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <TextField
                      control={control}
                      name="userIdentifier"
                      label="User Identifier"
                      placeholder="Enter user identifier"
                      required
                      disabled={isSubmitting}
                      error={errors.userIdentifier}
                    />

                    <TextField
                      control={control}
                      name="email"
                      label="Email"
                      type="email"
                      placeholder="Enter email address"
                      required
                      disabled={isSubmitting}
                      error={errors.email}
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
                      error={errors.password}
                    />
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-foreground">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <TextField
                    control={control}
                    name="firstName"
                    label="First Name"
                    placeholder="Enter first name"
                    required
                    disabled={isSubmitting}
                    error={errors.firstName}
                  />

                  <TextField
                    control={control}
                    name="lastName"
                    label="Last Name"
                    placeholder="Enter last name"
                    required
                    disabled={isSubmitting}
                    error={errors.lastName}
                  />

                  <TextField
                    control={control}
                    name="nickname"
                    label="Nickname"
                    placeholder="Enter nickname (optional)"
                    disabled={isSubmitting}
                    error={errors.nickname}
                  />

                  <TextField
                    control={control}
                    name="phoneNumber"
                    label="Phone Number"
                    placeholder="Enter phone number"
                    required
                    disabled={isSubmitting}
                    error={errors.phoneNumber}
                  />

                  <SelectField
                    control={control}
                    name="gender"
                    label="Gender"
                    placeholder="Select gender (optional)"
                    options={GENDER_OPTIONS}
                    disabled={isSubmitting}
                    error={errors.gender}
                  />

                  <TextField
                    control={control}
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    disabled={isSubmitting}
                    error={errors.dateOfBirth}
                  />

                  <TextField
                    control={control}
                    name="profileImageUrl"
                    label="Profile Image URL"
                    placeholder="Enter image URL (optional)"
                    disabled={isSubmitting}
                    error={errors.profileImageUrl}
                  />
                </div>
              </div>

              {/* Employment Information */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-foreground">Employment Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <TextField
                    control={control}
                    name="employeeId"
                    label="Employee ID"
                    placeholder="Enter employee ID (optional)"
                    disabled={isSubmitting}
                    error={errors.employeeId}
                  />

                  <TextField
                    control={control}
                    name="position"
                    label="Position"
                    placeholder="Enter position (optional)"
                    disabled={isSubmitting}
                    error={errors.position}
                  />

                  <TextField
                    control={control}
                    name="department"
                    label="Department"
                    placeholder="Enter department (optional)"
                    disabled={isSubmitting}
                    error={errors.department}
                  />

                  <SelectField
                    control={control}
                    name="employmentType"
                    label="Employment Type"
                    placeholder="Select employment type (optional)"
                    options={EMPLOYMENT_TYPE_OPTIONS}
                    disabled={isSubmitting}
                    error={errors.employmentType}
                  />

                  <TextField
                    control={control}
                    name="joinDate"
                    label="Join Date"
                    type="date"
                    disabled={isSubmitting}
                    error={errors.joinDate}
                  />

                  <TextField
                    control={control}
                    name="leaveDate"
                    label="Leave Date"
                    type="date"
                    disabled={isSubmitting}
                    error={errors.leaveDate}
                  />

                  <TextField
                    control={control}
                    name="shift"
                    label="Shift"
                    placeholder="Enter shift (optional)"
                    disabled={isSubmitting}
                    error={errors.shift}
                  />
                </div>
              </div>

              {/* System & Roles */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-foreground">System & Roles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <SelectField
                    control={control}
                    name="roles"
                    label="User Role"
                    placeholder="Select user role"
                    options={roleOptions}
                    required
                    disabled={isSubmitting || roleOptions.length === 0}
                    error={getArrayFieldError(errors.roles)}
                    onValueChange={(value) => {
                      setValue("roles", [value], {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />

                  <SelectField
                    control={control}
                    name="accountStatus"
                    label="Account Status"
                    placeholder="Select account status"
                    options={ACCOUNT_STATUS_CREATE_UPDATE}
                    required
                    disabled={isSubmitting}
                    error={errors.accountStatus}
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-foreground">Additional Information</h3>
                <TextareaField
                  control={control}
                  name="remark"
                  label="Remark"
                  placeholder="Enter any remarks (optional)"
                  rows={3}
                  disabled={isSubmitting}
                  error={errors.remark}
                />
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating user..."
              updateMessage="Updating user..."
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create User"
                updateText="Update User"
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
