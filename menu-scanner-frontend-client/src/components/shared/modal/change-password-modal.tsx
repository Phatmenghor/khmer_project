"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/shared/form-field/text-field";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { useAppDispatch, useAppSelector } from "@/store";
import { changePasswordService } from "@/features/auth/store/thunks/auth-thunks";
import {
  selectIsProfileLoading,
  selectError,
} from "@/features/auth/store/selectors/auth-selectors";
import { clearError } from "@/features/auth/store/slice/auth-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { getFieldError } from "@/utils/common/get-field-error";
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
    } catch (error: any) {
      showToast.error(error || "Failed to change password");
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 flex flex-col">
        {}
        <FormHeader
          title="Change Password"
          description="Update your password to keep your account secure"
          showAvatar={false}
          isCreate={true}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {}
          <FormBody>
            {}
            {reduxError && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            {}
            <div className="space-y-4">
              {}
              <div className="relative">
                <TextField
                  control={control}
                  name="currentPassword"
                  label="Current Password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  disabled={isProfileLoading}
                  required
                  error={errors.currentPassword}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-[28px] h-10 px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isProfileLoading}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {}
              <div className="relative">
                <TextField
                  control={control}
                  name="newPassword"
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  disabled={isProfileLoading}
                  required
                  error={errors.newPassword}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-[28px] h-10 px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isProfileLoading}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {}
              <div className="relative">
                <TextField
                  control={control}
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  disabled={isProfileLoading}
                  required
                  error={errors.confirmPassword}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-[28px] h-10 px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isProfileLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </FormBody>

          {}
          <FormFooter
            isSubmitting={isProfileLoading}
            isDirty={isDirty}
            isCreate={true}
            createMessage="Changing password..."
            updateMessage=""
          >
            <CancelButton onClick={handleClose} disabled={isProfileLoading} />

            <SubmitButton
              isSubmitting={isProfileLoading}
              isDirty={isDirty}
              isCreate={true}
              createText="Change Password"
              updateText=""
              submittingCreateText="Changing..."
              submittingUpdateText=""
            />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
