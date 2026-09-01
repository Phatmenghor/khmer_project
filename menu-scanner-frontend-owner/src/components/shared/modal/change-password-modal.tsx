"use client";

import { CustomModal } from "./custom-modal";
import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Lock, AlertTriangle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { changePasswordService } from "@/features/auth/store/thunks/auth-thunks";
import {
  selectIsProfileLoading,
  selectError,
} from "@/features/auth/store/selectors/auth-selectors";
import { clearError } from "@/features/auth/store/slice/auth-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { changePasswordSchema } from "@/features/auth/store/models/schema/user.schema";

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({ isOpen, onClose }: Props) {
  const dispatch = useAppDispatch();

  const isProfileLoading = useAppSelector(selectIsProfileLoading);
  const reduxError = useAppSelector(selectError);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
      reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, dispatch, reset]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const payload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      await dispatch(changePasswordService(payload)).unwrap();

      showToast.success(Messages.auth.passwordChanged);
      handleClose();
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || "Failed to change password");
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="sm">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 p-4 px-5 border-b border-border/80 bg-background shrink-0">
        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base text-foreground leading-tight">Change Password</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Update your account security password</p>
        </div>
      </div>

      {/* ── Form Body ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="p-4 px-5 space-y-3 bg-card/30">
          {reduxError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive font-medium">{reduxError}</p>
            </div>
          )}

          <div className="space-y-3">
            <PasswordField
              control={control}
              name="currentPassword"
              label="Current Password"
              placeholder="Enter current password"
              disabled={isProfileLoading}
              required
              error={errors.currentPassword}
              showPassword={showCurrentPassword}
              onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
            />

            <PasswordField
              control={control}
              name="newPassword"
              label="New Password"
              placeholder="Enter new password"
              disabled={isProfileLoading}
              required
              error={errors.newPassword}
              showPassword={showNewPassword}
              onTogglePassword={() => setShowNewPassword(!showNewPassword)}
            />

            <PasswordField
              control={control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm new password"
              disabled={isProfileLoading}
              required
              error={errors.confirmPassword}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="p-4 px-5 border-t border-border/80 bg-background flex items-center justify-end gap-2 shrink-0">
          <CustomButton
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isProfileLoading}
            className="font-bold min-w-[80px]"
          >
            Cancel
          </CustomButton>

          <CustomButton
            type="submit"
            variant="primary"
            size="sm"
            disabled={isProfileLoading || !isDirty}
            isLoading={isProfileLoading}
            className="font-bold min-w-[130px]"
          >
            {isProfileLoading ? "Changing..." : "Change Password"}
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
}
