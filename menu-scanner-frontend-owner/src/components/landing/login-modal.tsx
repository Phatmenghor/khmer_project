"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, UserCheck } from "lucide-react";
import { CustomButton, CancelButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { AuthSocialGrid } from "@/components/shared/auth/auth-social-divider";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import {
  loginService,
  getProfileService,
} from "@/features/auth/store/thunks/auth-thunks";
import { telegramAuthenticateService } from "@/features/auth/store/thunks/social-auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { TelegramAuthData } from "@/features/auth/store/models/request/social-auth-request";
import { AppDefault } from "@/constants/app-resource/default/default";
import { useAppSelector } from "@/store";
import { selectBusinessName } from "@/features/business/store/selectors/business-settings-selector";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { Messages } from "@/constants/messages";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick?: () => void;
}

const loginSchema = z.object({
  userIdentifier: z.string().min(1, "User identifier is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const { isLoading, dispatch } = useAuthState();
  const isSocialLoading = useAppSelector((state) => state.auth.isSocialLoading);
  const businessName = useAppSelector(selectBusinessName);
  const isAnyLoading = isLoading || isSocialLoading || isTelegramLoading || isSubmitLoading;

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userIdentifier: "", password: "" },
  });

  async function onLoginSubmit(values: LoginFormData) {
    setIsSubmitLoading(true);
    try {
      await dispatch(
        loginService({
          userIdentifier: values.userIdentifier,
          password: values.password,
          userType: "BUSINESS_USER",
        }),
      ).unwrap();
      dispatch(getProfileService());
      showToast.success("Signed in successfully!");
      onClose();
      loginForm.reset();
      window.location.reload();
    } catch (err) {
      showToast.error(getErrorMessage(err, "Login failed. Check details."));
    } finally {
      setIsSubmitLoading(false);
    }
  }

  const handleTelegramAuth = async (telegramData: TelegramAuthData) => {
    setIsTelegramLoading(true);
    try {
      const result = await dispatch(
        telegramAuthenticateService({
          telegramData,
          userType: "BUSINESS_USER",
          businessId: AppDefault.BUSINESS_ID,
        }),
      ).unwrap();

      if (result) {
        showToast.success(result.isNewUser ? "Welcome!" : Messages.auth.welcomeBack);
        onClose();
        loginForm.reset();
        window.location.reload();
      }
    } catch (err: unknown) {
      showToast.error(getErrorMessage(err, Messages.auth.telegramFailed));
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    showToast.info("Google OAuth ready.");
  };

  const handleClose = () => {
    if (!isAnyLoading) {
      loginForm.reset();
      onClose();
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="md">
      <FormHeader
        title="Sign In"
        description={
          businessName
            ? `Welcome back to ${businessName}`
            : "Sign in to your account to continue"
        }
        icon={UserCheck}
        showAvatar={false}
      />

      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col flex-1">
        <div className="p-4 sm:p-5 space-y-3 max-h-[65vh] overflow-y-auto">
          <TextField
            key="login-user-identifier"
            name="userIdentifier"
            label="User Identifier"
            placeholder="Enter user identifier"
            control={loginForm.control}
            error={loginForm.formState.errors.userIdentifier}
            disabled={isAnyLoading}
            required
            inputClassName="h-9 text-xs rounded-xl"
          />

          <PasswordField
            name="password"
            label="Password"
            placeholder="Enter password"
            control={loginForm.control}
            error={loginForm.formState.errors.password}
            disabled={isAnyLoading}
            required
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
            inputClassName="h-9 text-xs rounded-xl"
          />

          <AuthSocialGrid
            onGoogleAuth={handleGoogleAuth}
            onTelegramAuth={handleTelegramAuth}
            disabled={isAnyLoading}
            isTelegramLoading={isTelegramLoading}
          />
        </div>

        <div className="px-4 py-3 border-t border-border/70 bg-muted/20 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-medium">
            No account?{" "}
            <button
              type="button"
              onClick={() => {
                onClose();
                onRegisterClick?.();
              }}
              className="text-primary font-extrabold hover:underline cursor-pointer"
            >
              Register
            </button>
          </p>

          <div className="flex items-center gap-2">
            <CancelButton onClick={handleClose} disabled={isAnyLoading} customText="Cancel" className="h-8 text-xs font-bold rounded-xl" />
            <CustomButton
              type="submit"
              disabled={isAnyLoading}
              isLoading={isSubmitLoading}
              className="h-8 min-w-[90px] text-xs font-bold rounded-xl gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              {isSubmitLoading ? "Signing in..." : "Sign In"}
            </CustomButton>
          </div>
        </div>
      </form>
    </CustomModal>
  );
}
