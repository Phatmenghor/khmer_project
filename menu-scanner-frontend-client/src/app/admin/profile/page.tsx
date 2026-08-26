"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import {
  getProfileService,
  updateProfileService,
  deleteAccountService,
} from "@/features/auth/store/thunks/auth-thunks";
import { fetchMyLeaveBalanceService } from "@/features/hr/store/thunks/hr-thunks";
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
import { ROUTES } from "@/constants/app-routes/routes";
import { clearToken } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { SpacesMultiSizeResult } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";
import { useDeferredUploads } from "@/hooks/use-deferred-upload";
import { Loading } from "@/components/shared/common/loading";
import { EducationLevel } from "@/constants/status/user-enums";
import { AddressType } from "@/constants/status/user-enums";
import { DocumentType } from "@/constants/status/user-enums";
import {
  updateUserSchema,
  UserFormData,
} from "@/features/auth/store/models/schema/user.schema";

// ── Components ──
import { ProfileHeaderCard } from "./_components/profile-header-card";
import { ProfileTabSwitcher } from "./_components/profile-tab-switcher";
import { PersonalInfoCard } from "./_components/personal-info-card";
import { EmploymentInfoCard } from "./_components/employment-info-card";
import { AddressCard } from "./_components/address-card";
import { EmergencyContactCard } from "./_components/emergency-contact-card";
import { DocumentsCard } from "./_components/documents-card";
import { EducationCard } from "./_components/education-card";
import { AdditionalInfoCard } from "./_components/additional-info-card";
import { SecuritySection } from "./_components/security-section";

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
  const [profileImageKeys, setProfileImageKeys] = useState<SpacesMultiSizeResult | undefined>();
  const documentUploads = useDeferredUploads<number>();
  const educationUploads = useDeferredUploads<number>();
  const [isProcessing, setIsProcessing] = useState(false);

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
      joinDate: "",
      leaveDate: "",
      remark: "",
      addresses: [],
      emergencyContacts: [],
      documents: [],
      educations: [],
    },
    mode: "onChange",
  });

  const typedControl = control as any;

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control: typedControl,
    name: "addresses",
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control: typedControl,
    name: "emergencyContacts",
  });

  const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({
    control: typedControl,
    name: "documents",
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: typedControl,
    name: "educations",
  });

  // ── Helpers ──
  const buildResetValues = (profile: any) => ({
    id: profile.id || "",
    profileImageUrl: profile.profileImage?.md || "",
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    nickname: profile.nickname || "",
    phoneNumber: profile.phoneNumber || "",
    email: profile.email || "",
    gender: profile.gender || "",
    dateOfBirth: profile.dateOfBirth || "",
    employeeId: profile.employeeId || "",
    position: profile.position || "",
    department: profile.department || "",
    joinDate: profile.joinDate || "",
    leaveDate: profile.leaveDate || "",
    leaveBalance: profile.leaveBalance || profile.leaveQuota || profile.leaveSummary,
    remark: profile.remark || "",
    addresses: Array.isArray(profile.addresses) ? profile.addresses : [],
    emergencyContacts: Array.isArray(profile.emergencyContacts) ? profile.emergencyContacts : [],
    documents: Array.isArray(profile.documents) ? profile.documents : [],
    educations: Array.isArray(profile.educations)
      ? profile.educations.map((edu: any) => ({
          ...edu,
          isGraduated: typeof edu.isGraduated === "boolean" ? String(edu.isGraduated) : edu.isGraduated,
        }))
      : [],
  });

  useEffect(() => {
    dispatch(fetchMyLeaveBalanceService());
  }, [dispatch]);

  useEffect(() => {
    if (userProfile) {
      reset(buildResetValues(userProfile));
    }
  }, [userProfile, reset]);

  useEffect(() => {
    if (reduxError) {
      showToast.error(reduxError);
      dispatch(clearError());
    }
  }, [reduxError, dispatch]);

  // ── Handlers ──
  const onSubmit = async (data: UserFormData) => {
    setIsProcessing(true);
    try {
      const profileImageUrls: ImageUrls | undefined = profileImageKeys
        ? { sm: profileImageKeys.sm.url, md: profileImageKeys.md.url, o: profileImageKeys.o.url }
        : data.profileImageUrl
        ? { sm: data.profileImageUrl, md: data.profileImageUrl, o: data.profileImageUrl }
        : undefined;

      const businessId = userProfile?.businessId || AppDefault.BUSINESS_ID;
      let docUrls: Record<string, string> = {};
      let eduUrls: Record<string, string> = {};
      try {
        const [docs, edus] = await Promise.all([
          documentUploads.uploadAllSingle(businessId),
          educationUploads.uploadAllSingle(businessId),
        ]);
        docUrls = Object.fromEntries(Object.entries(docs).map(([k, r]) => [k, (r as any).url]));
        eduUrls = Object.fromEntries(Object.entries(edus).map(([k, r]) => [k, (r as any).url]));
      } catch (uploadErr: any) {
        showToast.error(uploadErr?.message || "File upload failed — please try again");
        return;
      }

      const validDocuments = (data.documents || [])
        .map((doc, idx) => ({ ...doc, fileUrl: docUrls[String(idx)] ?? doc.fileUrl }))
        .filter((doc) => doc.type && doc.number);

      const validEducations = (data.educations || [])
        .map((edu, idx) => ({ ...edu, certificateUrl: eduUrls[String(idx)] ?? edu.certificateUrl }))
        .filter((edu) => edu.level && edu.schoolName && edu.fieldOfStudy);

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
      if (data.joinDate) payload.joinDate = data.joinDate;
      if (data.leaveDate) payload.leaveDate = data.leaveDate;
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
          isGraduated:
            typeof edu.isGraduated === "string"
              ? edu.isGraduated === "true"
              : edu.isGraduated || false,
          certificateUrl: edu.certificateUrl,
        }));
      }

      await dispatch(updateProfileService(payload)).unwrap();
      await dispatch(getProfileService()).unwrap();

      showToast.success(Messages.profile.updated);
      setIsEditing(false);
      documentUploads.reset();
      educationUploads.reset();
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.profile.updateFailed);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) reset(buildResetValues(userProfile));
    setIsEditing(false);
  };

  const handleProfileUploaded = async (result: SpacesMultiSizeResult) => {
    try {
      setIsUploadingImage(true);
      setProfileImageKeys(result);
      setValue("profileImageUrl", result.md.url, { shouldDirty: false });
      const payload = { profileImage: { sm: result.sm.url, md: result.md.url, o: result.o.url } };
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
      setValue("profileImageUrl", "", { shouldDirty: false });
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
    documentUploads.reindexAfterRemove(index);
  };

  const handleRemoveEducation = (index: number) => {
    removeEducation(index);
    educationUploads.reindexAfterRemove(index);
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
        {/* ── Hero Header ── */}
        <ProfileHeaderCard
          userProfile={userProfile}
          profileImageUrl={watch("profileImageUrl")}
          isEditing={isEditing}
          isProfileLoading={isProfileLoading}
          isUploadingImage={isUploadingImage}
          isProcessing={isProcessing}
          isDirty={isDirty}
          onEditClick={() => setIsEditing(true)}
          onCancelClick={handleCancel}
          onSaveClick={handleSubmit(onSubmit)}
          onAvatarClick={() => setIsProfilePictureModalOpen(true)}
        />

        {/* ── Tab Switcher ── */}
        <ProfileTabSwitcher
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* ── Profile Section ── */}
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

              <EmploymentInfoCard
                control={typedControl}
                errors={errors}
                isEditing={isEditing}
                watch={watch}
                userProfile={userProfile}
              />

              <AddressCard
                control={typedControl}
                errors={errors}
                isEditing={isEditing}
                fields={addressFields}
                onAppend={() =>
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
                onRemove={removeAddress}
              />

              <EmergencyContactCard
                control={typedControl}
                errors={errors}
                isEditing={isEditing}
                fields={contactFields}
                onAppend={() =>
                  appendContact({
                    id: undefined,
                    name: "",
                    phone: "",
                    relationship: "",
                  })
                }
                onRemove={removeContact}
              />

              <DocumentsCard
                control={typedControl}
                errors={errors}
                isEditing={isEditing}
                fields={documentFields}
                documentUploads={documentUploads}
                businessId={userProfile?.businessId}
                watch={watch}
                setValue={setValue}
                onAppend={() =>
                  appendDocument({
                    id: undefined,
                    type: DocumentType.ID_CARD,
                    number: "",
                    fileUrl: "",
                  })
                }
                onRemove={handleRemoveDocument}
              />

              <EducationCard
                control={typedControl}
                errors={errors}
                isEditing={isEditing}
                fields={educationFields}
                educationUploads={educationUploads}
                businessId={userProfile?.businessId}
                watch={watch}
                setValue={setValue}
                onAppend={() =>
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
                onRemove={handleRemoveEducation}
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

        {/* ── Security Section ── */}
        {activeSection === "security" && (
          <SecuritySection
            onChangePassword={() => setIsChangePasswordModalOpen(true)}
            onDeleteAccount={() => setIsDeleteDialogOpen(true)}
          />
        )}

        {/* ── Modals ── */}
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
    </div>
  );
}
