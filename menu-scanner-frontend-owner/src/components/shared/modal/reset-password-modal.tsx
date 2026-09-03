"use client";

import { useEffect, useState } from "react";
import { CustomModal } from "./custom-modal";
import { FormHeader } from "../form-field/form-header";
import { FormBody } from "../form-field/form-body";
import { FormFooter } from "../form-field/form-footer";
import { CancelButton } from "../button/cancel-button";
import { SubmitButton } from "../button/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomButton } from "../button/custom-button";
import { Loading } from "../common/loading";
import { showToast } from "../common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { AppDefault } from "@/constants/app-resource/default/default";
import { Messages } from "@/constants/messages";
import { useAppDispatch, useAppSelector } from "@/store";
import { adminChangePasswordService, fetchUserByIdService } from "@/features/auth/store/thunks/users-thunks";
import {
  selectIsResettingPassword,
  selectSelectedUser,
  selectUsersContent,
  selectIsFetchingDetail,
} from "@/features/auth/store/selectors/users-selectors";
import { AlertTriangle, Copy, Eye, EyeOff, Key } from "lucide-react";
import { toast } from "sonner";

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

  const resolvedUser = usersContent.find((u) => u.id === userId) || (selectedUser?.id === userId ? selectedUser : null);
  const resolvedUserName = userName || resolvedUser?.userIdentifier || resolvedUser?.email || "";
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
      showToast.error(getErrorMessage(error, "Reset failed. Please try again."));
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
                <div className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label className="text-xs font-semibold">New Password</Label>
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-14 font-mono text-xs h-9 py-2 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/20"
                    disabled={isResettingPassword}
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    <CustomButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-7 w-7 p-0 hover:bg-muted"
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
                      className="h-7 w-7 p-0 hover:bg-muted"
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

              <div className="border border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/40 p-3 rounded-xl flex gap-2.5 text-left">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 leading-tight">
                    Important Notice
                  </p>
                  <p className="text-xs text-amber-800/90 dark:text-amber-400/90 mt-1 leading-normal">
                    This action will log out the user from all active sessions. They must sign in with this new password.
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
          >
            <CancelButton onClick={handleClose} disabled={isResettingPassword} />
            <SubmitButton
              onClick={onReset}
              isSubmitting={isResettingPassword}
              isDirty={true}
              isCreate={false}
              updateText="Reset Password"
              submittingUpdateText="Resetting..."
              variant="destructive"
            />
          </FormFooter>
        </>
      )}
    </CustomModal>
  );
}
