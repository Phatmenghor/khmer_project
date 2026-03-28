"use client";

import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getProfileService,
  updateProfileService,
  deleteAccountService,
} from "@/redux/features/auth/store/thunks/auth-thunks";
import {
  selectProfile,
  selectIsProfileLoading,
  selectError,
} from "@/redux/features/auth/store/selectors/auth-selectors";
import { showToast } from "@/components/shared/common/show-toast";
import { clearError } from "@/redux/features/auth/store/slice/auth-slice";
import ChangePasswordModal from "@/components/shared/modal/change-password-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { ProfilePictureModal } from "@/components/shared/modal/profile-picture-modal";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { clearToken } from "@/utils/local-storage/token";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { isBase64Image, uploadImage } from "@/utils/common/upload-image";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
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

// Profile update schema
import {
  updateUserSchema,
  UserFormData,
} from "@/redux/features/auth/store/models/schema/user.schema";

export default function AdminProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const userProfile = useAppSelector(selectProfile);
  const isProfileLoading = useAppSelector(selectIsProfileLoading);
  const reduxError = useAppSelector(selectError);
  const socialSync = useAppSelector((state) => state.auth.socialSync);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

  // Type assertion for control to fix TypeScript compatibility
  const typedControl = control as any;

  // Field arrays
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

  // Load profile on mount
  useEffect(() => {
    dispatch(getProfileService());
  }, [dispatch]);

  // Update form when profile loads
  useEffect(() => {
    if (userProfile) {
      reset({
        id: userProfile.id || "",
        profileImageUrl: userProfile.profileImageUrl || "",
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

  // Clear errors when they appear
  useEffect(() => {
    if (reduxError) {
      showToast.error(reduxError);
      dispatch(clearError());
    }
  }, [reduxError, dispatch]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsUploadingImage(true);

      // Process profile image URL
      let profileImageUrl = data.profileImageUrl;
      if (profileImageUrl && isBase64Image(profileImageUrl)) {
        try {
          profileImageUrl = await uploadImage(profileImageUrl);
        } catch (error) {
          console.error("Failed to upload profile image:", error);
          showToast.error("Failed to upload profile image");
          setIsUploadingImage(false);
          return;
        }
      }

      // Process document file URLs
      const processedDocuments = await Promise.all(
        (data.documents || []).map(async (doc) => {
          let fileUrl = doc.fileUrl;
          if (fileUrl && isBase64Image(fileUrl)) {
            try {
              fileUrl = await uploadImage(fileUrl);
            } catch (error) {
              console.error("Failed to upload document file:", error);
              return null;
            }
          }
          // Only include documents with a fileUrl
          if (!fileUrl) {
            return null;
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

      // Process education certificate URLs
      const processedEducations = await Promise.all(
        (data.educations || []).map(async (edu) => {
          let certificateUrl = edu.certificateUrl;
          if (certificateUrl && isBase64Image(certificateUrl)) {
            try {
              certificateUrl = await uploadImage(certificateUrl);
            } catch (error) {
              console.error("Failed to upload certificate:", error);
              return null;
            }
          }
          // Only include educations with a certificateUrl
          if (!certificateUrl) {
            return null;
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

      const validEducations = processedEducations.filter(
        (edu) => edu !== null
      );

      setIsUploadingImage(false);

      // Build clean payload for backend - only include fields that have actual values
      // Backend expects specific enum formats and proper structure
      const payload: any = {};

      // Required fields - always include
      if (data.firstName) payload.firstName = data.firstName;
      if (data.lastName) payload.lastName = data.lastName;
      if (data.phoneNumber) payload.phoneNumber = data.phoneNumber;
      if (data.email) payload.email = data.email;

      // Personal information - optional but include if present
      if (data.nickname) payload.nickname = data.nickname;
      if (data.gender) payload.gender = data.gender; // Backend expects: MALE, FEMALE, OTHER
      if (data.dateOfBirth) payload.dateOfBirth = data.dateOfBirth; // Format: YYYY-MM-DD
      if (profileImageUrl) payload.profileImageUrl = profileImageUrl;

      // Employment information - optional but include if present
      if (data.employeeId) payload.employeeId = data.employeeId;
      if (data.position) payload.position = data.position;
      if (data.department) payload.department = data.department;
      if (data.employmentType) payload.employmentType = data.employmentType; // Backend expects: FULL_TIME, PART_TIME, CONTRACT
      if (data.joinDate) payload.joinDate = data.joinDate; // Format: YYYY-MM-DD
      if (data.leaveDate) payload.leaveDate = data.leaveDate; // Format: YYYY-MM-DD
      if (data.shift) payload.shift = data.shift;
      if (data.remark) payload.remark = data.remark;

      // Array fields - only include non-empty arrays to avoid unwanted deletions
      // Empty array = delete all related records, so only send if we have data
      if (addressFields.length > 0 && data.addresses && data.addresses.length > 0) {
        payload.addresses = data.addresses.map((addr: any) => ({
          id: addr.id || undefined,
          addressType: addr.addressType, // Backend expects: CURRENT, PLACE_OF_BIRTH, PERMANENT
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
          type: doc.type, // Backend expects: ID_CARD, PASSPORT, DRIVER_LICENSE
          number: doc.number,
          fileUrl: doc.fileUrl,
        }));
      }

      if (validEducations.length > 0) {
        payload.educations = validEducations.map((edu: any) => ({
          id: edu.id || undefined,
          level: edu.level, // Backend expects: PRESCHOOL, PRIMARY, SECONDARY, TERTIARY, VOCATIONAL
          schoolName: edu.schoolName,
          fieldOfStudy: edu.fieldOfStudy,
          startYear: edu.startYear,
          endYear: edu.endYear,
          isGraduated: typeof edu.isGraduated === 'string' ? edu.isGraduated === 'true' : (edu.isGraduated || false),
          certificateUrl: edu.certificateUrl,
        }));
      }

      console.log("🔄 [UPDATE] Sending payload to backend:", payload);
      const updatedProfile = await dispatch(updateProfileService(payload)).unwrap();
      console.log("✅ [UPDATE] Backend response:", updatedProfile);

      // Reload profile data to ensure we have the latest from server
      console.log("🔄 [FETCH] Reloading profile data...");
      const freshProfile = await dispatch(getProfileService()).unwrap();
      console.log("✅ [FETCH] Fresh profile loaded:", freshProfile);

      showToast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showToast.error(error || "Failed to update profile");
      setIsUploadingImage(false);
    }
  };

  const handleAutoUploadProfilePicture = async (imageData: string) => {
    try {
      setIsUploadingImage(true);

      // Update form immediately for preview
      setValue("profileImageUrl", imageData, {
        shouldDirty: true,
      });

      // Upload to API
      const payload = {
        profileImageUrl: imageData,
      };

      console.log("🔄 [UPLOAD] Uploading profile picture...");
      const updatedProfile = await dispatch(updateProfileService(payload)).unwrap();
      console.log("✅ [UPLOAD] Profile picture uploaded:", updatedProfile);

      // Reload profile to ensure we have the latest from server
      const freshProfile = await dispatch(getProfileService()).unwrap();
      console.log("✅ [FETCH] Fresh profile loaded:", freshProfile);

      showToast.success("Profile picture updated successfully");
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      showToast.error(error || "Failed to update profile picture");
      // Reset the form value on error
      if (userProfile?.profileImageUrl) {
        setValue("profileImageUrl", userProfile.profileImageUrl);
      }
    } finally {
      setIsUploadingImage(false);
      setIsProfilePictureModalOpen(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      reset({
        id: userProfile.id || "",
        profileImageUrl: userProfile.profileImageUrl || "",
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

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccountService()).unwrap();
      showToast.success("Account deleted successfully");

      clearToken();
      clearUserInfo();

      setTimeout(() => {
        router.replace(ROUTES.AUTH.LOGIN);
      }, 100);
    } catch (error: any) {
      showToast.error(error || "Failed to delete account");
    }
  };

  if (isProfileLoading && !userProfile) {
    return <Loading />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {/* Profile Image - Camera Icon */}
              <div
                className="relative group cursor-pointer"
                onClick={() => setIsProfilePictureModalOpen(true)}
              >
                <div className="relative">
                  <CustomAvatar
                    imageUrl={userProfile?.profileImageUrl}
                    name={userProfile?.fullName}
                    size="xxl"
                  />
                  {/* Camera Icon Overlay - Auto show on hover */}
                  <div className="absolute bottom-0 right-0 bg-primary rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-primary/90 hover:scale-110">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {userProfile?.fullName}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {userProfile?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {userProfile?.userType}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={isProfileLoading || isUploadingImage}
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
                        >
                          {isProfileLoading || isUploadingImage ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              {isUploadingImage ? "Uploading..." : "Saving..."}
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 bg-card rounded-lg p-1 border w-full">
          <Button
            variant={activeSection === "profile" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveSection("profile")}
            className="flex-1 justify-center"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <Button
            variant={activeSection === "security" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveSection("security")}
            className="flex-1 justify-center"
          >
            <Lock className="h-4 w-4 mr-2" />
            Security
          </Button>
        </div>

        {/* Profile Section */}
        {activeSection === "profile" && (
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="w-full space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <DisplayField label="Date of Birth" value={watch("dateOfBirth")} />
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
                          value={userProfile?.telegramSyncedAt}
                        />
                        <DisplayField
                          label="Telegram Synced"
                          value={userProfile?.telegramSynced ? "Yes" : "No"}
                        />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Employment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Employment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <DisplayField label="Join Date" value={watch("joinDate")} />
                        <DisplayField label="Leave Date" value={watch("leaveDate")} />
                        <DisplayField label="Shift" value={watch("shift")} />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Addresses */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Addresses</CardTitle>
                    {isEditing && (
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
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {addressFields.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No addresses added
                    </p>
                  ) : isEditing ? (
                    <div className="space-y-4">
                      {addressFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="border rounded-lg p-4 relative"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAddress(index)}
                            className="absolute top-2 right-2 text-red-500 opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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
                    <div className="space-y-6">
                      {addressFields.map((field: any, index) => (
                        <div key={field.id} className="border-b pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Emergency Contacts */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Emergency Contacts</CardTitle>
                    {isEditing && (
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
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Contact
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {contactFields.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No emergency contacts added
                    </p>
                  ) : isEditing ? (
                    <div className="space-y-4">
                      {contactFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="border rounded-lg p-4 relative"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContact(index)}
                            className="absolute top-2 right-2 text-red-500 opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
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
                    <div className="space-y-6">
                      {contactFields.map((field: any, index) => (
                        <div key={field.id} className="border-b pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Documents */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Documents</CardTitle>
                    {isEditing && (
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
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Document
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {documentFields.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No documents added
                    </p>
                  ) : isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documentFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="border rounded-lg p-4 relative"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(index)}
                            className="absolute top-2 right-2 text-red-500 opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <ClickableImageUpload
                                label="File"
                                value={
                                  watch(`documents.${index}.fileUrl`) || ""
                                }
                                onChange={(base64) =>
                                  setValue(
                                    `documents.${index}.fileUrl`,
                                    base64,
                                    { shouldDirty: true }
                                  )
                                }
                                aspectRatio="auto"
                                height="h-32"
                                maxSize={5}
                                error={
                                  errors.documents?.[index]?.fileUrl as any
                                }
                                placeholder="Upload"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {documentFields.map((field: any, index) => (
                        <div key={field.id} className="border rounded-lg p-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <div className="mt-4">
                                <label className="text-sm font-medium text-muted-foreground">
                                  File
                                </label>
                                <img
                                  src={field?.fileUrl}
                                  alt="Document"
                                  className="w-1/2 h-32 object-cover rounded mt-2"
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

              {/* Education */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Education</CardTitle>
                    {isEditing && (
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
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {educationFields.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No education added
                    </p>
                  ) : isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {educationFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="border rounded-lg p-4 relative"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(index)}
                            className="absolute top-2 right-2 text-red-500 opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <ClickableImageUpload
                                label="Certificate"
                                value={
                                  watch(`educations.${index}.certificateUrl`) ||
                                  ""
                                }
                                onChange={(base64) =>
                                  setValue(
                                    `educations.${index}.certificateUrl`,
                                    base64,
                                    { shouldDirty: true }
                                  )
                                }
                                aspectRatio="auto"
                                height="h-32"
                                maxSize={5}
                                error={
                                  errors.educations?.[index]
                                    ?.certificateUrl as any
                                }
                                placeholder="Upload"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {educationFields.map((field: any, index) => (
                        <div key={field.id} className="border rounded-lg p-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <DisplayField label="Field of Study" value={field?.fieldOfStudy} />
                              <DisplayField label="Start Year" value={field?.startYear} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <DisplayField label="End Year" value={field?.endYear} />
                              <DisplayField
                                label="Graduated"
                                value={field?.isGraduated ? "Yes" : "No"}
                              />
                            </div>
                          </div>
                          {field?.certificateUrl && (
                            <div className="mt-4">
                              <label className="text-sm font-medium text-muted-foreground">
                                Certificate
                              </label>
                              <img
                                src={field?.certificateUrl}
                                alt="Certificate"
                                className="w-1/2 h-32 object-cover rounded mt-2"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Remarks */}
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

        {/* Security Section */}
        {activeSection === "security" && (
          <div className="w-full space-y-4">
            {/* Connected Accounts */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Connected Accounts
              </h3>
              <TelegramSyncCard socialSync={socialSync} />
            </div>

            {/* Active Sessions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Active Sessions
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage your active sessions and sign out from other
                      devices
                    </p>
                  </div>
                  <Link href="/admin/sessions">
                    <Button variant="outline">
                      <Monitor className="h-4 w-4 mr-2" />
                      View Sessions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Change Password
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Update your password to keep your account secure
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsChangePasswordModalOpen(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="border-destructive/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-destructive">
                      Delete Account
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        currentImageUrl={userProfile?.profileImageUrl}
        userName={userProfile?.fullName}
        onImageSelect={(imageData) => {
          handleAutoUploadProfilePicture(imageData);
        }}
        onImageRemove={() => {
          setValue("profileImageUrl", "", {
            shouldDirty: true,
          });
        }}
        isLoading={isUploadingImage}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

      {/* Delete Account Confirmation */}
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
