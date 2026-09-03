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
import { useAppDispatch, useAppSelector } from "@/store";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import {
  getBusinessProfileService,
  updateBusinessProfileService,
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
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { clearAllTokens } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { SpacesMultiSizeResult } from "@/services/spaces-service";
import { GENDER_OPTIONS } from "@/constants/app-resource/status/create-update-status";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";
import Loading from "@/components/shared/common/loading";
import { getErrorMessage } from "@/utils/error/get-error-message";
import {
  profileUpdateSchema,
  ProfileFormData,
} from "@/features/auth/store/models/schema/user.schema";
import { ProfileHeaderCard } from "./_components/profile-header-card";
import { ProfileTabSwitcher } from "./_components/profile-tab-switcher";
import { PersonalInfoCard } from "./_components/personal-info-card";
import { AdditionalInfoCard } from "./_components/additional-info-card";
import { SecuritySection } from "./_components/security-section";

export default function AdminProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { accessToken, authReady } = useAuthState();

  const userProfile = useAppSelector(selectProfile);
  const isProfileLoading = useAppSelector(selectIsProfileLoading);
  const reduxError = useAppSelector(selectError);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(tabParam === "security" ? "security" : "profile");
  const [isSavingImage, setIsSavingImage] = useState(false);

  useEffect(() => {
    if (tabParam === "security") {
      setActiveSection("security");
    } else if (tabParam === "profile") {
      setActiveSection("profile");
    }
  }, [tabParam]);

  const {
    control,
    handleSubmit,
    reset,
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
        profileImageUrl: userProfile.profileImage?.sm || userProfile.profileImageUrl || "",
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
      const payload: any = {};
      if (data.firstName) payload.firstName = data.firstName;
      if (data.lastName) payload.lastName = data.lastName;
      if (data.phoneNumber) payload.phoneNumber = data.phoneNumber;
      if (data.email) payload.email = data.email;
      if (data.nickname) payload.nickname = data.nickname;
      if (data.gender) payload.gender = data.gender;
      if (data.dateOfBirth) payload.dateOfBirth = data.dateOfBirth;
      if (data.remark) payload.remark = data.remark;

      await dispatch(updateBusinessProfileService(payload)).unwrap();
      await dispatch(getBusinessProfileService()).unwrap();
      showToast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to update profile"));
    }
  };

  // Called by ProfilePictureModal after Spaces upload completes
  const handleProfilePictureUploaded = async (result: SpacesMultiSizeResult) => {
    try {
      setIsSavingImage(true);
      const profileImage = { sm: result.sm.url, md: result.md.url, o: result.o.url };
      await dispatch(updateBusinessProfileService({ profileImage })).unwrap();
      await dispatch(getBusinessProfileService()).unwrap();
      showToast.success("Profile picture updated successfully");
      setIsProfilePictureModalOpen(false);
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to update profile picture"));
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleProfilePictureRemove = async () => {
    try {
      setIsSavingImage(true);
      await dispatch(updateBusinessProfileService({ profileImage: null })).unwrap();
      await dispatch(getBusinessProfileService()).unwrap();
      showToast.success("Profile picture removed successfully");
      setIsProfilePictureModalOpen(false);
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to remove profile picture"));
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      reset({
        id: userProfile.id || "",
        profileImageUrl: userProfile.profileImage?.sm || userProfile.profileImageUrl || "",
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
      showToast.error(getErrorMessage(error, "Failed to delete account"));
    }
  };

  const currentAvatarUrl = userProfile?.profileImage?.sm || userProfile?.profileImageUrl;

  if (isProfileLoading && !userProfile) {
    return <Loading />;
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        {/* Profile Header */}
        <ProfileHeaderCard
          userProfile={userProfile}
          profileImageUrl={watch("profileImageUrl")}
          isEditing={isEditing}
          isProfileLoading={isProfileLoading}
          isUploadingImage={false}
          isProcessing={false}
          isDirty={isDirty}
          onEditClick={() => setIsEditing(true)}
          onCancelClick={handleCancel}
          onSaveClick={handleSubmit(onSubmit)}
          onAvatarClick={() => setIsProfilePictureModalOpen(true)}
        />

        {/* Tab Switcher */}
        <ProfileTabSwitcher
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Profile Tab */}
        {activeSection === "profile" && (
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
            <div className="w-full space-y-4">
              <PersonalInfoCard
                control={typedControl}
                errors={errors}
                isEditing={isEditing}
                watch={watch}
                userProfile={userProfile}
              />

              <AdditionalInfoCard
                control={typedControl}
                errors={errors}
                isEditing={isEditing}
                watch={watch}
              />
            </div>
          </form>
        )}

        {/* Security Tab */}
        {activeSection === "security" && (
          <SecuritySection
            onChangePassword={() => setIsChangePasswordModalOpen(true)}
            onDeleteAccount={() => setIsDeleteDialogOpen(true)}
          />
        )}
      </div>

      <ProfilePictureModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        currentImageUrl={currentAvatarUrl}
        userName={userProfile?.fullName}
        onUploaded={handleProfilePictureUploaded}
        onRemove={handleProfilePictureRemove}
        isLoading={isSavingImage}
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
