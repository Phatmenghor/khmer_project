"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit, Loader2, Trash2, Lock, User, Camera, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { DisplayField } from "@/components/shared/form-field/display-field";
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
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { isBase64Image, uploadImage } from "@/utils/common/upload-image";
import { clearToken } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { Loading } from "@/components/shared/common/loading";
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

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function PublicProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const userProfile = useAppSelector(selectProfile);
  const isProfileLoading = useAppSelector(selectIsProfileLoading);
  const reduxError = useAppSelector(selectError);
  const socialSync = useAppSelector((state) => state.auth.socialSync);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
    if (!userProfile && !isProfileLoading) {
      dispatch(getCustomerProfileService());
    }
  }, [dispatch, userProfile, isProfileLoading]);


  useEffect(() => {
    if (userProfile) {
      reset({
        profileImageUrl: userProfile.profileImageUrl || "",
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
      setIsUploadingImage(true);

      let profileImageUrl =
        data.profileImageUrl || userProfile?.profileImageUrl || "";

      if (profileImageUrl && isBase64Image(profileImageUrl)) {
        try {
          profileImageUrl = await uploadImage(profileImageUrl);
        } catch (error) {
          showToast.error(Messages.profile.pictureUploadFailed);
          setIsUploadingImage(false);
          return;
        }
      }

      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
      };

      if (data.nickname) payload.nickname = data.nickname;
      if (data.gender) payload.gender = data.gender;
      if (data.dateOfBirth) payload.dateOfBirth = data.dateOfBirth;
      if (profileImageUrl) payload.profileImageUrl = profileImageUrl;

      await dispatch(updateCustomerProfileService(payload)).unwrap();


      await dispatch(getCustomerProfileService()).unwrap();

      showToast.success(Messages.profile.updated);
      setIsEditing(false);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.profile.updateFailed);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      reset({
        profileImageUrl: userProfile.profileImageUrl || "",
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

  const handleAutoUploadProfilePicture = async (imageData: string) => {
    try {
      setIsUploadingImage(true);

      let profileImageUrl = imageData;
      if (isBase64Image(profileImageUrl)) {
        try {
          profileImageUrl = await uploadImage(profileImageUrl);
        } catch (error) {
          showToast.error(Messages.upload.imageFailed);
          setIsUploadingImage(false);
          return;
        }
      }

      setValue("profileImageUrl", profileImageUrl, {
        shouldDirty: true,
      });

      const payload = {
        profileImageUrl,
      };

      await dispatch(updateCustomerProfileService(payload)).unwrap();
      await dispatch(getCustomerProfileService()).unwrap();

      showToast.success(Messages.profile.pictureUpdated);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.profile.pictureUpdateFailed);
    } finally {
      setIsUploadingImage(false);
      setIsProfilePictureModalOpen(false);
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



  if (isProfileLoading && !userProfile) {
    return <Loading />;
  }

  return (
    <PageContainer className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col gap-4 py-4">
        {}
        <div className="w-full mb-2">
          <h1 className="text-3xl font-bold text-foreground">
            Customer Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="space-y-4 w-full">
          <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {}
                <div
                  className="relative group cursor-pointer"
                  onClick={() => setIsProfilePictureModalOpen(true)}
                >
                  <div className="relative ring-2 ring-primary/20 rounded-2xl">
                    <CustomAvatar
                      imageUrl={userProfile?.profileImageUrl}
                      name={userProfile?.fullName}
                      size="xxl"
                    />
                    {}
                    <div className="absolute bottom-1 right-1 bg-primary rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:shadow-primary/50 hover:bg-primary/80">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {userProfile?.fullName}
                      </h2>
                      <p className="text-primary/70 text-sm font-medium">
                        {userProfile?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
                          {userProfile?.accountStatus}
                        </span>
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
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
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

          {}
          <div className="flex gap-0 mb-8 w-full relative group border border-primary/30 rounded-xl overflow-hidden">
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
                "flex-1 flex items-center justify-center gap-2.5 py-4 px-6 relative z-10",
                "text-sm font-semibold transition-all duration-300",
                "border-r border-primary/20",
                activeSection === "profile"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70",
              )}
            >
              <User
                className={cn(
                  "h-4 w-4 transition-all duration-300",
                  activeSection === "profile" ? "scale-110" : "scale-100",
                )}
              />
              <span>Profile</span>
            </button>

            {}
            <button
              onClick={() => setActiveSection("security")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2.5 py-4 px-6 relative z-10",
                "text-sm font-semibold transition-all duration-300",
                activeSection === "security"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70",
              )}
            >
              <Lock
                className={cn(
                  "h-4 w-4 transition-all duration-300",
                  activeSection === "security" ? "scale-110" : "scale-100",
                )}
              />
              <span>Security</span>
            </button>
          </div>

          {}
          {activeSection === "profile" && (
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="w-full space-y-6">
                {}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-4">
              {}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Connected Accounts
                </h3>
                <TelegramSyncCard />
              </div>

              {}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Change Password
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsChangePasswordModalOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {}
              <Card className="border-destructive/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
                      size="sm"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {}

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

          {}
          <ProfilePictureModal
            isOpen={isProfilePictureModalOpen}
            onClose={() => setIsProfilePictureModalOpen(false)}
            onImageSelect={handleAutoUploadProfilePicture}
            onImageRemove={() => setValue("profileImageUrl", "")}
            isLoading={isUploadingImage}
            currentImageUrl={watch("profileImageUrl") || userProfile?.profileImageUrl}
            userName={userProfile?.fullName}
          />
        </div>
      </div>
    </PageContainer>
  );
}
