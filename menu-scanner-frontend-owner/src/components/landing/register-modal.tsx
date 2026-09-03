"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCheck, UserPlus, LogIn } from "lucide-react";
import { CustomButton, CancelButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { AuthSocialGrid } from "@/components/shared/auth/auth-social-divider";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import {
  registerQuickUserService,
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

interface RegisterModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  plan?: any;
  onLoginClick?: () => void;
  initialView?: "login" | "register";
}

const loginSchema = z.object({
  userIdentifier: z.string().min(1, "Identifier is required"),
  password: z.string().min(6, "Min 6 characters"),
});

const registerSchema = z.object({
  userIdentifier: z.string().min(3, "Min 3 characters"),
  password: z.string().min(6, "Min 6 characters"),
  confirmPassword: z.string().min(6, "Confirmation required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterModal({
  isOpen,
  open,
  onClose,
  onOpenChange,
  initialView = "login",
}: RegisterModalProps) {
  const isModalOpen = isOpen ?? open ?? false;
  const [view, setView] = useState<"login" | "register">(initialView);

  const handleModalClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userIdentifier: "",
      password: "",
      confirmPassword: "",
    },
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
      handleModalClose();
      window.location.reload();
    } catch (err) {
      showToast.error(getErrorMessage(err, "Login failed. Check details."));
    } finally {
      setIsSubmitLoading(false);
    }
  }

  async function onRegisterSubmit(values: RegisterFormData) {
    setIsSubmitLoading(true);
    try {
      const result = await dispatch(
        registerQuickUserService({
          userIdentifier: values.userIdentifier,
          password: values.password,
        }),
      ).unwrap();

      if (result) {
        showToast.success("Account created!");
        registerForm.reset();

        try {
          await dispatch(
            loginService({
              userIdentifier: values.userIdentifier,
              password: values.password,
              userType: "BUSINESS_USER",
            }),
          ).unwrap();

          showToast.success("Signed in successfully!");
          handleModalClose();
          window.location.reload();
        } catch (loginErr: any) {
          showToast.error("Created! Please sign in.");
          setView("login");
        }
      }
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Registration failed."));
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
        handleModalClose();
        window.location.reload();
      }
    } catch (err: unknown) {
      showToast.error((err as { message?: string })?.message || Messages.auth.telegramFailed);
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    showToast.info("Google OAuth ready.");
  };

  const handleClose = () => {
    if (!isAnyLoading) {
      handleModalClose();
      loginForm.reset();
      registerForm.reset();
    }
  };

  return (
    <CustomModal isOpen={isModalOpen} onClose={handleClose} size="md">
      <FormHeader
        title={view === "login" ? "Sign In" : "Register"}
        description={
          view === "login"
            ? "Sign in to continue"
            : businessName
            ? `Register for ${businessName}`
            : "Create account to continue"
        }
        icon={view === "login" ? UserCheck : UserPlus}
        showAvatar={false}
      />

      {view === "login" ? (
        /* DEDICATED LOGIN MODAL VIEW */
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col flex-1">
          <div className="p-4 sm:p-5 space-y-3 max-h-[65vh] overflow-y-auto">
            <TextField
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
                onClick={() => setView("register")}
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
      ) : (
        /* DEDICATED REGISTER MODAL VIEW */
        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="flex flex-col flex-1">
          <div className="p-4 sm:p-5 space-y-3 max-h-[65vh] overflow-y-auto">
            <TextField
              name="userIdentifier"
              label="User Identifier"
              placeholder="Enter user identifier"
              control={registerForm.control}
              error={registerForm.formState.errors.userIdentifier}
              disabled={isAnyLoading}
              required
              inputClassName="h-9 text-xs rounded-xl"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                inputClassName="h-9 text-xs rounded-xl"
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
                inputClassName="h-9 text-xs rounded-xl"
              />
            </div>

            <AuthSocialGrid
              onGoogleAuth={handleGoogleAuth}
              onTelegramAuth={handleTelegramAuth}
              disabled={isAnyLoading}
              isTelegramLoading={isTelegramLoading}
            />
          </div>

          <div className="px-4 py-3 border-t border-border/70 bg-muted/20 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground font-medium">
              Have an account?{" "}
              <button
                type="button"
                onClick={() => setView("login")}
                className="text-primary font-extrabold hover:underline cursor-pointer"
              >
                Sign In
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
                <UserPlus className="w-3.5 h-3.5" />
                {isSubmitLoading ? "Creating..." : "Register"}
              </CustomButton>
            </div>
          </div>
        </form>
      )}
    </CustomModal>
  );
}
