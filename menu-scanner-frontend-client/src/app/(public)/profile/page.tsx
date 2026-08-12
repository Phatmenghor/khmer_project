"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit, Loader2, Trash2, Lock, User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomButton } from "@/components/shared/button/custom-button";
import { SmartImage } from "@/components/shared/image/smart-image";
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
import { useRouter } from "next/navigation";
import { clearToken } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { SpacesMultiSizeResult } from "@/services/spaces-service";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";
import { TelegramSyncCard } from "@/components/shared/telegram/telegram-sync-card";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
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
        ? { sm: profileImageKeys.sm.url, md: profileImageKeys.md.url, o: profileImageKeys.o.url }
        : (data.profileImageUrl ? { sm: data.profileImageUrl, md: data.profileImageUrl, o: data.profileImageUrl } : undefined);

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
      const payload = { profileImage: { sm: result.sm.url, md: result.md.url, o: result.o.url } };
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
    <div className="min-h-screen bg-background relative">
      {/* Ambient background glow — matching Admin Dashboard aesthetic */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-primary/5 blur-[120px] rounded-full opacity-60" />

      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5 relative z-10">
        <div className="space-y-4 w-full">
          {/* Facebook-Style Profile Hero Header */}
          <div className="relative rounded-[24px] overflow-hidden border border-border/80 bg-gradient-to-r from-primary/20 via-card to-card shadow-xs">
            {/* Cover Photo Banner with Grid Overlay & Gradient Glow */}
            <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-primary/35 via-primary/20 to-primary/10 relative overflow-hidden flex items-center justify-between px-6">
              {/* Subtle Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent pointer-events-none" />

              {/* Decorative Glassmorphic Badge */}
              <div className="relative z-10 hidden sm:flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-primary uppercase tracking-widest bg-card/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-primary/25 shadow-2xs">
                  Customer Profile
                </span>
              </div>
            </div>

            {/* Overlapping Profile Content */}
            <div className="px-4 sm:px-6 pb-5 pt-0 bg-card relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-2">
                {/* Overlapping Avatar & Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                  <div
                    className="relative group cursor-pointer shrink-0"
                    onClick={() => setIsProfilePictureModalOpen(true)}
                    title="Change profile picture"
                  >
                    <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-card shadow-xl overflow-hidden bg-muted ring-2 ring-primary/25 transition-transform duration-300 group-hover:scale-105">
                      {(watch("profileImageUrl") || userProfile?.profileImage?.md) ? (
                        <SmartImage
                          src={watch("profileImageUrl") || userProfile?.profileImage?.md}
                          alt={userProfile?.fullName || "User"}
                          fill
                          showSkeleton={false}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-primary font-extrabold text-2xl sm:text-3xl bg-gradient-to-br from-primary/25 via-primary/10 to-card">
                          {userProfile?.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-xs">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Headline & Badges */}
                  <div className="pb-1">
                    <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-foreground tracking-tight flex items-center justify-center sm:justify-start gap-2">
                      {userProfile?.fullName || "Customer User"}
                    </h2>
                    <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                      {userProfile?.email}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        {userProfile?.accountStatus || "ACTIVE"}
                      </span>
                      {userProfile?.userType && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground text-[11px] font-semibold">
                          {formatEnumLabel(userProfile.userType)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit / Save Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pb-1">
                  {isEditing ? (
                    <>
                      <CustomButton
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isProfileLoading || isUploadingImage}
                        className="rounded-xl border-border/60 hover:bg-muted/50 font-bold text-xs px-4 py-2 cursor-pointer"
                      >
                        Cancel
                      </CustomButton>
                      <CustomButton
                        size="sm"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isProfileLoading || isUploadingImage || !isDirty}
                        className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs px-5 py-2 shadow-2xs cursor-pointer"
                      >
                        {isProfileLoading || isUploadingImage ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            {isUploadingImage ? "Uploading..." : "Saving..."}
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </CustomButton>
                    </>
                  ) : (
                    <CustomButton
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs px-5 py-2 shadow-2xs cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Edit Profile
                    </CustomButton>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Facebook-Style Segmented Tab Control */}
          <div className="p-1 rounded-2xl border border-border/80 bg-muted/40 grid grid-cols-2 gap-1 w-full shadow-2xs">
            <CustomButton
              variant="unstyled"
              size="unstyled"
              onClick={() => setActiveSection("profile")}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                activeSection === "profile"
                  ? "bg-card border border-border/60 text-primary shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              )}
            >
              <User className="h-3.5 w-3.5" />
              <span>Personal Profile</span>
            </CustomButton>

            <CustomButton
              variant="unstyled"
              size="unstyled"
              onClick={() => setActiveSection("security")}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                activeSection === "security"
                  ? "bg-card border border-border/60 text-primary shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              )}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Security & Accounts</span>
            </CustomButton>
          </div>

          {/* Profile Section */}
          {activeSection === "profile" && (
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <Card className="rounded-[22px] border border-border/80 bg-gradient-to-b from-card via-card to-muted/10 shadow-2xs">
                <CardHeader className="border-b border-border/40 pb-3">
                  <CardTitle className="text-xs font-extrabold text-foreground flex items-center justify-between">
                    <span>Personal Details</span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {isEditing ? "Editing Mode" : "View Mode"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                              (o) => o.value === watch("gender")
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
                          label="Last Login"
                          value={userProfile?.lastLoginAt}
                        />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div className="space-y-3.5">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground mb-2 px-1">
                  Connected Social Accounts
                </h3>
                <TelegramSyncCard />
              </div>

              <Card className="rounded-[22px] border border-border/80 bg-gradient-to-b from-card to-muted/10 shadow-2xs">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-extrabold text-foreground">
                        Change Account Password
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                        Update your password periodically to keep your account secure
                      </p>
                    </div>
                    <CustomButton
                      onClick={() => setIsChangePasswordModalOpen(true)}
                      className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 cursor-pointer shrink-0"
                    >
                      <Lock className="h-3.5 w-3.5 mr-1.5" />
                      Change Password
                    </CustomButton>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border border-destructive/30 bg-destructive/5 shadow-2xs">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-extrabold text-destructive">
                        Delete Account
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                        Permanently erase your account and all associated customer data
                      </p>
                    </div>
                    <CustomButton
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold text-xs px-4 py-2 shadow-2xs cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete Account
                    </CustomButton>
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
      </PageContainer>
    </div>
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
