"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2, Trash2, Lock, User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DatePickerField } from "@/components/shared/form-field/date-picker-field";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import {
  getBusinessProfileService,
  updateBusinessProfileService,
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
import { clearAllTokens } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { isBase64Image, uploadImage } from "@/utils/common/upload-image";
import { GENDER_OPTIONS } from "@/constants/app-resource/status/create-update-status";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";
import Loading from "@/components/shared/common/loading";
import {
  profileUpdateSchema,
  ProfileFormData,
} from "@/redux/features/auth/store/models/schema/user.schema";
import { TelegramSyncCard } from "@/components/shared/telegram/telegram-sync-card";
import { formatEnumLabel } from "@/utils/common/enum-convert";

export default function AdminProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { accessToken, authReady } = useAuthState();

  const userProfile = useAppSelector(selectProfile);
  const isProfileLoading = useAppSelector(selectIsProfileLoading);
  const reduxError = useAppSelector(selectError);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileUpdateSchema),
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
      remark: "",
    },
    mode: "onChange",
  });

  const typedControl = control as any;

  const profileFetchedRef = useRef(false);
  useEffect(() => {
    if (authReady && accessToken && !userProfile && !isProfileLoading && !profileFetchedRef.current) {
      profileFetchedRef.current = true;
      dispatch(getBusinessProfileService());
    }
  }, [authReady, accessToken, dispatch, userProfile, isProfileLoading]);

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
        remark: userProfile.remark || "",
      });
    }
  }, [userProfile, reset]);

  useEffect(() => {
    if (reduxError) {
      showToast.error(reduxError);
      dispatch(clearError());
    }
  }, [reduxError, dispatch]);

  const onSubmit = async (data: ProfileFormData) => {
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

      const payload: any = {};
      if (data.firstName) payload.firstName = data.firstName;
      if (data.lastName) payload.lastName = data.lastName;
      if (data.phoneNumber) payload.phoneNumber = data.phoneNumber;
      if (data.email) payload.email = data.email;
      if (data.nickname) payload.nickname = data.nickname;
      if (data.gender) payload.gender = data.gender;
      if (data.dateOfBirth) payload.dateOfBirth = data.dateOfBirth;
      if (profileImageUrl) payload.profileImageUrl = profileImageUrl;
      if (data.remark) payload.remark = data.remark;

      await dispatch(updateBusinessProfileService(payload)).unwrap();
      await dispatch(getBusinessProfileService()).unwrap();
      showToast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || "Failed to update profile");
      setIsUploadingImage(false);
    }
  };

  const handleAutoUploadProfilePicture = async (imageData: string) => {
    try {
      setIsUploadingImage(true);
      let profileImageUrl = imageData;
      if (isBase64Image(profileImageUrl)) {
        try {
          profileImageUrl = await uploadImage(profileImageUrl);
        } catch {
          showToast.error("Failed to upload profile image");
          setIsUploadingImage(false);
          return;
        }
      }
      setValue("profileImageUrl", profileImageUrl, { shouldDirty: true });
      await dispatch(updateBusinessProfileService({ profileImageUrl })).unwrap();
      await dispatch(getBusinessProfileService()).unwrap();
      showToast.success("Profile picture updated successfully");
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || "Failed to update profile picture");
      if (userProfile?.profileImageUrl) setValue("profileImageUrl", userProfile.profileImageUrl);
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
        remark: userProfile.remark || "",
      });
    }
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccountService()).unwrap();
      showToast.success("Account deleted successfully");
      clearAllTokens();
      clearUserInfo();
      setTimeout(() => { router.replace(ROUTES.AUTH.LOGIN); }, 100);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || "Failed to delete account");
    }
  };

  if (isProfileLoading && !userProfile) {
    return <Loading />;
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        {/* Profile Header */}
        <Card className="mb-4 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="relative group cursor-pointer"
                onClick={() => setIsProfilePictureModalOpen(true)}
              >
                <div className="relative ring-2 ring-primary/20 rounded">
                  <CustomAvatar
                    imageUrl={userProfile?.profileImageUrl}
                    name={userProfile?.fullName}
                    size="xl"
                  />
                  <div className="absolute bottom-1 right-1 bg-primary rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:shadow-primary/50 hover:bg-primary/80">
                    <Camera className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-foreground">{userProfile?.fullName}</h2>
                    <p className="text-primary/70 text-xs font-medium">{userProfile?.email}</p>
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
                          disabled={isProfileLoading || isUploadingImage || !isDirty}
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

        {/* Navigation Tabs */}
        <div className="flex gap-0 mb-5 w-full relative group border border-primary/30 rounded overflow-hidden">
          <div
            className={cn(
              "absolute inset-y-0 h-full bg-primary/5 transition-all duration-500 ease-out",
              activeSection === "profile" ? "left-0 w-1/2" : "left-1/2 w-1/2"
            )}
          />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/20" />
          <button
            onClick={() => setActiveSection("profile")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-3 px-4 relative z-10",
              "text-xs font-semibold transition-all duration-300 border-r border-primary/20",
              activeSection === "profile" ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            <User className={cn("h-3 w-3 transition-all duration-300", activeSection === "profile" ? "scale-110" : "scale-100")} />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveSection("security")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-3 px-4 relative z-10",
              "text-xs font-semibold transition-all duration-300",
              activeSection === "security" ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            <Lock className={cn("h-3 w-3 transition-all duration-300", activeSection === "security" ? "scale-110" : "scale-100")} />
            <span>Security</span>
          </button>
        </div>

        {/* Profile Section */}
        {activeSection === "profile" && (
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="w-full space-y-4">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {isEditing ? (
                      <>
                        <TextField control={typedControl} name="firstName" label="First Name" placeholder="First name" error={errors.firstName} />
                        <TextField control={typedControl} name="lastName" label="Last Name" placeholder="Last name" error={errors.lastName} />
                        <TextField control={typedControl} name="nickname" label="Nickname" placeholder="Nickname" error={errors.nickname} />
                        <TextField control={typedControl} name="email" label="Email" placeholder="Email" type="email" error={errors.email} />
                        <TextField control={typedControl} name="phoneNumber" label="Phone Number" placeholder="Phone" error={errors.phoneNumber} />
                        <SelectField control={typedControl} name="gender" label="Gender" placeholder="Select gender" options={GENDER_OPTIONS} error={errors.gender} />
                        <DatePickerField control={typedControl} name="dateOfBirth" label="Date of Birth" placeholder="Date of birth" error={errors.dateOfBirth} />
                      </>
                    ) : (
                      <>
                        <DisplayField label="First Name" value={watch("firstName")} />
                        <DisplayField label="Last Name" value={watch("lastName")} />
                        <DisplayField label="Full Name" value={userProfile?.fullName} />
                        <DisplayField label="Nickname" value={watch("nickname")} />
                        <DisplayField label="Email" value={watch("email")} />
                        <DisplayField label="Phone Number" value={watch("phoneNumber")} />
                        <DisplayField label="Gender" value={GENDER_OPTIONS.find((o) => o.value === watch("gender"))?.label} />
                        <DisplayField label="Date of Birth" value={formatDate(watch("dateOfBirth"))} />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Details (read-only) */}
              {!isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DisplayField label="User Identifier" value={userProfile?.userIdentifier} />
                      <DisplayField label="User Type" value={formatEnumLabel(userProfile?.userType)} />
                      <DisplayField label="Account Status" value={formatEnumLabel(userProfile?.accountStatus)} />
                      <DisplayField label="Status" value={formatEnumLabel(userProfile?.status)} />
                      <DisplayField label="Roles" value={userProfile?.roles?.length ? userProfile.roles.map(formatEnumLabel).join(", ") : undefined} />
                      <DisplayField label="Last Login" value={dateTimeFormat(userProfile?.lastLoginAt)} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Telegram Info (read-only) */}
              {!isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Telegram Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DisplayField label="Telegram ID" value={userProfile?.telegramId?.toString()} />
                      <DisplayField label="Telegram Username" value={userProfile?.telegramUsername} />
                      <DisplayField label="Telegram First Name" value={userProfile?.telegramFirstName} />
                      <DisplayField label="Telegram Last Name" value={userProfile?.telegramLastName} />
                      <DisplayField label="Telegram Photo URL" value={userProfile?.telegramPhotoUrl} />
                      <DisplayField label="Telegram Synced At" value={dateTimeFormat(userProfile?.telegramSyncedAt)} />
                      <DisplayField label="Telegram Synced" value={userProfile?.telegramSynced !== undefined ? (userProfile.telegramSynced ? "Yes" : "No") : undefined} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <TextareaField control={typedControl} name="remark" label="Remarks" placeholder="Additional notes or information" rows={4} error={errors.remark} />
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
          <div className="w-full space-y-3">
            {/* Connected Accounts */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Connected Accounts</h3>
              <TelegramSyncCard />
            </div>

            {/* Change Password */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Change Password</h3>
                    <p className="text-xs text-muted-foreground mt-1">Update your password to keep your account secure</p>
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

            {/* Delete Account */}
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-destructive">Delete Account</h3>
                    <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all associated data</p>
                  </div>
                  <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ProfilePictureModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        currentImageUrl={userProfile?.profileImageUrl}
        userName={userProfile?.fullName}
        onImageSelect={handleAutoUploadProfilePicture}
        onImageRemove={async () => {
          try {
            setIsUploadingImage(true);
            await dispatch(updateBusinessProfileService({ profileImageUrl: "" })).unwrap();
            await dispatch(getBusinessProfileService()).unwrap();
            showToast.success("Profile picture removed successfully");
            setIsProfilePictureModalOpen(false);
          } catch (error: unknown) {
            showToast.error((error as { message?: string })?.message || "Failed to remove profile picture");
          } finally {
            setIsUploadingImage(false);
          }
        }}
        isLoading={isUploadingImage}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

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
  );
}
