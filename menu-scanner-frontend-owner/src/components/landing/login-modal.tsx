"use client";

import { CustomButton, CancelButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LogIn } from "lucide-react";

import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { loginService } from "@/features/auth/store/thunks/auth-thunks";
import { telegramAuthenticateService } from "@/features/auth/store/thunks/social-auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { TelegramLoginButton } from "@/components/shared/telegram/telegram-login-widget";
import { TelegramAuthData } from "@/features/auth/store/models/request/social-auth-request";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";
import { getErrorMessage } from "@/utils/error/get-error-message";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick?: () => void;
}

const loginSchema = z.object({
  userIdentifier: z.string().min(1, "User Identifier is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);

  const { isLoading, dispatch } = useAuthState();
  const isAnyLoading = isLoading || isTelegramLoading;

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userIdentifier: "", password: "" },
  });

  async function onLoginSubmit(values: LoginFormData) {
    try {
      await dispatch(
        loginService({
          userIdentifier: values.userIdentifier,
          password: values.password,
          userType: "PLATFORM_USER",
        }),
      ).unwrap();

      showToast.success("Welcome back! Redirecting to dashboard...");
      onClose();
      loginForm.reset();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      showToast.error(getErrorMessage(err, "Login failed. Please check your credentials."));
    }
  }

  const handleTelegramAuth = async (telegramData: TelegramAuthData) => {
    setIsTelegramLoading(true);
    try {
      const result = await dispatch(
        telegramAuthenticateService({ telegramData, userType: "PLATFORM_USER" }),
      ).unwrap();

      if (result) {
        showToast.success("Welcome back! Redirecting to dashboard...");
        onClose();
        window.location.reload();
      }
    } catch (err) {
      showToast.error(getErrorMessage(err, "Telegram login failed. Please try again."));
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const handleClose = () => {
    if (!isAnyLoading) {
      onClose();
      loginForm.reset();
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="sm">
      {/* Header */}
      <FormHeader
        title="Sign In"
        description="Sign in to your owner account to continue"
        icon={LogIn}
        showAvatar={false}
      />

      {/* Form Body */}
      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col flex-1">
        <div className="p-4 space-y-3.5">
          <TextField
            name="userIdentifier"
            label="User Identifier"
            placeholder="Enter username or email"
            control={loginForm.control}
            error={loginForm.formState.errors.userIdentifier}
            disabled={isAnyLoading}
            required
            inputClassName="h-9 text-xs rounded-xl"
          />

          <PasswordField
            name="password"
            label="Password"
            placeholder="Enter your password"
            control={loginForm.control}
            error={loginForm.formState.errors.password}
            disabled={isAnyLoading}
            required
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
            inputClassName="h-9 text-xs rounded-xl"
          />

          {/* Social Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Telegram Login */}
          <TelegramLoginButton
            botName={SocialAuthConfig.TELEGRAM_BOT_NAME}
            botId={SocialAuthConfig.TELEGRAM_BOT_ID}
            onAuth={handleTelegramAuth}
            disabled={isAnyLoading}
            loading={isTelegramLoading}
            className="w-full h-9 text-xs font-bold rounded-xl"
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/70 bg-gradient-to-r from-muted/50 to-muted/30 flex-shrink-0 flex items-center justify-end gap-2">
          <CancelButton
            onClick={handleClose}
            disabled={isAnyLoading}
            customText="Cancel"
            className="h-9 text-xs font-bold rounded-xl px-4"
          />
          <CustomButton
            type="submit"
            disabled={isAnyLoading}
            isLoading={isLoading}
            className="h-9 min-w-[95px] text-xs font-bold rounded-xl gap-1.5 px-4"
          >
            <LogIn className="w-3.5 h-3.5" />
            {isLoading ? "Signing in..." : "Sign In"}
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
}
