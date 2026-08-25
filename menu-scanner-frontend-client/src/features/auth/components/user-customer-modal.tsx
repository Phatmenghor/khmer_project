"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton, SubmitButton } from "@/components/shared/button/custom-button";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { uploadMultiSize } from "@/services/spaces-service";
import { ImageUrls } from "../store/models/request/users-request";
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
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { SectionTitle } from "@/components/shared/modal/detail-section";
import {
  AccountStatus,
  ModalMode,
  UserGropeType,
} from "@/constants/status/status";
import { Loading } from "@/components/shared/common/loading";
import { AppDefault } from "@/constants/app-resource/default/default";
import { GENDER_OPTIONS } from "@/constants/form-options";

type Props = {
  mode: ModalMode;
  userId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function UserCustomerModal({
  isOpen,
  onClose,
  userId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const [showPassword, setShowPassword] = useState(false);
  const [pendingProfileFile, setPendingProfileFile] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string>("");
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [existingProfileImage, setExistingProfileImage] = useState<ImageUrls | undefined>(undefined);

  useEffect(() => {
    if (!profilePreviewUrl || !profilePreviewUrl.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(profilePreviewUrl);
  }, [profilePreviewUrl]);

  const dispatch = useAppDispatch();
  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const accountStatusOptions = [
    { value: AccountStatus.ACTIVE, label: "Active" },
    { value: AccountStatus.LOCKED, label: "Locked" },
  ];

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
      userType: UserGropeType.CUSTOMER,
      roles: ["CUSTOMER"],
      accountStatus: AccountStatus.ACTIVE,
      gender: "",
      dateOfBirth: "",
      profileImageUrl: "",
      remark: "",
      businessId: "",
      addresses: [],
      emergencyContacts: [],
      documents: [],
      educations: [],
    },
    mode: "onChange",
  });

  const email = watch("email");
  const userIdentifier = watch("userIdentifier");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(fetchUserByIdService(userId));

        if (fetchUserByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            id: data.id,
            userIdentifier: data.userIdentifier || "",
            email: data.email || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            nickname: data.nickname || "",
            phoneNumber: data.phoneNumber || "",
            accountStatus: data.accountStatus,
            roles: ["CUSTOMER"],
            gender: data.gender || "",
            dateOfBirth: data.dateOfBirth || "",
            profileImageUrl: data.profileImage?.md || data.profileImage?.o || data.profileImage?.sm || "",
            businessId: data.businessId || "",
            addresses: [],
            emergencyContacts: [],
            documents: [],
            educations: [],
          });
          setExistingProfileImage(data.profileImage);
          setPendingProfileFile(null);
          setProfilePreviewUrl(
            data.profileImage?.md || data.profileImage?.o || data.profileImage?.sm || ""
          );
        }
      } catch (error) {
        // Ignored
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
        userType: UserGropeType.CUSTOMER,
        roles: ["CUSTOMER"],
        accountStatus: AccountStatus.ACTIVE,
        gender: "",
        dateOfBirth: "",
        profileImageUrl: "",
        businessId: "",
        addresses: [],
        emergencyContacts: [],
        documents: [],
        educations: [],
      });
      setExistingProfileImage(undefined);
      setPendingProfileFile(null);
      setProfilePreviewUrl("");
    }
  }, [isOpen, isCreate, reset]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: UserFormData) => {
    setIsProcessing(true);
    try {
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
        profileImage = existingProfileImage ?? {
          sm: data.profileImageUrl,
          md: data.profileImageUrl,
          o: data.profileImageUrl,
        };
      }

      if (isCreate) {
        const payload: CreateUserRequest = {
          userIdentifier: data.userIdentifier!,
          email: data.email,
          password: data.password!,
          firstName: data.firstName,
          lastName: data.lastName,
          nickname: data.nickname || undefined,
          phoneNumber: data.phoneNumber,
          userType: UserGropeType.CUSTOMER,
          accountStatus: data.accountStatus,
          businessId: AppDefault.BUSINESS_ID,
          roles: ["CUSTOMER"],
          gender: data.gender || undefined,
          dateOfBirth: data.dateOfBirth || undefined,
          profileImage,
        };

        const result = await dispatch(createUserService(payload)).unwrap();
        showToast.success(
          `Customer "${result.userIdentifier || result.email}" created successfully`,
        );
        handleClose();
      } else {
        const payload: UpdateUserRequest = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          nickname: data.nickname || undefined,
          phoneNumber: data.phoneNumber,
          accountStatus: data.accountStatus,
          businessId: AppDefault.BUSINESS_ID,
          roles: ["CUSTOMER"],
          gender: data.gender || undefined,
          dateOfBirth: data.dateOfBirth || undefined,
          profileImage,
        };

        const result = await dispatch(
          updateUserService({ userId: data.id, userData: payload }),
        ).unwrap();
        showToast.success(
          `Customer "${result.fullName || result.email}" updated successfully`,
        );
        handleClose();
      }
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message || `Failed to ${isCreate ? "create" : "update"} customer`,
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
    dispatch(clearError());
    dispatch(clearSelectedUser());
    onClose();
  };

  const isSubmitting = (isCreate ? isCreating : isUpdating) || isUploadingProfile || isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="w-full sm:max-w-4xl max-h-[92vh] p-0 flex flex-col overflow-hidden"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement)?.focus();
        }}
        disableScrollWrapper={true}
      >
        <FormHeader
          title={isCreate ? "Create Customer" : "Update Customer"}
          description={
            isCreate
              ? "Fill out the form to create a new customer account"
              : "Update customer profile information below"
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

              <div className="space-y-4">
                <div className="space-y-3">
                  <SectionTitle className="col-span-1 mt-0 mb-0 border-b-0 pb-0">
                    Account Credentials <span className="text-destructive ml-0.5">*</span>
                  </SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {isCreate ? (
                      <>
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
                          error={errors.email}
                          autoComplete="new-password"
                        />

                        <SelectField
                          control={control}
                          name="accountStatus"
                          label="Account Status"
                          placeholder="Select account status"
                          options={accountStatusOptions}
                          required
                          disabled={isSubmitting}
                          error={errors.accountStatus}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <SectionTitle className="col-span-1 mt-0 mb-0 border-b-0 pb-0">
                    Personal Information <span className="text-destructive ml-0.5">*</span>
                  </SectionTitle>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
              </div>
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
