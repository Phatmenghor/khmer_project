"use client";

import { Messages } from "@/constants/messages";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, LogIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { FormBody } from "@/components/shared/form-field/form-body";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { loginService } from "@/features/auth/store/thunks/auth-thunks";
import { telegramAuthenticateService } from "@/features/auth/store/thunks/social-auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { TelegramLoginButton } from "@/components/shared/telegram/telegram-login-widget";
import { TelegramAuthData } from "@/features/auth/store/models/request/social-auth-request";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";
import { useAppSelector } from "@/store";
import { selectBusinessName } from "@/features/business/store/selectors/business-settings-selector";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterClick?: () => void;
}

const loginSchema = z.object({
  userIdentifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginModal({ open, onOpenChange, onRegisterClick }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);

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
        }),
      ).unwrap();

      showToast.success(Messages.auth.loggedIn);
      onOpenChange(false);
      loginForm.reset();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      let errorMessage: string = "Login failed. Please check your credentials.";

      // Handle different error formats from Redux thunk
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.payload) {
        if (typeof err.payload === 'string') {
          errorMessage = err.payload;
        } else if (err.payload?.message) {
          errorMessage = err.payload.message;
        }
      }

      showToast.error(errorMessage);
    }
  }

  const handleTelegramAuth = async (telegramData: TelegramAuthData) => {
    setIsTelegramLoading(true);
    try {
      const result = await dispatch(
        telegramAuthenticateService({ telegramData, userType: "CUSTOMER" }),
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
      showToast.error((err as { message?: string })?.message || Messages.auth.telegramFailed);
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xs p-0 flex flex-col gap-0">
        {/* Header — matches FormHeader admin style */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 border border-primary/30 rounded shrink-0">
              <LogIn className="h-3 w-3 text-primary" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <DialogTitle className="text-xs font-semibold">
                Sign In
              </DialogTitle>
              <DialogDescription className="text-xs">
                {businessName
                  ? `Welcome back to ${businessName}`
                  : "Sign in to your account to continue"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col flex-1">
          <FormBody>
            <TextField
              name="userIdentifier"
              label="Email or Username"
              placeholder="name@example.com"
              control={loginForm.control}
              error={loginForm.formState.errors.userIdentifier}
              disabled={isAnyLoading}
              required
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
            />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-2 text-xs text-muted-foreground">
                  or continue with
                </span>
              </div>
            </div>

            {/* Telegram */}
            <TelegramLoginButton
              botName={SocialAuthConfig.TELEGRAM_BOT_NAME}
              botId={SocialAuthConfig.TELEGRAM_BOT_ID}
              onAuth={handleTelegramAuth}
              disabled={isAnyLoading}
              loading={isTelegramLoading}
              className="w-full h-7"
            />
          </FormBody>

          {/* Footer — matches FormFooter admin style */}
          <div className="flex flex-col gap-2 px-4 py-3 border-t bg-muted/30 flex-shrink-0 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
              No account?{" "}
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onRegisterClick?.();
                }}
                disabled={isAnyLoading}
                className="text-primary font-semibold hover:underline disabled:opacity-50"
              >
                Register
              </button>
            </p>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isAnyLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAnyLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
