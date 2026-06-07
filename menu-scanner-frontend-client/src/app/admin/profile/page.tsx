"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Edit,
  Loader2,
  Trash2,
  Lock,
  User,
  Monitor,
  Link2,
  Plus,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { useAppDispatch, useAppSelector } from "@/store";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import {
  getProfileService,
  updateProfileService,
  deleteAccountService,
} from "@/features/auth/store/thunks/auth-thunks";
import {
  selectProfile,
  selectIsProfileLoading,
  selectError,
} from "@/features/auth/store/selectors/auth-selectors";
import { showToast } from "@/components/shared/common/show-toast";
import { clearError } from "@/features/auth/store/slice/auth-slice";
import ChangePasswordModal from "@/components/shared/modal/change-password-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { ProfilePictureModal } from "@/components/shared/modal/profile-picture-modal";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { clearToken } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { SpacesMultiSizeResult } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";
import { TelegramSyncCard } from "@/components/shared/telegram/telegram-sync-card";
import Link from "next/link";
import { Loading } from "@/components/shared/common/loading";
import { DisplayField } from "@/components/shared/form-field/display-field";
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
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";


import {
  updateUserSchema,
  UserFormData,
} from "@/features/auth/store/models/schema/user.schema";

export default function AdminProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { accessToken, authReady } = useAuthState();

  const userProfile = useAppSelector(selectProfile);
  const isProfileLoading = useAppSelector(selectIsProfileLoading);
  const reduxError = useAppSelector(selectError);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImageKeys, setProfileImageKeys] = useState<SpacesMultiSizeResult | undefined>();
  const [documentKeys, setDocumentKeys] = useState<Record<number, string>>({});
  const [educationKeys, setEducationKeys] = useState<Record<number, string>>({});

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      id: "",
      profileImageUrl: "",
      firstName: "",
      lastName: "",
      nickname: "",
      phoneNumber: "",
      email: "",
      gender: "",
      dateOfBirth: "",
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
    },
    mode: "onChange",
  });


  const typedControl = control as any;


  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control: typedControl,
    name: "addresses",
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: typedControl,
    name: "emergencyContacts",
  });

  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control: typedControl,
    name: "documents",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: typedControl,
    name: "educations",
  });


  const profileFetchedRef = useRef(false);
  useEffect(() => {
    if (authReady && accessToken && !userProfile && !isProfileLoading && !profileFetchedRef.current) {
      profileFetchedRef.current = true;
      dispatch(getProfileService());
    }
  }, [authReady, accessToken, dispatch, userProfile, isProfileLoading]);


  useEffect(() => {
    if (userProfile) {
      reset({
        id: userProfile.id || "",
        profileImageUrl: userProfile.profileImage?.md || "",
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        nickname: userProfile.nickname || "",
        phoneNumber: userProfile.phoneNumber || "",
        email: userProfile.email || "",
        gender: userProfile.gender || "",
        dateOfBirth: userProfile.dateOfBirth || "",
        employeeId: userProfile.employeeId || "",
        position: userProfile.position || "",
        department: userProfile.department || "",
        employmentType: userProfile.employmentType || "",
        joinDate: userProfile.joinDate || "",
        leaveDate: userProfile.leaveDate || "",
        shift: userProfile.shift || "",
        remark: userProfile.remark || "",
        addresses: Array.isArray(userProfile.addresses)
          ? userProfile.addresses
          : [],
        emergencyContacts: Array.isArray(userProfile.emergencyContacts)
          ? userProfile.emergencyContacts
          : [],
        documents: Array.isArray(userProfile.documents)
          ? userProfile.documents
          : [],
        educations: Array.isArray(userProfile.educations)
          ? userProfile.educations.map((edu: any) => ({
              ...edu,
              isGraduated: typeof edu.isGraduated === 'boolean' ? String(edu.isGraduated) : edu.isGraduated
            }))
          : [],
      });
    }
  }, [userProfile, reset]);


  useEffect(() => {
    if (reduxError) {
      showToast.error(reduxError);
      dispatch(clearError());
    }
  }, [reduxError, dispatch]);

  const onSubmit = async (data: UserFormData) => {
    try {
      // profile image
      const profileImageUrls: ImageUrls | undefined = profileImageKeys
        ? { sm: profileImageKeys.sm.url, md: profileImageKeys.md.url, lg: profileImageKeys.lg.url, o: profileImageKeys.o.url }
        : (data.profileImageUrl ? { sm: data.profileImageUrl, md: data.profileImageUrl, lg: data.profileImageUrl, o: data.profileImageUrl } : undefined);

      // documents: no more base64 processing, just use form values directly
      const validDocuments = (data.documents || []).filter(doc => doc.type && doc.number);

      // educations: no more base64 processing, just use form values directly
      const validEducations = (data.educations || []).filter(edu => edu.level && edu.schoolName && edu.fieldOfStudy);

      const payload: any = {};


      if (data.firstName) payload.firstName = data.firstName;
      if (data.lastName) payload.lastName = data.lastName;
      if (data.phoneNumber) payload.phoneNumber = data.phoneNumber;
      if (data.email) payload.email = data.email;


      if (data.nickname) payload.nickname = data.nickname;
      if (data.gender) payload.gender = data.gender;
      if (data.dateOfBirth) payload.dateOfBirth = data.dateOfBirth;
      if (profileImageUrls) payload.profileImage = profileImageUrls;


      if (data.employeeId) payload.employeeId = data.employeeId;
      if (data.position) payload.position = data.position;
      if (data.department) payload.department = data.department;
      if (data.employmentType) payload.employmentType = data.employmentType;
      if (data.joinDate) payload.joinDate = data.joinDate;
      if (data.leaveDate) payload.leaveDate = data.leaveDate;
      if (data.shift) payload.shift = data.shift;
      if (data.remark) payload.remark = data.remark;


      if (addressFields.length > 0 && data.addresses && data.addresses.length > 0) {
        payload.addresses = data.addresses.map((addr: any) => ({
          id: addr.id || undefined,
          addressType: addr.addressType,
          houseNo: addr.houseNo,
          street: addr.street,
          village: addr.village,
          commune: addr.commune,
          district: addr.district,
          province: addr.province,
          country: addr.country,
        }));
      }

      if (contactFields.length > 0 && data.emergencyContacts && data.emergencyContacts.length > 0) {
        payload.emergencyContacts = data.emergencyContacts.map((contact: any) => ({
          id: contact.id || undefined,
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship,
        }));
      }

      if (validDocuments.length > 0) {
        payload.documents = validDocuments.map((doc: any) => ({
          id: doc.id || undefined,
          type: doc.type,
          number: doc.number,
          fileUrl: doc.fileUrl,
        }));
      }

      if (validEducations.length > 0) {
        payload.educations = validEducations.map((edu: any) => ({
          id: edu.id || undefined,
          level: edu.level,
          schoolName: edu.schoolName,
          fieldOfStudy: edu.fieldOfStudy,
          startYear: edu.startYear,
          endYear: edu.endYear,
          isGraduated: typeof edu.isGraduated === 'string' ? edu.isGraduated === 'true' : (edu.isGraduated || false),
          certificateUrl: edu.certificateUrl,
        }));
      }

      const updatedProfile = await dispatch(updateProfileService(payload)).unwrap();


      const freshProfile = await dispatch(getProfileService()).unwrap();

      showToast.success(Messages.profile.updated);
      setIsEditing(false);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.profile.updateFailed);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      reset({
        id: userProfile.id || "",
        profileImageUrl: userProfile.profileImage?.md || "",
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        nickname: userProfile.nickname || "",
        phoneNumber: userProfile.phoneNumber || "",
        email: userProfile.email || "",
        gender: userProfile.gender || "",
        dateOfBirth: userProfile.dateOfBirth || "",
        employeeId: userProfile.employeeId || "",
        position: userProfile.position || "",
        department: userProfile.department || "",
        employmentType: userProfile.employmentType || "",
        joinDate: userProfile.joinDate || "",
        leaveDate: userProfile.leaveDate || "",
        shift: userProfile.shift || "",
        remark: userProfile.remark || "",
        addresses: Array.isArray(userProfile.addresses)
          ? userProfile.addresses
          : [],
        emergencyContacts: Array.isArray(userProfile.emergencyContacts)
          ? userProfile.emergencyContacts
          : [],
        documents: Array.isArray(userProfile.documents)
          ? userProfile.documents
          : [],
        educations: Array.isArray(userProfile.educations)
          ? userProfile.educations.map((edu: any) => ({
              ...edu,
              isGraduated: typeof edu.isGraduated === 'boolean' ? String(edu.isGraduated) : edu.isGraduated
            }))
          : [],
      });
    }
    setIsEditing(false);
  };

  const handleProfileUploaded = async (result: SpacesMultiSizeResult) => {
    try {
      setIsUploadingImage(true);
      setProfileImageKeys(result);
      setValue("profileImageUrl", result.md.url, { shouldDirty: true });
      const payload = { profileImage: { sm: result.sm.url, md: result.md.url, lg: result.lg.url, o: result.o.url } };
      await dispatch(updateProfileService(payload)).unwrap();
      await dispatch(getProfileService()).unwrap();
      showToast.success(Messages.profile.pictureUpdated);
      setIsProfilePictureModalOpen(false);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.profile.pictureUpdateFailed);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfileRemove = async () => {
    try {
      setIsUploadingImage(true);
      setProfileImageKeys(undefined);
      setValue("profileImageUrl", "", { shouldDirty: true });
      const payload = { profileImage: null };
      await dispatch(updateProfileService(payload)).unwrap();
      await dispatch(getProfileService()).unwrap();
      showToast.success(Messages.profile.pictureUpdated);
      setIsProfilePictureModalOpen(false);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.profile.pictureUpdateFailed);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveDocument = (index: number) => {
    removeDocument(index);
    setDocumentKeys(prev => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = Number(k);
        if (ki < index) next[ki] = v;
        else if (ki > index) next[ki - 1] = v;
      });
      return next;
    });
  };

  const handleRemoveEducation = (index: number) => {
    removeEducation(index);
    setEducationKeys(prev => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = Number(k);
        if (ki < index) next[ki] = v;
        else if (ki > index) next[ki - 1] = v;
      });
      return next;
    });
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccountService()).unwrap();
      showToast.success(Messages.auth.accountDeleted);

      clearToken();
      clearUserInfo();

      setTimeout(() => {
        router.replace(ROUTES.AUTH.LOGIN);
      }, 100);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.auth.deleteAccountFailed);
    }
  };

  if (isProfileLoading && !userProfile) {
    return <Loading />;
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        {}
        <Card className="mb-4 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {}
              <div
                className="relative group cursor-pointer flex-shrink-0"
                onClick={() => setIsProfilePictureModalOpen(true)}
              >
                <div className="relative ring-2 ring-primary/20 rounded-full">
                  <CustomAvatar
                    imageUrl={watch("profileImageUrl") || userProfile?.profileImage?.md}
                    name={userProfile?.fullName}
                    size="xxl"
                  />
                  <div className="absolute bottom-1 right-1 bg-primary rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:shadow-primary/50 hover:bg-primary/80">
                    <Camera className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xs font-bold text-foreground">
                      {userProfile?.fullName}
                    </h2>
                    <p className="text-primary/70 text-xs font-medium">
                      {userProfile?.email}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
                        {userProfile?.userType}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={isProfileLoading || isUploadingImage}
                          className="border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary/50"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSubmit(onSubmit)}
                          disabled={
                            isProfileLoading ||
                            isUploadingImage ||
                            !isDirty
                          }
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isProfileLoading || isUploadingImage ? (
                            <>
                              <Loader2 className="h-2 w-2 mr-1 animate-spin" />
                              {isUploadingImage ? "Uploading..." : "Saving..."}
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        <Edit className="h-2 w-2 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <div className="flex gap-0 mb-5 w-full relative group border border-primary/30 rounded overflow-hidden">
          {}
          <div
            className={cn(
              "absolute inset-y-0 h-full bg-primary/5 transition-all duration-500 ease-out",
              activeSection === "profile" ? "left-0 w-1/2" : "left-1/2 w-1/2"
            )}
          />

          {}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/20" />

          {}
          <button
            onClick={() => setActiveSection("profile")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-3 px-4 relative z-10",
              "text-xs font-semibold transition-all duration-300",
              "border-r border-primary/20",
              activeSection === "profile"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            <User className={cn(
              "h-3 w-3 transition-all duration-300",
              activeSection === "profile" ? "scale-110" : "scale-100"
            )} />
            <span>Profile</span>
          </button>

          {}
          <button
            onClick={() => setActiveSection("security")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-3 px-4 relative z-10",
              "text-xs font-semibold transition-all duration-300",
              activeSection === "security"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            <Lock className={cn(
              "h-3 w-3 transition-all duration-300",
              activeSection === "security" ? "scale-110" : "scale-100"
            )} />
            <span>Security</span>
          </button>
        </div>

        {}
        {activeSection === "profile" && (
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="w-full space-y-4">
              {}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {isEditing ? (
                      <>
                        <TextField
                          control={typedControl}
                          name="firstName"
                          label="First Name"
                          placeholder="First name"
                          error={errors.firstName}
                        />

                        <TextField
                          control={typedControl}
                          name="lastName"
                          label="Last Name"
                          placeholder="Last name"
                          error={errors.lastName}
                        />

                        <TextField
                          control={typedControl}
                          name="nickname"
                          label="Nickname"
                          placeholder="Nickname"
                          error={errors.nickname}
                        />

                        <TextField
                          control={typedControl}
                          name="email"
                          label="Email"
                          placeholder="Email"
                          type="email"
                          error={errors.email}
                        />

                        <TextField
                          control={typedControl}
                          name="phoneNumber"
                          label="Phone Number"
                          placeholder="Phone"
                          error={errors.phoneNumber}
                        />

                        <SelectField
                          control={typedControl}
                          name="gender"
                          label="Gender"
                          placeholder="Select gender"
                          options={GENDER_OPTIONS}
                          error={errors.gender}
                        />

                        <DateTimePickerField
                          control={typedControl}
                          name="dateOfBirth"
                          label="Date of Birth"
                          mode="date"
                          placeholder="Date of birth"
                          error={errors.dateOfBirth}
                        />
                      </>
                    ) : (
                      <>
                        <DisplayField label="First Name" value={watch("firstName")} />
                        <DisplayField label="Last Name" value={watch("lastName")} />
                        <DisplayField label="Nickname" value={watch("nickname")} />
                        <DisplayField label="Email" value={watch("email")} />
                        <DisplayField label="Phone Number" value={watch("phoneNumber")} />
                        <DisplayField
                          label="Gender"
                          value={
                            GENDER_OPTIONS.find((o) => o.value === watch("gender"))?.label
                          }
                        />
                        <DisplayField label="Date of Birth" value={formatDate(watch("dateOfBirth"))} />
                        <DisplayField
                          label="Telegram ID"
                          value={userProfile?.telegramId}
                        />
                        <DisplayField
                          label="Telegram Username"
                          value={userProfile?.telegramUsername}
                        />
                        <DisplayField
                          label="Telegram First Name"
                          value={userProfile?.telegramFirstName}
                        />
                        <DisplayField
                          label="Telegram Last Name"
                          value={userProfile?.telegramLastName}
                        />
                        <DisplayField
                          label="Telegram Synced At"
                          value={dateTimeFormat(userProfile?.telegramSyncedAt)}
                        />
                        <DisplayField
                          label="Telegram Synced"
                          value={userProfile?.telegramSynced ? "Yes" : "No"}
                        />
                        <DisplayField
                          label="Role"
                          value={userProfile?.roles && userProfile.roles.length > 0
                            ? userProfile.roles.join(", ")
                            : "-"}
                        />
                        <DisplayField
                          label="Account Status"
                          value={userProfile?.accountStatus || "-"}
                        />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {}
              {userProfile?.businessId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-1">
                      🏢 Business Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DisplayField
                        label="Business Name"
                        value={userProfile?.businessName || "-"}
                      />
                      <DisplayField
                        label="Business ID"
                        value={userProfile?.businessId || "-"}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {}
              <Card>
                <CardHeader>
                  <CardTitle>Employment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {isEditing ? (
                      <>
                        <TextField
                          control={typedControl}
                          name="employeeId"
                          label="Employee ID"
                          placeholder="Employee ID"
                          error={errors.employeeId}
                        />

                        <TextField
                          control={typedControl}
                          name="position"
                          label="Position"
                          placeholder="Position"
                          error={errors.position}
                        />

                        <TextField
                          control={typedControl}
                          name="department"
                          label="Department"
                          placeholder="Department"
                          error={errors.department}
                        />

                        <SelectField
                          control={typedControl}
                          name="employmentType"
                          label="Employment Type"
                          placeholder="Select type"
                          options={EMPLOYMENT_TYPE_OPTIONS}
                          error={errors.employmentType}
                        />

                        <DateTimePickerField
                          control={typedControl}
                          name="joinDate"
                          label="Join Date"
                          mode="date"
                          placeholder="Join date"
                          error={errors.joinDate}
                        />

                        <DateTimePickerField
                          control={typedControl}
                          name="leaveDate"
                          label="Leave Date"
                          mode="date"
                          placeholder="Leave date"
                          error={errors.leaveDate}
                        />

                        <TextField
                          control={typedControl}
                          name="shift"
                          label="Shift"
                          placeholder="Shift"
                          error={errors.shift}
                        />
                      </>
                    ) : (
                      <>
                        <DisplayField label="Employee ID" value={watch("employeeId")} />
                        <DisplayField label="Position" value={watch("position")} />
                        <DisplayField label="Department" value={watch("department")} />
                        <DisplayField
                          label="Employment Type"
                          value={
                            EMPLOYMENT_TYPE_OPTIONS.find(
                              (o) => o.value === watch("employmentType")
                            )?.label
                          }
                        />
                        <DisplayField label="Join Date" value={formatDate(watch("joinDate"))} />
                        <DisplayField label="Leave Date" value={formatDate(watch("leaveDate"))} />
                        <DisplayField label="Shift" value={watch("shift")} />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Addresses</CardTitle>
                    {isEditing && (
                      <Button
                        type="button"
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
                        className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Address
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {addressFields.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      No addresses added
                    </p>
                  ) : isEditing ? (
                    <div className="space-y-3">
                      {addressFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="border-l-4 border-l-primary/40 rounded p-3 relative bg-primary/5"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAddress(index)}
                            className="absolute top-1 right-1 text-red-500 opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <SelectField
                              control={typedControl}
                              name={`addresses.${index}.addressType`}
                              label="Type"
                              placeholder="Type"
                              options={ADDRESS_TYPE_OPTIONS}
                              error={
                                errors.addresses?.[index]?.addressType as any
                              }
                            />
                            <TextField
                              control={typedControl}
                              name={`addresses.${index}.houseNo`}
                              label="House No"
                              placeholder="No"
                              error={
                                errors.addresses?.[index]?.houseNo as any
                              }
                            />
                            <TextField
                              control={typedControl}
                              name={`addresses.${index}.street`}
                              label="Street"
                              placeholder="Street"
                              error={
                                errors.addresses?.[index]?.street as any
                              }
                            />
                            <TextField
                              control={typedControl}
                              name={`addresses.${index}.village`}
                              label="Village"
                              placeholder="Village"
                              error={
                                errors.addresses?.[index]?.village as any
                              }
                            />
                            <TextField
                              control={typedControl}
                              name={`addresses.${index}.commune`}
                              label="Commune"
                              placeholder="Commune"
                              error={
                                errors.addresses?.[index]?.commune as any
                              }
                            />
                            <TextField
                              control={typedControl}
                              name={`addresses.${index}.district`}
                              label="District"
                              placeholder="District"
                              error={
                                errors.addresses?.[index]?.district as any
                              }
                            />
                            <TextField
                              control={typedControl}
                              name={`addresses.${index}.province`}
                              label="Province"
                              placeholder="Province"
                              error={
                                errors.addresses?.[index]?.province as any
                              }
                            />
                            <TextField
                              control={typedControl}
                              name={`addresses.${index}.country`}
                              label="Country"
                              placeholder="Country"
                              error={
                                errors.addresses?.[index]?.country as any
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addressFields.map((field: any, index) => (
                        <div key={field.id} className="border-b pb-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <DisplayField
                              label="Type"
                              value={
                                ADDRESS_TYPE_OPTIONS.find(
                                  (o) => o.value === field?.addressType
                                )?.label
                              }
                            />
                            <DisplayField label="House No" value={field?.houseNo} />
                            <DisplayField label="Street" value={field?.street} />
                            <DisplayField label="Village" value={field?.village} />
                            <DisplayField label="Commune" value={field?.commune} />
                            <DisplayField label="District" value={field?.district} />
                            <DisplayField label="Province" value={field?.province} />
                            <DisplayField label="Country" value={field?.country} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Emergency Contacts</CardTitle>
                    {isEditing && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          appendContact({
                            id: undefined,
                            name: "",
                            phone: "",
                            relationship: "",
                          })
                        }
                        className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Contact
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {contactFields.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      No emergency contacts added
                    </p>
                  ) : isEditing ? (
                    <div className="space-y-3">
                      {contactFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="border-l-4 border-l-primary/40 rounded p-3 relative bg-primary/5"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContact(index)}
                            className="absolute top-1 right-1 text-red-500 opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                            <TextField
                              control={typedControl}
                              name={`emergencyContacts.${index}.name`}
                              label="Name"
                              placeholder="Name"
                              error={
                                errors.emergencyContacts?.[index]?.name as any
                              }
                            />
                            <TextField
                              control={typedControl}
                              name={`emergencyContacts.${index}.phone`}
                              label="Phone"
                              placeholder="Phone"
                              error={
                                errors.emergencyContacts?.[index]?.phone as any
                              }
                            />
                            <TextField
                              control={typedControl}
                              name={`emergencyContacts.${index}.relationship`}
                              label="Relationship"
                              placeholder="Relationship"
                              error={
                                errors.emergencyContacts?.[index]
                                  ?.relationship as any
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contactFields.map((field: any, index) => (
                        <div key={field.id} className="border-b pb-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <DisplayField label="Name" value={field?.name} />
                            <DisplayField label="Phone" value={field?.phone} />
                            <DisplayField label="Relationship" value={field?.relationship} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Documents</CardTitle>
                    {isEditing && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          appendDocument({
                            id: undefined,
                            type: DocumentType.ID_CARD,
                            number: "",
                            fileUrl: "",
                          })
                        }
                        className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Document
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {documentFields.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      No documents added
                    </p>
                  ) : isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {documentFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="border-l-4 border-l-primary/40 rounded p-3 relative bg-primary/5"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDocument(index)}
                            className="absolute top-1 right-1 text-red-500 opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <div className="space-y-3 pt-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <SelectField
                                control={typedControl}
                                name={`documents.${index}.type`}
                                label="Type"
                                placeholder="Type"
                                options={DOCUMENT_TYPE_OPTIONS}
                                error={
                                  errors.documents?.[index]?.type as any
                                }
                              />
                              <TextField
                                control={typedControl}
                                name={`documents.${index}.number`}
                                label="Number"
                                placeholder="Number"
                                error={
                                  errors.documents?.[index]?.number as any
                                }
                              />
                            </div>
                            <div className="w-1/2">
                              <SpacesImageUpload
                                label="File"
                                businessId={userProfile?.businessId || AppDefault.BUSINESS_ID}
                                value={watch(`documents.${index}.fileUrl`) || ""}
                                imageKey={documentKeys[index]}
                                aspectRatio="auto"
                                height="h-24"
                                onChange={(result) => {
                                  setDocumentKeys(prev => ({ ...prev, [index]: result.key }));
                                  setValue(`documents.${index}.fileUrl`, result.url, { shouldDirty: true });
                                }}
                                onRemove={() => {
                                  setDocumentKeys(prev => { const n = { ...prev }; delete n[index]; return n; });
                                  setValue(`documents.${index}.fileUrl`, "", { shouldDirty: true });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documentFields.map((field: any, index) => (
                        <div key={field.id} className="border-l-4 border-l-primary/40 rounded p-3 bg-primary/5">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <DisplayField
                                label="Type"
                                value={
                                  DOCUMENT_TYPE_OPTIONS.find(
                                    (o) => o.value === field?.type
                                  )?.label
                                }
                              />
                              <DisplayField label="Number" value={field?.number} />
                            </div>
                            {field?.fileUrl && (
                              <div className="mt-3">
                                <label className="text-xs font-medium text-muted-foreground">
                                  File
                                </label>
                                <img
                                  src={field?.fileUrl}
                                  alt="Document"
                                  className="w-1/2 h-24 object-cover rounded mt-1"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Education</CardTitle>
                    {isEditing && (
                      <Button
                        type="button"
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
                        className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Education
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {educationFields.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      No education added
                    </p>
                  ) : isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {educationFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="border-l-4 border-l-primary/40 rounded p-3 relative bg-primary/5"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEducation(index)}
                            className="absolute top-1 right-1 text-red-500 opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <div className="space-y-3 pt-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <SelectField
                                control={typedControl}
                                name={`educations.${index}.level`}
                                label="Level"
                                placeholder="Level"
                                options={EDUCATION_LEVEL_OPTIONS}
                                error={
                                  errors.educations?.[index]?.level as any
                                }
                              />
                              <TextField
                                control={typedControl}
                                name={`educations.${index}.schoolName`}
                                label="School"
                                placeholder="School"
                                error={
                                  errors.educations?.[index]
                                    ?.schoolName as any
                                }
                              />
                              <TextField
                                control={typedControl}
                                name={`educations.${index}.fieldOfStudy`}
                                label="Field"
                                placeholder="Field"
                                error={
                                  errors.educations?.[index]
                                    ?.fieldOfStudy as any
                                }
                              />
                              <DateTimePickerField
                                control={typedControl}
                                name={`educations.${index}.startYear`}
                                label="Start"
                                mode="date"
                                placeholder="Start"
                                error={
                                  errors.educations?.[index]
                                    ?.startYear as any
                                }
                              />
                              <DateTimePickerField
                                control={typedControl}
                                name={`educations.${index}.endYear`}
                                label="End"
                                mode="date"
                                placeholder="End"
                                error={
                                  errors.educations?.[index]?.endYear as any
                                }
                              />
                              <SelectField
                                control={typedControl}
                                name={`educations.${index}.isGraduated`}
                                label="Graduated"
                                placeholder="Select status"
                                options={[
                                  { label: "Yes", value: "true" },
                                  { label: "No", value: "false" },
                                ]}
                                error={
                                  errors.educations?.[index]?.isGraduated as any
                                }
                              />
                            </div>
                            <div className="w-1/2">
                              <SpacesImageUpload
                                label="Certificate"
                                businessId={userProfile?.businessId || AppDefault.BUSINESS_ID}
                                value={watch(`educations.${index}.certificateUrl`) || ""}
                                imageKey={educationKeys[index]}
                                aspectRatio="auto"
                                height="h-24"
                                onChange={(result) => {
                                  setEducationKeys(prev => ({ ...prev, [index]: result.key }));
                                  setValue(`educations.${index}.certificateUrl`, result.url, { shouldDirty: true });
                                }}
                                onRemove={() => {
                                  setEducationKeys(prev => { const n = { ...prev }; delete n[index]; return n; });
                                  setValue(`educations.${index}.certificateUrl`, "", { shouldDirty: true });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {educationFields.map((field: any, index) => (
                        <div key={field.id} className="border-l-4 border-l-primary/40 rounded p-3 bg-primary/5">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <DisplayField
                                label="Level"
                                value={
                                  EDUCATION_LEVEL_OPTIONS.find(
                                    (o) => o.value === field?.level
                                  )?.label
                                }
                              />
                              <DisplayField label="School" value={field?.schoolName} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <DisplayField label="Field of Study" value={field?.fieldOfStudy} />
                              <DisplayField label="Start Year" value={field?.startYear} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <DisplayField label="End Year" value={field?.endYear} />
                              <DisplayField
                                label="Graduated"
                                value={field?.isGraduated ? "Yes" : "No"}
                              />
                            </div>
                          </div>
                          {field?.certificateUrl && (
                            <div className="mt-3">
                              <label className="text-xs font-medium text-muted-foreground">
                                Certificate
                              </label>
                              <img
                                src={field?.certificateUrl}
                                alt="Certificate"
                                className="w-1/2 h-24 object-cover rounded mt-1"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <TextareaField
                      control={typedControl}
                      name="remark"
                      label="Remarks"
                      placeholder="Additional notes or information"
                      rows={4}
                      error={errors.remark}
                    />
                  ) : (
                    <DisplayField label="Remarks" value={watch("remark")} />
                  )}
                </CardContent>
              </Card>
            </div>
          </form>
        )}

        {}
        {activeSection === "security" && (
          <div className="w-full space-y-3">
            {}
            <div>
              <h3 className="text-xs font-medium text-primary mb-2 flex items-center gap-1 font-semibold">
                <Link2 className="h-3 w-3" />
                Connected Accounts
              </h3>
              <TelegramSyncCard />
            </div>

            {}

            {}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Change Password
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Update your password to keep your account secure
                    </p>
                  </div>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => setIsChangePasswordModalOpen(true)}
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {}
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-destructive">
                      Delete Account
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      <ProfilePictureModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        currentImageUrl={watch("profileImageUrl") || userProfile?.profileImage?.md}
        userName={userProfile?.fullName}
        businessId={userProfile?.businessId || AppDefault.BUSINESS_ID}
        imageKeys={profileImageKeys}
        onUploaded={handleProfileUploaded}
        onRemove={handleProfileRemove}
        isLoading={isUploadingImage}
      />

      {}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

      {}
      <DeleteConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteAccount}
        title="Delete Account"
        description="Are you absolutely sure you want to delete your account? This will permanently delete your account and remove all your data from our servers."
        itemName={userProfile?.email}
        isSubmitting={isProfileLoading}
        variant="critical"
        requireConfirmation={true}
        confirmationText="DELETE"
      />
      </div>
    </div>
  );
}
