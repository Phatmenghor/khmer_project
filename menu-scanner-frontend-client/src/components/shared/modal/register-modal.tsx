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
  registerCustomerService,
  loginService,
} from "@/features/auth/store/thunks/auth-thunks";
import { telegramAuthenticateService } from "@/features/auth/store/thunks/social-auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { TelegramLoginButton } from "@/components/shared/telegram/telegram-login-widget";
import { TelegramAuthData } from "@/features/auth/store/models/request/social-auth-request";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";
import { useAppSelector } from "@/store";
import { selectBusinessName } from "@/features/business/store/selectors/business-settings-selector";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: () => void;
}

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userIdentifier: z.string().min(3, "Email or username must be at least 3 characters"),
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function Divider() {
  return (
    <div className="relative my-2">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/40" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-1 text-xs text-muted-foreground">or</span>
      </div>
    </div>
  );
}

export function RegisterModal({ open, onOpenChange, onLoginClick }: RegisterModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);
  const [isRegistrationLoading, setIsRegistrationLoading] = useState(false);

  const { isLoading, dispatch } = useAuthState();
  const isSocialLoading = useAppSelector((state) => state.auth.isSocialLoading);
  const businessName = useAppSelector(selectBusinessName);
  const isAnyLoading = isLoading || isSocialLoading || isTelegramLoading || isRegistrationLoading;

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", userIdentifier: "", phone: "", password: "", confirmPassword: "" },
  });

  async function onRegisterSubmit(values: RegisterFormData) {
    setIsRegistrationLoading(true);
    try {
      const result = await dispatch(
        registerCustomerService({
          userIdentifier: values.userIdentifier,
          email: values.userIdentifier,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phone,
          userType: "CUSTOMER",
        }),
      ).unwrap();

      if (result) {
        showToast.success(Messages.auth.accountCreated);
        registerForm.reset();

        // Auto-login after successful registration
        try {
          await dispatch(
            loginService({
              userIdentifier: values.userIdentifier,
              password: values.password,
              businessId: null,
              userType: "CUSTOMER",
            }),
          ).unwrap();

          showToast.success("Logged in successfully!");
          onOpenChange(false);
        } catch (loginErr: any) {
          let loginErrorMessage: string = "Registration successful, but login failed. Please log in manually.";

          if (typeof loginErr === 'string') {
            loginErrorMessage = loginErr;
          } else if (loginErr?.message) {
            loginErrorMessage = loginErr.message;
          } else if (loginErr?.payload) {
            if (typeof loginErr.payload === 'string') {
              loginErrorMessage = loginErr.payload;
            } else if (loginErr.payload?.message) {
              loginErrorMessage = loginErr.payload.message;
            }
          }

          showToast.error(loginErrorMessage);
        }
      }
    } catch (err: any) {
      let errorMessage: string = "Registration failed. Please try again.";

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
    } finally {
      setIsRegistrationLoading(false);
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
    } catch (err: unknown) {
      showToast.error((err as { message?: string })?.message || Messages.auth.telegramFailed);
    } finally {
      setIsTelegramLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {}
        <DialogHeader className="text-left">
          <div>
            <DialogTitle className="text-base">{businessName}</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Create a new account
            </p>
          </div>
        </DialogHeader>

        <Separator />

        {}
        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3">
          {}
          <div className="grid grid-cols-2 gap-2">
            <TextField
              name="firstName"
              label="First Name"
              placeholder="John"
              control={registerForm.control}
              error={registerForm.formState.errors.firstName}
              disabled={isAnyLoading}
              required
            />
            <TextField
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              control={registerForm.control}
              error={registerForm.formState.errors.lastName}
              disabled={isAnyLoading}
              required
            />
          </div>

          <TextField
            name="userIdentifier"
            label="Email or Username"
            placeholder="Email or username"
            control={registerForm.control}
            error={registerForm.formState.errors.userIdentifier}
            disabled={isAnyLoading}
            required
          />

          <TextField
            name="phone"
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            control={registerForm.control}
            error={registerForm.formState.errors.phone}
            disabled={isAnyLoading}
            required
          />

          <PasswordField
            name="password"
            label="Password"
            placeholder="Enter password"
            control={registerForm.control}
            error={registerForm.formState.errors.password}
            disabled={isAnyLoading}
            required
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm password"
            control={registerForm.control}
            error={registerForm.formState.errors.confirmPassword}
            disabled={isAnyLoading}
            required
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword((v) => !v)}
          />

          {}
          <DialogFooter className="pt-1">
            <Button
              type="submit"
              className="w-full h-8 font-semibold"
              disabled={isAnyLoading}
            >
              {isRegistrationLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {isRegistrationLoading
                ? (isLoading ? "Logging in..." : "Creating account...")
                : "Create Account"
              }
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

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onLoginClick?.();
              }}
              className="text-primary font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
