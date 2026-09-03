"use client";

import { CustomButton, CancelButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "./custom-modal";
import { Messages } from "@/constants/messages";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserPlus } from "lucide-react";

import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import {
  registerCustomerService,
  loginService,
} from "@/features/auth/store/thunks/auth-thunks";
import { telegramAuthenticateService } from "@/features/auth/store/thunks/social-auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { TelegramLoginButton } from "@/components/shared/telegram/telegram-login-widget";
import { TelegramAuthData } from "@/features/auth/store/models/request/social-auth-request";
import { AppDefault, SocialAuthConfig } from "@/constants/app-resource/default/default";
import { useAppSelector } from "@/store";
import { selectBusinessName } from "@/features/business/store/selectors/business-settings-selector";
import { getErrorMessage } from "@/utils/error/get-error-message";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: () => void;
}

const registerSchema = z.object({
  userIdentifier: z.string().min(3, "User Identifier must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

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
    defaultValues: { userIdentifier: "", password: "", confirmPassword: "", firstName: "", lastName: "", phone: "" },
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
          businessId: AppDefault.BUSINESS_ID,
        }),
      ).unwrap();

      if (result) {
        showToast.success(Messages.auth.accountCreated);
        registerForm.reset();

        try {
          await dispatch(
            loginService({
              userIdentifier: values.userIdentifier,
              password: values.password,
              businessId: AppDefault.BUSINESS_ID,
              userType: "CUSTOMER",
            }),
          ).unwrap();

          showToast.success("Logged in successfully!");
          onOpenChange(false);
        } catch (loginErr: unknown) {
          showToast.error(getErrorMessage(loginErr, "Registration successful, but login failed. Please log in manually."));
        }
      }
    } catch (err: unknown) {
      showToast.error(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setIsRegistrationLoading(false);
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

  const handleClose = () => {
    if (!isAnyLoading) {
      onOpenChange(false);
      registerForm.reset();
    }
  };

  return (
    <CustomModal isOpen={open} onClose={handleClose} size="md">
      {/* Header */}
      <FormHeader
        title="Create Account"
        description={
          businessName
            ? `Join ${businessName} to start shopping`
            : "Create a new account to continue"
        }
        icon={UserPlus}
        showAvatar={false}
      />

      {/* Form Body */}
      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="flex flex-col flex-1">
        <div className="p-4 sm:p-5 space-y-3.5 max-h-[70vh] overflow-y-auto">
          
          {/* Account Credentials ON TOP */}
          <div className="space-y-3">
            <TextField
              name="userIdentifier"
              label="User Identifier"
              placeholder="Enter user identifier"
              control={registerForm.control}
              error={registerForm.formState.errors.userIdentifier}
              disabled={isAnyLoading}
              required
              inputClassName="h-9 text-xs"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                inputClassName="h-9 text-xs"
              />

              <PasswordField
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Enter confirm password"
                control={registerForm.control}
                error={registerForm.formState.errors.confirmPassword}
                disabled={isAnyLoading}
                required
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword((v) => !v)}
                inputClassName="h-9 text-xs"
              />
            </div>
          </div>

          {/* Section Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Personal Information
              </span>
            </div>
          </div>

          {/* Personal Info AT BOTTOM */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                name="firstName"
                label="First Name"
                placeholder="Enter first name"
                control={registerForm.control}
                error={registerForm.formState.errors.firstName}
                disabled={isAnyLoading}
                required
                inputClassName="h-9 text-xs"
              />
              <TextField
                name="lastName"
                label="Last Name"
                placeholder="Enter last name"
                control={registerForm.control}
                error={registerForm.formState.errors.lastName}
                disabled={isAnyLoading}
                required
                inputClassName="h-9 text-xs"
              />
            </div>

            <TextField
              name="phone"
              label="Phone Number"
              placeholder="Enter phone number"
              control={registerForm.control}
              error={registerForm.formState.errors.phone}
              disabled={isAnyLoading}
              required
              inputClassName="h-9 text-xs"
            />
          </div>

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
            className="w-full h-9 text-xs font-semibold rounded-xl"
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/70 bg-gradient-to-r from-muted/50 to-muted/30 flex-shrink-0 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <CustomButton
              variant="unstyled"
              size="unstyled"
              type="button"
              onClick={() => {
                onOpenChange(false);
                onLoginClick?.();
              }}
              disabled={isAnyLoading}
              className="text-primary font-bold hover:underline disabled:opacity-50"
            >
              Sign In
            </CustomButton>
          </p>

          <div className="flex items-center gap-2">
            <CancelButton
              onClick={handleClose}
              disabled={isAnyLoading}
              customText="Cancel"
              className="h-8 text-xs font-bold"
            />
            <CustomButton
              type="submit"
              disabled={isAnyLoading}
              isLoading={isRegistrationLoading}
              className="h-8 min-w-[100px] text-xs font-bold gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {isRegistrationLoading ? "Creating..." : "Create Account"}
            </CustomButton>
          </div>
        </div>
      </form>
    </CustomModal>
  );
}
