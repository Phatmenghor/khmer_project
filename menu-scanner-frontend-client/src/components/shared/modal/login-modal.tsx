"use client";

import { Messages } from "@/constants/messages";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import {
  loginService,
} from "@/features/auth/store/thunks/auth-thunks";
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

function Divider() {
  return (
    <div className="relative my-3">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/40" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-2 text-xs text-muted-foreground">or</span>
      </div>
    </div>
  );
}

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
      const result = await dispatch(
        loginService({
          userIdentifier: values.userIdentifier,
          password: values.password,
          userType: "CUSTOMER",
        }),
      ).unwrap();

      showToast.success(Messages.auth.loggedIn);
      onOpenChange(false);
      loginForm.reset();
      window.location.reload();
    } catch (err: any) {
      showToast.error(err || "Login failed. Please check your credentials.");
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
        setIsTelegramLoading(false);
        return;
      }

      if (result) {
        showToast.success(
          result.isNewUser ? "Welcome! Your account has been created." : Messages.auth.welcomeBack,
        );
        onOpenChange(false);
        window.location.reload();
      }
    } catch (err: any) {
      showToast.error(err || Messages.auth.telegramFailed);
    } finally {
      setIsTelegramLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {/* Header */}
        <DialogHeader className="text-left">
          <div>
            <DialogTitle className="text-2xl">{businessName}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your account
            </p>
          </div>
        </DialogHeader>

        <Separator />

        {/* Body - Login Form */}
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
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
            placeholder="Enter password"
            control={loginForm.control}
            error={loginForm.formState.errors.password}
            disabled={isAnyLoading}
            required
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
          />

          {/* Footer - Submit Button */}
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={isAnyLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </DialogFooter>

          <Divider />

          <TelegramLoginButton
            botName={SocialAuthConfig.TELEGRAM_BOT_NAME}
            botId={SocialAuthConfig.TELEGRAM_BOT_ID}
            onAuth={handleTelegramAuth}
            disabled={isAnyLoading}
            loading={isTelegramLoading}
            className="w-full"
          />

          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onRegisterClick?.();
              }}
              className="text-primary font-semibold hover:underline"
            >
              Register
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
