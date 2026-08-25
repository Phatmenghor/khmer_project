"use client";

import React, { useEffect, useState, useMemo } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton, CustomButton, SubmitButton } from "@/components/shared/button/custom-button";
import { useIsMobile } from "@/hooks/use-mobile";

import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { uploadMultiSize } from "@/services/spaces-service";
import { useDeferredUploads } from "@/hooks/use-deferred-upload";
import { ImageUrls } from "../store/models/request/users-request";

import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { getTodayLocalDateString } from "@/utils/date/date-time-format";
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
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selectors";
import { fetchBusinessSettingsThunk } from "@/features/business/store/thunks/business-settings-thunks";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { SectionTitle } from "@/components/shared/modal/detail-section";
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

import { formatEnumValue } from "@/utils/format/enum-formatter";
import { AppDefault } from "@/constants/app-resource/default/default";
import { ComboboxSelectRole } from "@/components/shared/combobox/combobox_select_role";
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
  const isMobile = useIsMobile();
  const isCreate = mode === ModalMode.CREATE_MODE;
  const [showPassword, setShowPassword] = useState(false);
  const [pendingProfileFile, setPendingProfileFile] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string>("");
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  // Flips true the moment the user clicks Save and stays true through the
  // entire upload + API phase so the button shows a spinner the whole time.
  const [isProcessing, setIsProcessing] = useState(false);
  // The full ImageUrls from the loaded user — used when editing without changing the image.
  const [existingProfileImage, setExistingProfileImage] = useState<ImageUrls | undefined>(undefined);
  const documentUploads = useDeferredUploads<number>();
  const educationUploads = useDeferredUploads<number>();

  useEffect(() => {
    if (!profilePreviewUrl || !profilePreviewUrl.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(profilePreviewUrl);
  }, [profilePreviewUrl]);

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const userData = useAppSelector(selectSelectedUser);
  const { isCreating, isUpdating } = operations;

  const isBusinessOwner = !isCreate && userData?.roles?.includes("BUSINESS_OWNER");

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
            profileImageUrl: data.profileImage?.md || data.profileImage?.o || data.profileImage?.sm || "",
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
          setExistingProfileImage(data.profileImage);
          setPendingProfileFile(null);
          setProfilePreviewUrl(
            data.profileImage?.md || data.profileImage?.o || data.profileImage?.sm || ""
          );
        }
      } catch (error) {
      }
    };

    fetchUserData();
  }, [userId, isOpen, isCreate, reset, dispatch]);


  const businessSettings = useAppSelector(selectBusinessSettings);

  useEffect(() => {
    if (isOpen && !businessSettings) {
      dispatch(fetchBusinessSettingsThunk(AppDefault.BUSINESS_ID));
    }
  }, [isOpen, businessSettings, dispatch]);

  useEffect(() => {
    if (isOpen && isCreate) {
      const defaultShiftName = businessSettings?.businessName
        ? `${businessSettings.businessName} Shift Roster`
        : "";
      const defaultBusinessId = businessSettings?.businessId || AppDefault.BUSINESS_ID;

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
        joinDate: getTodayLocalDateString(),
        leaveDate: "",
        shift: defaultShiftName,
        remark: "",
        businessId: defaultBusinessId,
        addresses: [],
        emergencyContacts: [],
        documents: [],
        educations: [],
      });
      setExistingProfileImage(undefined);
      setPendingProfileFile(null);
      setProfilePreviewUrl("");
    }
  }, [isOpen, isCreate, reset, businessSettings]);


  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: UserFormData) => {
    setIsProcessing(true);
    try {
      // ── All uploads are deferred to here so that cancelling the form leaves
      //    nothing orphaned in Spaces. ──

      // Profile image (multi-size).
      let profileImage: ImageUrls | undefined;
      if (pendingProfileFile) {
        setIsUploadingProfile(true);
        try {
          const result = await uploadMultiSize(pendingProfileFile, AppDefault.BUSINESS_ID);
          profileImage = { sm: result.sm.url, md: result.md.url, o: result.o.url };
        } catch (uploadErr: any) {
          showToast.error(uploadErr?.message || "Profile image upload failed — please try again");
          return;
        } finally {
          setIsUploadingProfile(false);
        }
      } else if (data.profileImageUrl) {
        // Editing without a new file — preserve the original sm/md/o the user had.
        profileImage = existingProfileImage ?? {
          sm: data.profileImageUrl,
          md: data.profileImageUrl,
          o: data.profileImageUrl,
        };
      }

      // Documents & educations (single-size, indexed by row).
      let docUploadedUrls: Record<string, string> = {};
      let eduUploadedUrls: Record<string, string> = {};
      try {
        const [docs, edus] = await Promise.all([
          documentUploads.uploadAllSingle(AppDefault.BUSINESS_ID),
          educationUploads.uploadAllSingle(AppDefault.BUSINESS_ID),
        ]);
        docUploadedUrls = Object.fromEntries(
          Object.entries(docs).map(([k, r]) => [k, r.url]),
        );
        eduUploadedUrls = Object.fromEntries(
          Object.entries(edus).map(([k, r]) => [k, r.url]),
        );
      } catch (uploadErr: any) {
        showToast.error(uploadErr?.message || "File upload failed — please try again");
        return;
      }

      const mergeDocUrl = (idx: number, fallback?: string) =>
        docUploadedUrls[String(idx)] ?? fallback;
      const mergeEduUrl = (idx: number, fallback?: string) =>
        eduUploadedUrls[String(idx)] ?? fallback;

      const validDocuments = (data.documents || []).map((doc, idx) => ({
        id: doc.id,
        type: doc.type,
        number: doc.number,
        fileUrl: mergeDocUrl(idx, doc.fileUrl),
      }));

      const validEducations = (data.educations || []).map((edu, idx) => ({
        id: edu.id,
        level: edu.level,
        schoolName: edu.schoolName,
        fieldOfStudy: edu.fieldOfStudy,
        startYear: edu.startYear,
        endYear: edu.endYear,
        isGraduated: edu.isGraduated || false,
        certificateUrl: mergeEduUrl(idx, edu.certificateUrl),
      }));

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
          profileImage,
          employeeId: data.employeeId || undefined,
          position: data.position || undefined,
          department: data.department || undefined,
          employmentType: data.employmentType || undefined,
          joinDate: data.joinDate || undefined,
          leaveDate: data.leaveDate || undefined,
          shift: data.shift || undefined,
          remark: data.remark || undefined,
          addresses: addressFields.length > 0 ? data.addresses : undefined,
          emergencyContacts: contactFields.length > 0 ? data.emergencyContacts : undefined,
          documents: validDocuments.length > 0 ? validDocuments : undefined,
          educations: validEducations.length > 0 ? validEducations : undefined,
        };

        const result = await dispatch(createUserService(payload)).unwrap();
        showToast.success(
          `User business "${result.userIdentifier || result.email}" created successfully`,
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
          profileImage,
          employeeId: data.employeeId || undefined,
          position: data.position || undefined,
          department: data.department || undefined,
          employmentType: data.employmentType || undefined,
          joinDate: data.joinDate || undefined,
          leaveDate: data.leaveDate || undefined,
          shift: data.shift || undefined,
          remark: data.remark || undefined,
          addresses: addressFields.length > 0 ? data.addresses : undefined,
          emergencyContacts: contactFields.length > 0 ? data.emergencyContacts : undefined,
          documents: validDocuments.length > 0 ? validDocuments : undefined,
          educations: validEducations.length > 0 ? validEducations : undefined,
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
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message || `Failed to ${isCreate ? "create" : "update"} user business`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    reset();
    setShowPassword(false);
    setPendingProfileFile(null);
    setProfilePreviewUrl("");
    setExistingProfileImage(undefined);
    documentUploads.reset();
    educationUploads.reset();
    dispatch(clearError());
    dispatch(clearSelectedUser());
    onClose();
  };

  const isSubmitting = (isCreate ? isCreating : isUpdating) || isUploadingProfile || isProcessing;

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="7xl">
      <FormHeader
          title={isCreate ? "Create User" : "Update User"}
          description={
            isCreate
              ? "Fill out the form to create a new user"
              : "Update user information below"
          }
          isCreate={isCreate}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-4 flex items-center justify-center min-h-[50vh] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
            autoComplete="off"
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
                    <SectionTitle className="col-span-1 mt-0 mb-0 border-b-0 pb-0">
                      Account Credentials <span className="text-red-500">*</span>
                    </SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <TextField
                        control={control}
                        name="userIdentifier"
                        label="User Identifier"
                        placeholder="Enter user identifier"
                        required
                        disabled={isSubmitting}
                        error={errors.userIdentifier}
                        autoComplete="new-password"
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
                        autoComplete="new-password"
                      />

                      <TextField
                        control={control}
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="Enter email address"
                        disabled={isSubmitting}
                        error={errors.email}
                        autoComplete="new-password"
                      />

                      <Controller
                        control={control}
                        name="roles"
                        render={({ field }) => {
                          const currentValue = field.value && field.value.length > 0 ? field.value[0] : "";
                          return (
                            <ComboboxSelectRole
                              value={currentValue}
                              onValueChange={(val) => {
                                setValue("roles", [val], {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                              required
                              disabled={isSubmitting}
                              error={getArrayFieldError(errors.roles)?.message}
                            />
                          );
                        }}
                      />

                      {/* Account status is hidden on create and defaults to ACTIVE */}
                    </div>
                  </div>
                )}


                {}
                <div className="space-y-3">
                  <SectionTitle className="col-span-1 mt-0 mb-0 border-b-0 pb-0">
                    Personal Information <span className="text-red-500">*</span>
                  </SectionTitle>
                  <div className="space-y-3">
                    {}
                    {!isCreate && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                          control={control}
                          name="roles"
                          render={({ field }) => {
                            const currentValue = field.value && field.value.length > 0 ? field.value[0] : "";
                            return (
                              <ComboboxSelectRole
                                value={currentValue}
                                onValueChange={(val) => {
                                  setValue("roles", [val], {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                }}
                                required
                                disabled={isSubmitting || isBusinessOwner}
                                error={getArrayFieldError(errors.roles)?.message}
                              />
                            );
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        control={control}
                        name="firstName"
                        label="First Name"
                        placeholder="Enter first name"
                        disabled={isSubmitting}
                        error={errors.firstName}
                        autoComplete="new-password"
                      />

                      <TextField
                        control={control}
                        name="lastName"
                        label="Last Name"
                        placeholder="Enter last name"
                        disabled={isSubmitting}
                        error={errors.lastName}
                        autoComplete="new-password"
                      />

                      <TextField
                        control={control}
                        name="nickname"
                        label="Nickname"
                        placeholder="Enter nickname"
                        disabled={isSubmitting}
                        error={errors.nickname}
                        autoComplete="new-password"
                      />

                      <TextField
                        control={control}
                        name="phoneNumber"
                        label="Phone Number"
                        placeholder="Enter phone number"
                        disabled={isSubmitting}
                        error={errors.phoneNumber}
                        autoComplete="new-password"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SpacesImageUpload
                        multiSize
                        deferred
                        label="Profile Image"
                        businessId={AppDefault.BUSINESS_ID}
                        value={profilePreviewUrl}
                        onFileSelected={(file) => {
                          setPendingProfileFile(file);
                          if (file) {
                            const objectUrl = URL.createObjectURL(file);
                            setProfilePreviewUrl(objectUrl);
                            setValue("profileImageUrl", objectUrl, { shouldDirty: true });
                          } else {
                            setProfilePreviewUrl("");
                            setValue("profileImageUrl", "", { shouldDirty: true });
                            setExistingProfileImage(undefined);
                          }
                        }}
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
                  <SectionTitle className="col-span-1 mt-0 mb-0 border-b-0 pb-0">
                    Employment Information
                  </SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="employeeId"
                      label="Employee ID"
                      placeholder="Enter employee ID"
                      disabled={isSubmitting}
                      error={errors.employeeId}
                      autoComplete="new-password"
                    />

                    <TextField
                      control={control}
                      name="position"
                      label="Position"
                      placeholder="Enter position"
                      disabled={isSubmitting}
                      error={errors.position}
                      autoComplete="new-password"
                    />

                    <TextField
                      control={control}
                      name="department"
                      label="Department"
                      placeholder="Enter department"
                      disabled={isSubmitting}
                      error={errors.department}
                      autoComplete="new-password"
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
                  </div>
                </div>

                {}
                <div className="space-y-3">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <SectionTitle className="col-span-1 mt-0 mb-0 border-b-0 pb-0">Addresses</SectionTitle>
                      <p className="text-xs text-muted-foreground">
                        {addressFields.length > 0
                          ? `${addressFields.length} address${
                              addressFields.length > 1 ? "es" : ""
                            } added`
                          : "No addresses added"}
                      </p>
                    </div>
                    <CustomButton
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
                    </CustomButton>
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
                            <div key={field.id} className="border rounded p-3 relative">
                              <CustomButton
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAddress(index)}
                                disabled={isSubmitting}
                                className="h-4 w-4 p-0 absolute top-1 right-1 hover:bg-primary/10 hover:border-primary text-primary hover:text-primary"
                              >
                                <Trash2 className="h-2 w-2 text-primary" />
                              </CustomButton>
                              <div className="space-y-3 pt-1">
                                <p className="text-xs font-semibold">Address {index + 1}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  autoComplete="new-password"
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
                                  autoComplete="new-password"
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
                                  autoComplete="new-password"
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
                                  autoComplete="new-password"
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
                                  autoComplete="new-password"
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
                                  autoComplete="new-password"
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
                                  autoComplete="new-password"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {}
                <div className="space-y-2">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <SectionTitle className="col-span-1 mt-0 mb-0 border-b-0 pb-0">Emergency Contacts</SectionTitle>
                      <p className="text-xs text-muted-foreground">
                        {contactFields.length > 0
                          ? `${contactFields.length} contact${
                              contactFields.length > 1 ? "s" : ""
                            } added`
                          : "No emergency contacts added"}
                      </p>
                    </div>
                    <CustomButton
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
                    </CustomButton>
                  </div>

                  {contactFields.length === 0 ? (
                    <div className="text-center py-5 border-2 border-dashed rounded">
                      <p className="text-xs text-muted-foreground">
                        No emergency contacts added
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {contactFields.map((field, index) => (
                            <div
                              key={field.id}
                              className="border rounded p-2 relative lg:col-span-2"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <TextField
                                  control={control}
                                  name={`emergencyContacts.${index}.name`}
                                  label="Contact Name"
                                  placeholder="Name"
                                  disabled={isSubmitting}
                                  error={
                                    errors.emergencyContacts?.[index]?.name as any
                                  }
                                  autoComplete="new-password"
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
                                  autoComplete="new-password"
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
                                  autoComplete="new-password"
                                />
                              </div>
                              {!isSubmitting && (
                                <CustomButton
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-1 right-1 hover:bg-primary/10 hover:border-primary text-primary hover:text-primary"
                                  onClick={() => removeContact(index)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </CustomButton>
                              )}
                            </div>
                      ))}
                    </div>
                  )}
                </div>

                {}
                <div className="space-y-2">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <SectionTitle className="col-span-1 mt-0 mb-0 border-b-0 pb-0">Documents</SectionTitle>
                      <p className="text-xs text-muted-foreground">
                        {documentFields.length > 0
                          ? `${documentFields.length} document${documentFields.length > 1 ? "s" : ""} added`
                          : "No documents added"}
                      </p>
                    </div>
                    <CustomButton
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
                    </CustomButton>
                  </div>

                  {documentFields.length === 0 ? (
                    <div className="text-center py-5 border-2 border-dashed rounded">
                      <p className="text-xs text-muted-foreground">No documents added</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {documentFields.map((field, index) => (
                        <div key={field.id} className="border rounded p-2 relative">
                          <CustomButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              removeDocument(index);
                              documentUploads.reindexAfterRemove(index);
                            }}
                            disabled={isSubmitting}
                            className="h-4 w-4 p-0 absolute top-1 right-1 hover:bg-primary/10 hover:border-primary text-primary hover:text-primary"
                          >
                            <Trash2 className="h-2 w-2" />
                          </CustomButton>
                          <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-2 gap-2">
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
                                autoComplete="new-password"
                              />
                            </div>
                            <div className="w-1/2">
                              <SpacesImageUpload
                                deferred
                                label="File"
                                businessId={AppDefault.BUSINESS_ID}
                                value={
                                  documentUploads.getPreview(index) ||
                                  watch(`documents.${index}.fileUrl`) ||
                                  ""
                                }
                                onFileSelected={(file) => {
                                  documentUploads.setPending(index, file);
                                  if (file) {
                                    // Keep the form dirty so the submit button enables;
                                    // the real URL replaces this on submit.
                                    setValue(
                                      `documents.${index}.fileUrl`,
                                      URL.createObjectURL(file),
                                      { shouldDirty: true },
                                    );
                                  } else {
                                    setValue(`documents.${index}.fileUrl`, "", { shouldDirty: true });
                                  }
                                }}
                                aspectRatio="auto"
                                height="h-28"
                                maxSizeMb={5}
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <SectionTitle className="col-span-1 mt-0 mb-0 border-b-0 pb-0">Education</SectionTitle>
                      <p className="text-xs text-muted-foreground">
                        {educationFields.length > 0
                          ? `${educationFields.length} education${educationFields.length > 1 ? "s" : ""} added`
                          : "No education added"}
                      </p>
                    </div>
                    <CustomButton
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
                    </CustomButton>
                  </div>

                  {educationFields.length === 0 ? (
                    <div className="text-center py-5 border-2 border-dashed rounded">
                      <p className="text-xs text-muted-foreground">No education added</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {educationFields.map((field, index) => (
                        <div key={field.id} className="border rounded p-2 relative">
                          <CustomButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              removeEducation(index);
                              educationUploads.reindexAfterRemove(index);
                            }}
                            disabled={isSubmitting}
                            className="h-4 w-4 p-0 absolute top-1 right-1 hover:bg-primary/10 hover:border-primary text-primary hover:text-primary"
                          >
                            <Trash2 className="h-2 w-2" />
                          </CustomButton>
                          <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-2 gap-2">
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
                                autoComplete="new-password"
                              />
                              <TextField
                                control={control}
                                name={`educations.${index}.fieldOfStudy`}
                                label="Field"
                                placeholder="Field"
                                disabled={isSubmitting}
                                error={errors.educations?.[index]?.fieldOfStudy as any}
                                autoComplete="new-password"
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
                              <SpacesImageUpload
                                deferred
                                label="Certificate"
                                businessId={AppDefault.BUSINESS_ID}
                                value={
                                  educationUploads.getPreview(index) ||
                                  watch(`educations.${index}.certificateUrl`) ||
                                  ""
                                }
                                onFileSelected={(file) => {
                                  educationUploads.setPending(index, file);
                                  if (file) {
                                    setValue(
                                      `educations.${index}.certificateUrl`,
                                      URL.createObjectURL(file),
                                      { shouldDirty: true },
                                    );
                                  } else {
                                    setValue(`educations.${index}.certificateUrl`, "", { shouldDirty: true });
                                  }
                                }}
                                aspectRatio="auto"
                                height="h-28"
                                maxSizeMb={5}
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
                    rows={isMobile ? 3 : 5}
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
    </CustomModal>
  );
}
