"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { Button } from "@/components/ui/button";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
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
import { useAppDispatch, useAppSelector } from "@/store";
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
import {
  AddressType,
  ADDRESS_TYPE_OPTIONS,
  DocumentType,
  DOCUMENT_TYPE_OPTIONS,
  EducationLevel,
  EDUCATION_LEVEL_OPTIONS,
} from "@/constants/status/user-enums";
import {
  GENDER_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
} from "@/constants/form-options";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const userData = useAppSelector(selectSelectedUser);
  const rolesContent = useAppSelector(selectRoleContent);
  const { isCreating, isUpdating } = operations;


  const roleOptions = rolesContent.map((role) => ({
    value: role.name,
    label: formatEnumValue(role.name),
  }));

  const {
    control: formControl,
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
      businessId: "",
      addresses: [],
      emergencyContacts: [],
      documents: [],
      educations: [],
    },
    mode: "onChange",
  });


  const control = formControl as any;


  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: "addresses",
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control,
    name: "documents",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "educations",
  });

  const userIdentifier = watch("userIdentifier");
  const email = watch("email");


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
            businessId: data.businessId || "",
            addresses: Array.isArray(data.addresses) ? data.addresses : [],
            emergencyContacts: Array.isArray(data.emergencyContacts)
              ? data.emergencyContacts
              : [],
            documents: Array.isArray(data.documents) ? data.documents : [],
            educations: Array.isArray(data.educations)
              ? data.educations.map((edu: any) => ({
                  ...edu,
                  isGraduated: String(edu.isGraduated),
                }))
              : [],
          });
        }
      } catch (error) {
      }
    };

    fetchUserData();
  }, [userId, isOpen, isCreate, reset, dispatch]);


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
        businessId: "",
        addresses: [],
        emergencyContacts: [],
        documents: [],
        educations: [],
      });
    }
  }, [isOpen, isCreate, reset]);


  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsUploadingImage(true);


      let profileImageUrl = data.profileImageUrl;
      if (profileImageUrl && isBase64Image(profileImageUrl)) {
        try {
          profileImageUrl = await uploadImage(profileImageUrl);
        } catch (error) {
          showToast.error(Messages.profile.imageUploadFailed);
          setIsUploadingImage(false);
          return;
        }
      }


      const processedDocuments = await Promise.all(
        (data.documents || []).map(async (doc) => {
          let fileUrl = doc.fileUrl;
          if (fileUrl && isBase64Image(fileUrl)) {
            try {
              fileUrl = await uploadImage(fileUrl);
            } catch (error) {
              return null;
            }
          }
          return {
            id: doc.id,
            type: doc.type,
            number: doc.number,
            fileUrl,
          };
        }),
      );

      const validDocuments = processedDocuments.filter((doc) => doc !== null);


      const processedEducations = await Promise.all(
        (data.educations || []).map(async (edu) => {
          let certificateUrl = edu.certificateUrl;
          if (certificateUrl && isBase64Image(certificateUrl)) {
            try {
              certificateUrl = await uploadImage(certificateUrl);
            } catch (error) {
              return null;
            }
          }
          return {
            id: edu.id,
            level: edu.level,
            schoolName: edu.schoolName,
            fieldOfStudy: edu.fieldOfStudy,
            startYear: edu.startYear,
            endYear: edu.endYear,
            isGraduated: edu.isGraduated || false,
            certificateUrl,
          };
        }),
      );

      const validEducations = processedEducations.filter((edu) => edu !== null);

      setIsUploadingImage(false);

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
          profileImageUrl: profileImageUrl || undefined,
          employeeId: data.employeeId || undefined,
          position: data.position || undefined,
          department: data.department || undefined,
          employmentType: data.employmentType || undefined,
          joinDate: data.joinDate || undefined,
          leaveDate: data.leaveDate || undefined,
          shift: data.shift || undefined,
          remark: data.remark || undefined,
          addresses:
            addressFields.length > 0
              ? (data.addresses as any)
              : undefined,
          emergencyContacts:
            contactFields.length > 0
              ? (data.emergencyContacts as any)
              : undefined,
          documents:
            validDocuments.length > 0
              ? (validDocuments as any)
              : undefined,
          educations:
            validEducations.length > 0
              ? (validEducations as any)
              : undefined,
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
          profileImageUrl: profileImageUrl || undefined,
          employeeId: data.employeeId || undefined,
          position: data.position || undefined,
          department: data.department || undefined,
          employmentType: data.employmentType || undefined,
          joinDate: data.joinDate || undefined,
          leaveDate: data.leaveDate || undefined,
          shift: data.shift || undefined,
          remark: data.remark || undefined,
          addresses:
            addressFields.length > 0
              ? (data.addresses as any)
              : undefined,
          emergencyContacts:
            contactFields.length > 0
              ? (data.emergencyContacts as any)
              : undefined,
          documents:
            validDocuments.length > 0
              ? (validDocuments as any)
              : undefined,
          educations:
            validEducations.length > 0
              ? (validEducations as any)
              : undefined,
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
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message || `Failed to ${isCreate ? "create" : "update"} user business`,
      );
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
      <DialogContent className="w-full sm:max-w-7xl max-h-[92vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New User Business" : "Edit User Business"}
          description={
            isCreate
              ? "Fill out the form to create a new user business account"
              : "Update user business information below"
          }
          avatarName={userIdentifier || email}
          isCreate={isCreate}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-4 flex items-center justify-center min-h-[400px] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              {reduxError && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded mb-3">
                  <p className="text-xs text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {}
                {isCreate && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold">
                      Account Credentials <span className="text-red-500">*</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                      <TextField
                        control={control}
                        name="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        required
                        disabled={isSubmitting}
                        error={errors.password}
                      />

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
                          setValue("roles", [String(value)], {
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
                )}


                {}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold">
                    Personal Information <span className="text-red-500">*</span>
                  </h3>
                  <div className="space-y-3">
                    {}
                    {!isCreate && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                            setValue("roles", [String(value)], {
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
                    )}

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <TextField
                        control={control}
                        name="firstName"
                        label="First Name"
                        placeholder="Enter first name"
                        disabled={isSubmitting}
                        error={errors.firstName}
                      />

                      <TextField
                        control={control}
                        name="lastName"
                        label="Last Name"
                        placeholder="Enter last name"
                        disabled={isSubmitting}
                        error={errors.lastName}
                      />

                      <TextField
                        control={control}
                        name="nickname"
                        label="Nickname"
                        placeholder="Enter nickname"
                        disabled={isSubmitting}
                        error={errors.nickname}
                      />

                      <TextField
                        control={control}
                        name="phoneNumber"
                        label="Phone Number"
                        placeholder="Enter phone number"
                        disabled={isSubmitting}
                        error={errors.phoneNumber}
                      />

                      <SelectField
                        control={control}
                        name="gender"
                        label="Gender"
                        placeholder="Select gender"
                        options={GENDER_OPTIONS}
                        disabled={isSubmitting}
                        error={errors.gender}
                      />

                      <DateTimePickerField
                        control={control}
                        name="dateOfBirth"
                        label="Date of Birth"
                        mode="date"
                        placeholder="Select date of birth"
                        disabled={isSubmitting}
                        error={errors.dateOfBirth}
                      />
                    </div>

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ClickableImageUpload
                        label="Profile Image"
                        value={watch("profileImageUrl") || ""}
                        onChange={(base64) => setValue("profileImageUrl", base64)}
                        aspectRatio="square"
                        required={false}
                        disabled={isSubmitting}
                        error={errors.profileImageUrl}
                        placeholder="Click to upload profile image"
                      />
                    </div>
                  </div>
                </div>

                {}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold">
                    Employment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextField
                      control={control}
                      name="employeeId"
                      label="Employee ID"
                      placeholder="Enter employee ID"
                      disabled={isSubmitting}
                      error={errors.employeeId}
                    />

                    <TextField
                      control={control}
                      name="position"
                      label="Position"
                      placeholder="Enter position"
                      disabled={isSubmitting}
                      error={errors.position}
                    />

                    <TextField
                      control={control}
                      name="department"
                      label="Department"
                      placeholder="Enter department"
                      disabled={isSubmitting}
                      error={errors.department}
                    />

                    <SelectField
                      control={control}
                      name="employmentType"
                      label="Employment Type"
                      placeholder="Select employment type"
                      options={EMPLOYMENT_TYPE_OPTIONS}
                      disabled={isSubmitting}
                      error={errors.employmentType}
                    />

                    <DateTimePickerField
                      control={control}
                      name="joinDate"
                      label="Join Date"
                      mode="date"
                      placeholder="Select join date"
                      disabled={isSubmitting}
                      error={errors.joinDate}
                    />

                    <DateTimePickerField
                      control={control}
                      name="leaveDate"
                      label="Leave Date"
                      mode="date"
                      placeholder="Select leave date"
                      disabled={isSubmitting}
                      error={errors.leaveDate}
                    />

                    <TextField
                      control={control}
                      name="shift"
                      label="Shift"
                      placeholder="Enter shift"
                      disabled={isSubmitting}
                      error={errors.shift}
                    />
                  </div>
                </div>

                {}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold">Addresses</h3>
                      <p className="text-xs text-muted-foreground">
                        {addressFields.length > 0
                          ? `${addressFields.length} address${
                              addressFields.length > 1 ? "es" : ""
                            } added`
                          : "No addresses added"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendAddress({
                          id: undefined,
                          addressType: AddressType.CURRENT,
                          houseNo: "",
                          street: "",
                          village: "",
                          commune: "",
                          district: "",
                          province: "",
                          country: "",
                        })
                      }
                      disabled={isSubmitting}
                      className="hover:bg-primary/10 hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Address
                    </Button>
                  </div>

                  {addressFields.length === 0 ? (
                    <div className="text-center py-5 border-2 border-dashed rounded">
                      <p className="text-xs text-muted-foreground">
                        No addresses added
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addressFields.map((field, index) => (
                            <div key={field.id} className="pb-3 border-b last:border-0 last:pb-0">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium">Address {index + 1}</p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAddress(index)}
                                  disabled={isSubmitting}
                                  className="h-4 w-4 p-0 hover:bg-primary/10 hover:border-primary text-primary hover:text-primary"
                                >
                                  <Trash2 className="h-2 w-2 text-primary" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <SelectField
                                  control={control}
                                  name={`addresses.${index}.addressType`}
                                  label="Type"
                                  placeholder="Type"
                                  options={ADDRESS_TYPE_OPTIONS}
                                  disabled={isSubmitting}
                                  error={
                                    errors.addresses?.[index]?.addressType as any
                                  }
                                />
                                <TextField
                                  control={control}
                                  name={`addresses.${index}.houseNo`}
                                  label="House No"
                                  placeholder="No"
                                  disabled={isSubmitting}
                                  error={
                                    errors.addresses?.[index]?.houseNo as any
                                  }
                                />
                                <TextField
                                  control={control}
                                  name={`addresses.${index}.street`}
                                  label="Street"
                                  placeholder="Street"
                                  disabled={isSubmitting}
                                  error={
                                    errors.addresses?.[index]?.street as any
                                  }
                                />
                                <TextField
                                  control={control}
                                  name={`addresses.${index}.village`}
                                  label="Village"
                                  placeholder="Village"
                                  disabled={isSubmitting}
                                  error={
                                    errors.addresses?.[index]?.village as any
                                  }
                                />
                                <TextField
                                  control={control}
                                  name={`addresses.${index}.commune`}
                                  label="Commune"
                                  placeholder="Commune"
                                  disabled={isSubmitting}
                                  error={
                                    errors.addresses?.[index]?.commune as any
                                  }
                                />
                                <TextField
                                  control={control}
                                  name={`addresses.${index}.district`}
                                  label="District"
                                  placeholder="District"
                                  disabled={isSubmitting}
                                  error={
                                    errors.addresses?.[index]?.district as any
                                  }
                                />
                                <TextField
                                  control={control}
                                  name={`addresses.${index}.province`}
                                  label="Province"
                                  placeholder="Province"
                                  disabled={isSubmitting}
                                  error={
                                    errors.addresses?.[index]?.province as any
                                  }
                                />
                                <TextField
                                  control={control}
                                  name={`addresses.${index}.country`}
                                  label="Country"
                                  placeholder="Country"
                                  disabled={isSubmitting}
                                  error={
                                    errors.addresses?.[index]?.country as any
                                  }
                                />
                              </div>
                            </div>
                          ))}
                    </div>
                  )}
                </div>

                {}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold">Emergency Contacts</h3>
                      <p className="text-xs text-muted-foreground">
                        {contactFields.length > 0
                          ? `${contactFields.length} contact${
                              contactFields.length > 1 ? "s" : ""
                            } added`
                          : "No emergency contacts added"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendContact({
                          id: undefined,
                          name: "",
                          phone: "",
                          relationship: "",
                        })
                      }
                      disabled={isSubmitting}
                      className="hover:bg-primary/10 hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Contact
                    </Button>
                  </div>

                  {contactFields.length === 0 ? (
                    <div className="text-center py-5 border-2 border-dashed rounded">
                      <p className="text-xs text-muted-foreground">
                        No emergency contacts added
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contactFields.map((field, index) => (
                            <div
                              key={field.id}
                              className="border rounded p-3 relative lg:col-span-2"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <TextField
                                  control={control}
                                  name={`emergencyContacts.${index}.name`}
                                  label="Contact Name"
                                  placeholder="Name"
                                  disabled={isSubmitting}
                                  error={
                                    errors.emergencyContacts?.[index]?.name as any
                                  }
                                />
                                <TextField
                                  control={control}
                                  name={`emergencyContacts.${index}.phone`}
                                  label="Phone Number"
                                  placeholder="Phone"
                                  disabled={isSubmitting}
                                  error={
                                    errors.emergencyContacts?.[index]?.phone as any
                                  }
                                />
                                <TextField
                                  control={control}
                                  name={`emergencyContacts.${index}.relationship`}
                                  label="Relationship"
                                  placeholder="Relationship"
                                  disabled={isSubmitting}
                                  error={
                                    errors.emergencyContacts?.[index]
                                      ?.relationship as any
                                  }
                                />
                              </div>
                              {!isSubmitting && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-1 right-1 hover:bg-primary/10 hover:border-primary text-primary hover:text-primary"
                                  onClick={() => removeContact(index)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                      ))}
                    </div>
                  )}
                </div>

                {}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold">Documents</h3>
                      <p className="text-xs text-muted-foreground">
                        {documentFields.length > 0
                          ? `${documentFields.length} document${documentFields.length > 1 ? "s" : ""} added`
                          : "No documents added"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendDocument({
                          id: undefined,
                          type: DocumentType.ID_CARD,
                          number: "",
                          fileUrl: "",
                        })
                      }
                      disabled={isSubmitting}
                      className="hover:bg-primary/10 hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Document
                    </Button>
                  </div>

                  {documentFields.length === 0 ? (
                    <div className="text-center py-5 border-2 border-dashed rounded">
                      <p className="text-xs text-muted-foreground">No documents added</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documentFields.map((field, index) => (
                        <div key={field.id} className="border rounded p-3 relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(index)}
                            disabled={isSubmitting}
                            className="h-4 w-4 p-0 absolute top-1 right-1 hover:bg-primary/10 hover:border-primary text-primary hover:text-primary"
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                          <div className="space-y-3 pt-1">
                            <div className="grid grid-cols-2 gap-1">
                              <SelectField
                                control={control}
                                name={`documents.${index}.type`}
                                label="Type"
                                placeholder="Type"
                                options={DOCUMENT_TYPE_OPTIONS}
                                disabled={isSubmitting}
                                error={errors.documents?.[index]?.type as any}
                              />
                              <TextField
                                control={control}
                                name={`documents.${index}.number`}
                                label="Document No"
                                placeholder="No"
                                disabled={isSubmitting}
                                error={errors.documents?.[index]?.number as any}
                              />
                            </div>
                            <div className="w-1/2">
                              <ClickableImageUpload
                                label="File"
                                value={watch(`documents.${index}.fileUrl`) || ""}
                                onChange={(base64) =>
                                  setValue(`documents.${index}.fileUrl`, base64, { shouldDirty: true })
                                }
                                aspectRatio="auto"
                                height="h-28"
                                maxSize={5}
                                disabled={isSubmitting}
                                error={errors.documents?.[index]?.fileUrl as any}
                                placeholder="Upload"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold">Education</h3>
                      <p className="text-xs text-muted-foreground">
                        {educationFields.length > 0
                          ? `${educationFields.length} education${educationFields.length > 1 ? "s" : ""} added`
                          : "No education added"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendEducation({
                          id: undefined,
                          level: EducationLevel.HIGH_SCHOOL,
                          schoolName: "",
                          fieldOfStudy: "",
                          startYear: "",
                          endYear: "",
                          isGraduated: false,
                          certificateUrl: "",
                        })
                      }
                      disabled={isSubmitting}
                      className="hover:bg-primary/10 hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Education
                    </Button>
                  </div>

                  {educationFields.length === 0 ? (
                    <div className="text-center py-5 border-2 border-dashed rounded">
                      <p className="text-xs text-muted-foreground">No education added</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {educationFields.map((field, index) => (
                        <div key={field.id} className="border rounded p-3 relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(index)}
                            disabled={isSubmitting}
                            className="h-4 w-4 p-0 absolute top-1 right-1 hover:bg-primary/10 hover:border-primary text-primary hover:text-primary"
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                          <div className="space-y-3 pt-1">
                            <div className="grid grid-cols-2 gap-1">
                              <SelectField
                                control={control}
                                name={`educations.${index}.level`}
                                label="Level"
                                placeholder="Level"
                                options={EDUCATION_LEVEL_OPTIONS}
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.level as any}
                              />
                              <TextField
                                control={control}
                                name={`educations.${index}.schoolName`}
                                label="School"
                                placeholder="School"
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.schoolName as any}
                              />
                              <TextField
                                control={control}
                                name={`educations.${index}.fieldOfStudy`}
                                label="Field"
                                placeholder="Field"
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.fieldOfStudy as any}
                              />
                              <DateTimePickerField
                                control={control}
                                name={`educations.${index}.startYear`}
                                label="Start"
                                mode="date"
                                placeholder="Start"
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.startYear as any}
                              />
                              <DateTimePickerField
                                control={control}
                                name={`educations.${index}.endYear`}
                                label="End"
                                mode="date"
                                placeholder="End"
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.endYear as any}
                              />
                              <SelectField
                                control={control}
                                name={`educations.${index}.isGraduated`}
                                label="Graduated"
                                placeholder="Select status"
                                options={[
                                  { label: "Yes", value: "true" },
                                  { label: "No", value: "false" },
                                ]}
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.isGraduated as any}
                              />
                            </div>
                            <div className="w-1/2">
                              <ClickableImageUpload
                                label="Certificate"
                                value={watch(`educations.${index}.certificateUrl`) || ""}
                                onChange={(base64) =>
                                  setValue(`educations.${index}.certificateUrl`, base64, { shouldDirty: true })
                                }
                                aspectRatio="auto"
                                height="h-28"
                                maxSize={5}
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.certificateUrl as any}
                                placeholder="Upload"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {}
                <div className="space-y-3">
                  <TextareaField
                    control={control}
                    name="remark"
                    label="Remarks"
                    placeholder="Enter any remarks"
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
              createMessage={
                isUploadingImage ? "Uploading files..." : "Creating user..."
              }
              updateMessage={
                isUploadingImage ? "Uploading files..." : "Updating user..."
              }
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create User"
                updateText="Update User"
                submittingCreateText={
                  isUploadingImage ? "Uploading..." : "Creating..."
                }
                submittingUpdateText={
                  isUploadingImage ? "Uploading..." : "Updating..."
                }
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
