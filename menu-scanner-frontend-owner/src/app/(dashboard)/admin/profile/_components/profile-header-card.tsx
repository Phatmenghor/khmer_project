import { Camera, Edit, Save, Building2 } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { SmartImage } from "@/components/shared/image/smart-image";
import { Card, CardContent } from "@/components/ui/card";
import { getUserDisplayEmail } from "@/utils/user/user-helper";
import { UserRoleBadge } from "@/components/shared/user/user-role-badge";

interface ProfileHeaderCardProps {
  userProfile: any;
  profileImageUrl?: string;
  isEditing: boolean;
  isProfileLoading: boolean;
  isUploadingImage: boolean;
  isProcessing: boolean;
  isDirty: boolean;
  onEditClick: () => void;
  onCancelClick: () => void;
  onSaveClick: () => void;
  onAvatarClick: () => void;
}

export function ProfileHeaderCard({
  userProfile,
  profileImageUrl,
  isEditing,
  isProfileLoading,
  isUploadingImage,
  isProcessing,
  isDirty,
  onEditClick,
  onCancelClick,
  onSaveClick,
  onAvatarClick,
}: ProfileHeaderCardProps) {
  const displayEmail = getUserDisplayEmail(userProfile);

  return (
    <Card className="mb-4 border-border/80 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={onAvatarClick}
              title="Change profile picture"
            >
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-primary/20 bg-primary/10 shadow-xs">
                {(profileImageUrl || userProfile?.profileImage?.md) ? (
                  <SmartImage
                    src={profileImageUrl || userProfile?.profileImage?.md}
                    alt={userProfile?.fullName || userProfile?.userIdentifier || "User Profile"}
                    fill
                    showSkeleton={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-primary font-bold text-lg">
                    {(userProfile?.fullName || userProfile?.userIdentifier || "U")?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-extrabold text-foreground leading-tight">
                  {userProfile?.fullName || userProfile?.userIdentifier || "Business Owner Profile"}
                </h2>
                <UserRoleBadge profile={userProfile} />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {displayEmail}
              </p>
              {userProfile?.businessName && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{userProfile.businessName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {isEditing ? (
              <>
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={onCancelClick}
                  disabled={isProfileLoading || isUploadingImage || isProcessing}
                  className="font-bold text-xs h-8"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="primary"
                  size="sm"
                  onClick={onSaveClick}
                  disabled={
                    isProfileLoading ||
                    isUploadingImage ||
                    isProcessing ||
                    !isDirty
                  }
                  isLoading={isProfileLoading || isUploadingImage || isProcessing}
                  className="gap-1.5 font-bold text-xs h-8 min-w-[90px]"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isUploadingImage || isProcessing ? "Saving..." : "Save"}
                </CustomButton>
              </>
            ) : (
              <CustomButton
                variant="primary"
                size="sm"
                onClick={onEditClick}
                className="gap-1.5 font-bold text-xs h-8"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </CustomButton>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
