"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit, Loader2, Trash2, Lock, User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getCustomerProfileService,
  updateCustomerProfileService,
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
import { clearToken } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { SpacesMultiSizeResult } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";
import { TelegramSyncCard } from "@/components/shared/telegram/telegram-sync-card";
import { PageContainer } from "@/components/shared/common/page-container";
import { GENDER_OPTIONS } from "@/constants/form-options";
import { ROUTES } from "@/constants/app-routes/routes";
import { formatEnumLabel } from "@/utils/common/common";


const customerProfileSchema = z.object({
  profileImageUrl: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  nickname: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

type CustomerProfileFormData = z.infer<typeof customerProfileSchema>;

export default function PublicProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const userProfile = useAppSelector(selectProfile);
  const isProfileLoading = useAppSelector(selectIsProfileLoading);
  const reduxError = useAppSelector(selectError);
  const socialSync = useAppSelector((state) => state.auth.socialSync);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileImageKeys, setProfileImageKeys] = useState<SpacesMultiSizeResult | undefined>();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CustomerProfileFormData>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: {
      profileImageUrl: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      nickname: "",
      gender: "",
      dateOfBirth: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userProfile && !isProfileLoading) {
      dispatch(getCustomerProfileService());
    }
  }, [dispatch, userProfile, isProfileLoading]);


  useEffect(() => {
    if (userProfile) {
      reset({
        profileImageUrl: userProfile.profileImage?.md || "",
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phoneNumber: userProfile.phoneNumber || "",
        nickname: userProfile.nickname || "",
        gender: userProfile.gender || "",
        dateOfBirth: userProfile.dateOfBirth || "",
      });
    }
  }, [userProfile, reset]);


  useEffect(() => {
    if (reduxError) {
      showToast.error(reduxError);
      dispatch(clearError());
    }
  }, [reduxError, dispatch]);

  const onSubmit = async (data: CustomerProfileFormData) => {
    try {
      const profileImageUrls: ImageUrls | undefined = profileImageKeys
        ? { sm: profileImageKeys.sm.url, md: profileImageKeys.md.url, lg: profileImageKeys.lg.url, o: profileImageKeys.o.url }
        : (data.profileImageUrl ? { sm: data.profileImageUrl, md: data.profileImageUrl, lg: data.profileImageUrl, o: data.profileImageUrl } : undefined);

      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
      };

      if (data.nickname) payload.nickname = data.nickname;
      if (data.gender) payload.gender = data.gender;
      if (data.dateOfBirth) payload.dateOfBirth = data.dateOfBirth;
      if (profileImageUrls) payload.profileImage = profileImageUrls;

      await dispatch(updateCustomerProfileService(payload)).unwrap();


      await dispatch(getCustomerProfileService()).unwrap();

      showToast.success(Messages.profile.updated);
      setIsEditing(false);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.profile.updateFailed);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      reset({
        profileImageUrl: userProfile.profileImage?.md || "",
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phoneNumber: userProfile.phoneNumber || "",
        nickname: userProfile.nickname || "",
        gender: userProfile.gender || "",
        dateOfBirth: userProfile.dateOfBirth || "",
      });
    }
    setIsEditing(false);
  };

  const handleProfileUploaded = async (result: SpacesMultiSizeResult) => {
    try {
      setIsUploadingImage(true);
      setProfileImageKeys(result);
      setValue("profileImageUrl", result.md.url, { shouldDirty: false });
      const payload = { profileImage: { sm: result.sm.url, md: result.md.url, lg: result.lg.url, o: result.o.url } };
      await dispatch(updateCustomerProfileService(payload)).unwrap();
      await dispatch(getCustomerProfileService()).unwrap();
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
      setValue("profileImageUrl", "", { shouldDirty: false });
      const payload = { profileImage: null };
      await dispatch(updateCustomerProfileService(payload)).unwrap();
      await dispatch(getCustomerProfileService()).unwrap();
      showToast.success(Messages.profile.pictureUpdated);
      setIsProfilePictureModalOpen(false);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.profile.pictureUpdateFailed);
    } finally {
      setIsUploadingImage(false);
    }
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



  if (!mounted || (isProfileLoading && !userProfile)) {
    return <ProfilePageSkeleton />;
  }

  return (
    <PageContainer className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col gap-3 py-3">
        {}
        <div className="w-full mb-1">
          <h1 className="text-xs font-bold text-foreground">
            Customer Profile
          </h1>
          <p className="text-muted-foreground text-xs mt-1">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="space-y-3 w-full">
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
                      className="border-0 shadow-none"
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
                          {userProfile?.accountStatus}
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
                              isProfileLoading || isUploadingImage || !isDirty
                            }
                            className="bg-primary hover:bg-primary/90"
                          >
                            {isProfileLoading || isUploadingImage ? (
                              <>
                                <Loader2 className="h-2 w-2 mr-1 animate-spin" />
                                {isUploadingImage
                                  ? "Uploading..."
                                  : "Saving..."}
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
                activeSection === "profile" ? "left-0 w-1/2" : "left-1/2 w-1/2",
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
                  : "text-muted-foreground hover:text-foreground/70",
              )}
            >
              <User
                className={cn(
                  "h-3 w-3 transition-all duration-300",
                  activeSection === "profile" ? "scale-110" : "scale-100",
                )}
              />
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
                  : "text-muted-foreground hover:text-foreground/70",
              )}
            >
              <Lock
                className={cn(
                  "h-3 w-3 transition-all duration-300",
                  activeSection === "security" ? "scale-110" : "scale-100",
                )}
              />
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
                            control={control}
                            name="firstName"
                            label="First Name"
                            placeholder="First name"
                            error={errors.firstName}
                          />

                          <TextField
                            control={control}
                            name="lastName"
                            label="Last Name"
                            placeholder="Last name"
                            error={errors.lastName}
                          />

                          <TextField
                            control={control}
                            name="nickname"
                            label="Nickname"
                            placeholder="Nickname"
                            error={errors.nickname}
                          />

                          <TextField
                            control={control}
                            name="email"
                            label="Email"
                            placeholder="Email"
                            type="email"
                            error={errors.email}
                          />

                          <TextField
                            control={control}
                            name="phoneNumber"
                            label="Phone Number"
                            placeholder="Phone"
                            error={errors.phoneNumber}
                          />

                          <SelectField
                            control={control}
                            name="gender"
                            label="Gender"
                            placeholder="Select gender"
                            options={GENDER_OPTIONS}
                            error={errors.gender}
                          />

                          <DateTimePickerField
                            control={control}
                            name="dateOfBirth"
                            label="Date of Birth"
                            mode="date"
                            placeholder="Date of birth"
                            error={errors.dateOfBirth}
                          />
                        </>
                      ) : (
                        <>
                          <DisplayField
                            label="First Name"
                            value={watch("firstName")}
                          />
                          <DisplayField
                            label="Last Name"
                            value={watch("lastName")}
                          />
                          <DisplayField
                            label="Full Name"
                            value={userProfile?.fullName}
                          />
                          <DisplayField
                            label="Nickname"
                            value={watch("nickname")}
                          />
                          <DisplayField label="Email" value={watch("email")} />
                          <DisplayField
                            label="Phone Number"
                            value={watch("phoneNumber")}
                          />
                          <DisplayField
                            label="Gender"
                            value={
                              GENDER_OPTIONS.find(
                                (o) => o.value === watch("gender"),
                              )?.label
                            }
                          />
                          <DisplayField
                            label="Date of Birth"
                            value={watch("dateOfBirth")}
                          />
                          <DisplayField
                            label="User Identifier"
                            value={userProfile?.userIdentifier}
                          />
                          <DisplayField
                            label="User Type"
                            value={formatEnumLabel(userProfile?.userType)}
                          />
                          <DisplayField
                            label="Account Status"
                            value={formatEnumLabel(userProfile?.accountStatus)}
                          />
                          <DisplayField
                            label="Status"
                            value={formatEnumLabel(userProfile?.status)}
                          />
                          <DisplayField
                            label="Roles"
                            value={userProfile?.roles?.length ? userProfile.roles.map(formatEnumLabel).join(", ") : undefined}
                          />
                          <DisplayField
                            label="Remark"
                            value={userProfile?.remark}
                          />
                          <DisplayField
                            label="Last Login"
                            value={userProfile?.lastLoginAt}
                          />
                          <DisplayField
                            label="Telegram ID"
                            value={userProfile?.telegramId?.toString()}
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
                            label="Telegram Photo URL"
                            value={userProfile?.telegramPhotoUrl}
                          />
                          <DisplayField
                            label="Telegram Synced At"
                            value={userProfile?.telegramSyncedAt}
                          />
                          <DisplayField
                            label="Telegram Synced"
                            value={userProfile?.telegramSynced !== undefined ? (userProfile.telegramSynced ? "Yes" : "No") : undefined}
                          />
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          )}

          {}
          {activeSection === "security" && (
            <div className="space-y-3">
              {}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground mb-2">
                  Connected Accounts
                </h3>
                <TelegramSyncCard />
              </div>

              {}
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Change Password
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsChangePasswordModalOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <Lock className="h-3 w-3 mr-1" />
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {}
              <Card className="border-destructive/50">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
                      size="sm"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {}

          <ProfilePictureModal
            isOpen={isProfilePictureModalOpen}
            onClose={() => setIsProfilePictureModalOpen(false)}
            currentImageUrl={watch("profileImageUrl") || userProfile?.profileImage?.md}
            userName={userProfile?.fullName}
            businessId={userProfile?.businessId || AppDefault.BUSINESS_ID}
            onUploaded={handleProfileUploaded}
            onRemove={handleProfileRemove}
            isLoading={isUploadingImage}
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

          {}
          <ChangePasswordModal
            isOpen={isChangePasswordModalOpen}
            onClose={() => setIsChangePasswordModalOpen(false)}
          />

        </div>
      </div>
    </PageContainer>
  );
}

function ProfilePageSkeleton() {
  return (
    <PageContainer className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col gap-3 py-3">
        <div className="w-full mb-1">
          <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          <div className="h-3 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="space-y-3 w-full">
          <Card className="mb-4 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-3 w-28 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-40 bg-muted animate-pulse rounded" />
                      <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                    </div>
                    <div className="h-7 w-14 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-0 mb-5 w-full border border-primary/30 rounded overflow-hidden">
            <div className="flex-1 h-10 bg-muted/30 animate-pulse" />
            <div className="w-px bg-primary/20" />
            <div className="flex-1 h-10 bg-muted/20 animate-pulse" />
          </div>
          <Card>
            <CardHeader>
              <div className="h-3 w-36 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-2.5 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-full bg-muted/70 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
