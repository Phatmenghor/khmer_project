"use client";

import { CustomButton, CancelButton } from "@/components/shared/button/custom-button";
import { SmartImage } from "@/components/shared/image/smart-image";
import { CustomModal } from "./custom-modal";
import { Messages } from "@/constants/messages";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { AppDefault } from "@/constants/app-resource/default/default";
import { useAppDispatch, useAppSelector } from "@/store";
import { adminChangePasswordService, fetchUserByIdService } from "@/features/auth/store/thunks/users-thunks";
import { selectIsResettingPassword, selectSelectedUser, selectUsersContent, selectIsFetchingDetail } from "@/features/auth/store/selectors/users-selectors";
import { showToast } from "../common/show-toast";
import { FormHeader } from "../form-field/form-header";
import { FormBody } from "../form-field/form-body";
import { FormFooter } from "../form-field/form-footer";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { Loading } from "../common/loading";

interface ResetPasswordModalProps {
  userId?: string;
  userName?: string;
  userRole?: string[];
  profileImageUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResetPasswordModal({
  userId,
  isOpen,
  userName,
  userRole,
  profileImageUrl,
  onClose,
}: ResetPasswordModalProps) {
  const dispatch = useAppDispatch();

  const isResettingPassword = useAppSelector(selectIsResettingPassword);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const selectedUser = useAppSelector(selectSelectedUser);
  const usersContent = useAppSelector(selectUsersContent);

  // Resolve user metadata for deep-link support (when no userName/userRole/profileImageUrl is passed)
  const resolvedUser = usersContent.find(u => u.id === userId) || (selectedUser?.id === userId ? selectedUser : null);
  const resolvedUserName = userName || resolvedUser?.userIdentifier || resolvedUser?.email || "";
  const resolvedUserRole = userRole && userRole.length > 0 ? userRole : (resolvedUser?.roles || []);
  const resolvedProfileImageUrl = profileImageUrl || resolvedUser?.profileImage?.sm || "";

  const hasUser = !!resolvedUser;

  useEffect(() => {
    if (isOpen && userId && !userName && !hasUser) {
      dispatch(fetchUserByIdService(userId));
    }
  }, [isOpen, userId, userName, hasUser, dispatch]);

  const [showPassword, setShowPassword] = useState(false);
  const [customPassword, setCustomPassword] = useState(AppDefault.RESET_PASSWORD);
  const defaultPassword = AppDefault.RESET_PASSWORD;

  const onReset = async () => {
    if (!userId) {
      toast.error("User ID missing");
      return;
    }

    if (!customPassword || customPassword.trim() === "") {
      toast.error("Please enter a password");
      return;
    }

    try {
      await dispatch(
        adminChangePasswordService({
          userId: userId,
          newPassword: customPassword,
          confirmPassword: customPassword,
        })
      ).unwrap();

      showToast.success(Messages.auth.passwordReset);

      handleClose();
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message || "Reset failed. Please try again.");
    }
  };

  const handleClose = () => {
    setShowPassword(false);
    setCustomPassword(defaultPassword);
    onClose();
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(customPassword);
      toast.success("Password copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy password");
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="sm" disableScrollWrapper={true}>
      <FormHeader
        title="Reset Password"
        description="Reset the user's password to the default value"
        avatarName={resolvedUserName}
        avatarImageUrl={resolvedProfileImageUrl}
        showAvatar={true}
        isCreate={false}
        className="w-full m-0 mx-0 mt-0 md:mx-0 md:mt-0 p-3 sm:p-4 border-b border-border/60 shrink-0"
      />
      {isFetchingDetail && !resolvedUserName ? (
        <div className="p-4 flex items-center justify-center py-8 flex-1">
          <Loading />
        </div>
      ) : (
        <>
          <FormBody className="flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-4">

              <div className="space-y-2 text-left">
                <div className="flex items-center gap-1">
                  <Key className="h-3 w-3 text-muted-foreground" />
                  <Label className="text-xs font-semibold">New Password</Label>
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-14 font-mono text-xs h-8 py-2 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/20"
                    disabled={isResettingPassword}
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                    <CustomButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-6 w-6 p-0 hover:bg-muted"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </CustomButton>
                    <CustomButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={copyPassword}
                      className="h-6 w-6 p-0 hover:bg-muted"
                      title="Copy password"
                    >
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </CustomButton>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  User must change this password on first login
                </p>
              </div>

              <div className="border border-orange-200/60 bg-orange-50/40 p-2.5 rounded-lg flex gap-2 text-left">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-orange-900 leading-none">
                    Important Notice
                  </p>
                  <p className="text-xs text-orange-800 mt-1 leading-normal">
                    This action will log out the user from all devices. They must use the new password to sign in.
                  </p>
                </div>
              </div>
            </div>
          </FormBody>

          <FormFooter
            isSubmitting={isResettingPassword}
            isDirty={false}
            isCreate={false}
            noChangesMessage="Resetting user password"
            className="w-full m-0 mx-0 mb-0 md:mx-0 md:mb-0 p-3 sm:p-4 border-t border-border/60 bg-muted/30 shrink-0"
          >
            <CancelButton onClick={handleClose} disabled={isResettingPassword} />
            <CustomButton
              type="button"
              onClick={onReset}
              disabled={isResettingPassword}
              variant="destructive"
              className="h-8"
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </CustomButton>
          </FormFooter>
        </>
      )}
    </CustomModal>
  );
}
