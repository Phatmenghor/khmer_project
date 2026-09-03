"use client";

import { CustomButton, CancelButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "./custom-modal";
import { Messages } from "@/constants/messages";
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
import { AppDefault, SocialAuthConfig } from "@/constants/app-resource/default/default";
import { useAppSelector } from "@/store";
import { selectBusinessName } from "@/features/business/store/selectors/business-settings-selector";
import { getErrorMessage } from "@/utils/common/error-handler";
import { RegisterModal } from "./register-modal";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterClick?: () => void;
}

const loginSchema = z.object({
  userIdentifier: z.string().min(1, "User Identifier is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginModal({ open, onOpenChange, onRegisterClick }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const { isLoading, dispatch } = useAuthState();
  const isSocialLoading = useAppSelector((state) => state.auth.isSocialLoading);
  const businessName = useAppSelector(selectBusinessName);
  const isAnyLoading = isLoading || isSocialLoading || isTelegramLoading;

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
          userType: "CUSTOMER",
          businessId: AppDefault.BUSINESS_ID,
        }),
      ).unwrap();

      showToast.success(Messages.auth.loggedIn);
      onOpenChange(false);
      loginForm.reset();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: unknown) {
      showToast.error(getErrorMessage(err, "Login failed. Please check your credentials."));
    }
  }

  const handleTelegramAuth = async (telegramData: TelegramAuthData) => {
    setIsTelegramLoading(true);
    try {
      const result = await dispatch(
        telegramAuthenticateService({ telegramData, userType: "CUSTOMER", businessId: AppDefault.BUSINESS_ID }),
      ).unwrap();

      if (result?.userType === "BUSINESS_USER") {
        showToast.error(Messages.auth.loginBlocked);
        const { clearAllTokens, clearAdminTokens } = await import("@/utils/local-storage/token");
        const { clearUserInfo, clearAdminUserInfo } = await import("@/utils/local-storage/userInfo");
        clearAllTokens();
        clearAdminTokens();
        clearUserInfo();
        clearAdminUserInfo();
        return;
      }

      if (result) {
        showToast.success(
          result.isNewUser ? "Welcome! Your account has been created." : Messages.auth.welcomeBack,
        );
        onOpenChange(false);
        window.location.reload();
      }
    } catch (err: unknown) {
      showToast.error(getErrorMessage(err, Messages.auth.telegramFailed));
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const handleClose = () => {
    if (!isAnyLoading) {
      onOpenChange(false);
      loginForm.reset();
    }
  };

  return (
    <>
      <CustomModal isOpen={open && !showRegisterModal} onClose={handleClose} size="sm">
        {/* Header */}
        <FormHeader
          title="Sign In"
          description={
            businessName
              ? `Welcome back to ${businessName}`
              : "Sign in to your account to continue"
          }
          icon={LogIn}
          showAvatar={false}
        />

        {/* Form Body - Native form handles Enter key submit */}
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
          <div className="px-4 py-3 border-t border-border/70 bg-gradient-to-r from-muted/50 to-muted/30 flex-shrink-0 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              No account?{" "}
              <CustomButton
                variant="unstyled"
                size="unstyled"
                type="button"
                onClick={() => {
                  if (onRegisterClick) {
                    onOpenChange(false);
                    onRegisterClick();
                  } else {
                    setShowRegisterModal(true);
                  }
                }}
                disabled={isAnyLoading}
                className="text-primary font-bold hover:underline disabled:opacity-50"
              >
                Register
              </CustomButton>
            </p>

            <div className="flex items-center gap-2">
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
          </div>
        </form>
      </CustomModal>

      {showRegisterModal && (
        <RegisterModal
          open={showRegisterModal}
          onOpenChange={(isOpen) => {
            setShowRegisterModal(isOpen);
            if (!isOpen) {
              onOpenChange(false);
            }
          }}
          onLoginClick={() => {
            setShowRegisterModal(false);
          }}
        />
      )}
    </>
  );
}
