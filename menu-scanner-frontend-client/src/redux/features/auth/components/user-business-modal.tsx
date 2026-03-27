"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
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

const ADDRESS_TYPE_OPTIONS = [
  { value: "CURRENT", label: "Current" },
  { value: "PERMANENT", label: "Permanent" },
  { value: "OTHER", label: "Other" },
];

const DOCUMENT_TYPE_OPTIONS = [
  { value: "ID_CARD", label: "ID Card" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVER_LICENSE", label: "Driver License" },
  { value: "OTHER", label: "Other" },
];

const EDUCATION_LEVEL_OPTIONS = [
  { value: "PRIMARY", label: "Primary" },
  { value: "SECONDARY", label: "Secondary" },
  { value: "HIGH_SCHOOL", label: "High School" },
  { value: "BACHELOR", label: "Bachelor" },
  { value: "MASTER", label: "Master" },
  { value: "PHD", label: "PhD" },
  { value: "OTHER", label: "Other" },
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

  // Array field controls for complex data
  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control,
    name: "addresses" as any,
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: "emergencyContacts" as any,
  });

  const { fields: docFields, append: appendDoc, remove: removeDoc } = useFieldArray({
    control,
    name: "documents" as any,
  });

  const { fields: eduFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: "educations" as any,
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
            addresses: Array.isArray(data.addresses) ? data.addresses : [],
            emergencyContacts: Array.isArray(data.emergencyContacts) ? data.emergencyContacts : [],
            documents: Array.isArray(data.documents) ? data.documents : [],
            educations: Array.isArray(data.educations) ? data.educations : [],
          } as any);
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
        addresses: [],
        emergencyContacts: [],
        documents: [],
        educations: [],
      } as any);
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
          addresses: (data.addresses && data.addresses.length > 0) ? data.addresses : undefined,
          emergencyContacts: (data.emergencyContacts && data.emergencyContacts.length > 0) ? data.emergencyContacts : undefined,
          documents: (data.documents && data.documents.length > 0) ? data.documents : undefined,
          educations: (data.educations && data.educations.length > 0) ? data.educations : undefined,
        } as any;

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
          addresses: (data.addresses && data.addresses.length > 0) ? data.addresses : undefined,
          emergencyContacts: (data.emergencyContacts && data.emergencyContacts.length > 0) ? data.emergencyContacts : undefined,
          documents: (data.documents && data.documents.length > 0) ? data.documents : undefined,
          educations: (data.educations && data.educations.length > 0) ? data.educations : undefined,
        } as any;

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
      <DialogContent className="w-full sm:max-w-6xl max-h-[92dvh] p-0 flex flex-col">
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
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mb-4">
                  <p className="text-sm text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {/* Account Credentials */}
                {isCreate && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Account Credentials</h3>
                    <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Employment Information</h3>
                  <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">System & Roles</h3>
                  <div className="grid grid-cols-2 gap-4">
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

                {/* Addresses */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Addresses</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {addressFields.length > 0 ? `${addressFields.length} address(es) added` : "No addresses added"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendAddress({ addressType: "CURRENT", houseNo: "", street: "", village: "", commune: "", district: "", province: "", country: "" } as any)}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </div>

                  {addressFields.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">No addresses added</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addressFields.map((field, index) => (
                        <Card key={field.id}>
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">Address {index + 1}</CardTitle>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeAddress(index)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <SelectField
                                control={control}
                                name={`addresses.${index}.addressType`}
                                label="Address Type"
                                placeholder="Select type"
                                options={ADDRESS_TYPE_OPTIONS}
                                disabled={isSubmitting}
                                error={errors.addresses?.[index]?.addressType as any}
                              />
                              <TextField
                                control={control}
                                name={`addresses.${index}.houseNo`}
                                label="House No"
                                placeholder="Enter house number"
                                disabled={isSubmitting}
                                error={errors.addresses?.[index]?.houseNo as any}
                              />
                              <TextField
                                control={control}
                                name={`addresses.${index}.street`}
                                label="Street"
                                placeholder="Enter street"
                                disabled={isSubmitting}
                                error={errors.addresses?.[index]?.street as any}
                              />
                              <TextField
                                control={control}
                                name={`addresses.${index}.village`}
                                label="Village"
                                placeholder="Enter village"
                                disabled={isSubmitting}
                                error={errors.addresses?.[index]?.village as any}
                              />
                              <TextField
                                control={control}
                                name={`addresses.${index}.commune`}
                                label="Commune"
                                placeholder="Enter commune"
                                disabled={isSubmitting}
                                error={errors.addresses?.[index]?.commune as any}
                              />
                              <TextField
                                control={control}
                                name={`addresses.${index}.district`}
                                label="District"
                                placeholder="Enter district"
                                disabled={isSubmitting}
                                error={errors.addresses?.[index]?.district as any}
                              />
                              <TextField
                                control={control}
                                name={`addresses.${index}.province`}
                                label="Province"
                                placeholder="Enter province"
                                disabled={isSubmitting}
                                error={errors.addresses?.[index]?.province as any}
                              />
                              <TextField
                                control={control}
                                name={`addresses.${index}.country`}
                                label="Country"
                                placeholder="Enter country"
                                disabled={isSubmitting}
                                error={errors.addresses?.[index]?.country as any}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Emergency Contacts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Emergency Contacts</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {contactFields.length > 0 ? `${contactFields.length} contact(s) added` : "No emergency contacts"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendContact({ name: "", phone: "", relationship: "" } as any)}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>

                  {contactFields.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">No emergency contacts added</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contactFields.map((field, index) => (
                        <Card key={field.id}>
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">Contact {index + 1}</CardTitle>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeContact(index)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                              <TextField
                                control={control}
                                name={`emergencyContacts.${index}.name`}
                                label="Name"
                                placeholder="Enter name"
                                disabled={isSubmitting}
                                error={errors.emergencyContacts?.[index]?.name as any}
                              />
                              <TextField
                                control={control}
                                name={`emergencyContacts.${index}.phone`}
                                label="Phone"
                                placeholder="Enter phone"
                                disabled={isSubmitting}
                                error={errors.emergencyContacts?.[index]?.phone as any}
                              />
                              <TextField
                                control={control}
                                name={`emergencyContacts.${index}.relationship`}
                                label="Relationship"
                                placeholder="e.g., Father, Mother, Brother"
                                disabled={isSubmitting}
                                error={errors.emergencyContacts?.[index]?.relationship as any}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Documents</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {docFields.length > 0 ? `${docFields.length} document(s) added` : "No documents added"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendDoc({ type: "ID_CARD", number: "", fileUrl: "" } as any)}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </div>

                  {docFields.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">No documents added</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {docFields.map((field, index) => (
                        <Card key={field.id}>
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">Document {index + 1}</CardTitle>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeDoc(index)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                              <SelectField
                                control={control}
                                name={`documents.${index}.type`}
                                label="Document Type"
                                placeholder="Select type"
                                options={DOCUMENT_TYPE_OPTIONS}
                                disabled={isSubmitting}
                                error={errors.documents?.[index]?.type as any}
                              />
                              <TextField
                                control={control}
                                name={`documents.${index}.number`}
                                label="Document Number"
                                placeholder="Enter number"
                                disabled={isSubmitting}
                                error={errors.documents?.[index]?.number as any}
                              />
                              <TextField
                                control={control}
                                name={`documents.${index}.fileUrl`}
                                label="File URL"
                                placeholder="Enter file URL"
                                disabled={isSubmitting}
                                error={errors.documents?.[index]?.fileUrl as any}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Education</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {eduFields.length > 0 ? `${eduFields.length} education(s) added` : "No education added"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendEducation({ level: "HIGH_SCHOOL", schoolName: "", fieldOfStudy: "", startYear: "", endYear: "", isGraduated: false, certificateUrl: "" } as any)}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  </div>

                  {eduFields.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">No education added</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {eduFields.map((field, index) => (
                        <Card key={field.id}>
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">Education {index + 1}</CardTitle>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeEducation(index)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <SelectField
                                control={control}
                                name={`educations.${index}.level`}
                                label="Education Level"
                                placeholder="Select level"
                                options={EDUCATION_LEVEL_OPTIONS}
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.level as any}
                              />
                              <TextField
                                control={control}
                                name={`educations.${index}.schoolName`}
                                label="School/University Name"
                                placeholder="Enter name"
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.schoolName as any}
                              />
                              <TextField
                                control={control}
                                name={`educations.${index}.fieldOfStudy`}
                                label="Field of Study"
                                placeholder="Enter field"
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.fieldOfStudy as any}
                              />
                              <TextField
                                control={control}
                                name={`educations.${index}.startYear`}
                                label="Start Year"
                                type="date"
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.startYear as any}
                              />
                              <TextField
                                control={control}
                                name={`educations.${index}.endYear`}
                                label="End Year"
                                type="date"
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.endYear as any}
                              />
                              <TextField
                                control={control}
                                name={`educations.${index}.certificateUrl`}
                                label="Certificate URL"
                                placeholder="Enter URL"
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.certificateUrl as any}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
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
