"use client";

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
import { cn } from "@/lib/utils";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import {
  loginService,
  registerCustomerService,
} from "@/redux/features/auth/store/thunks/auth-thunks";
import { telegramAuthenticateService } from "@/redux/features/auth/store/thunks/social-auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { TelegramLoginButton } from "@/components/shared/telegram/telegram-login-widget";
import { TelegramAuthData } from "@/redux/features/auth/store/models/request/social-auth-request";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";
import { useAppSelector } from "@/redux/store";
import { selectBusinessName } from "@/redux/features/business/store/selectors/business-settings-selector";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const loginSchema = z.object({
  userIdentifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    userIdentifier: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

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

type Tab = "login" | "register";

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);

  const { isLoading, dispatch } = useAuthState();
  const isSocialLoading = useAppSelector((state) => state.auth.isSocialLoading);
  const businessName = useAppSelector(selectBusinessName);
  const isAnyLoading = isLoading || isSocialLoading || isTelegramLoading;

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
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
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

      if (result?.userType === "BUSINESS_USER") {
        showToast.error("❌ Business accounts must use the Admin Login page");
        const { clearAllTokens, clearAdminTokens } = await import("@/utils/local-storage/token");
        const { clearUserInfo, clearAdminUserInfo } = await import("@/utils/local-storage/userInfo");
        clearAllTokens();
        clearAdminTokens();
        clearUserInfo();
        clearAdminUserInfo();
        loginForm.reset();
        return;
      }

      showToast.success("Welcome! You've successfully logged in.");
      onOpenChange(false);
      loginForm.reset();
      window.location.reload();
    } catch (err: any) {
      showToast.error(err || "Login failed. Please check your credentials.");
    }
  }

  async function onRegisterSubmit(values: RegisterFormData) {
    try {
      await dispatch(
        registerCustomerService({
          userIdentifier: values.userIdentifier,
          email: values.userIdentifier,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
        }),
      ).unwrap();
      showToast.success("Account created! Please log in.");
      setActiveTab("login");
      registerForm.reset();
      loginForm.setValue("userIdentifier", values.userIdentifier);
    } catch (err: any) {
      showToast.error(err || "Registration failed. Please try again.");
    }
  }

  const handleTelegramAuth = async (telegramData: TelegramAuthData) => {
    setIsTelegramLoading(true);
    try {
      const result = await dispatch(
        telegramAuthenticateService({ telegramData, userType: "CUSTOMER" }),
      ).unwrap();

      if (result?.userType === "BUSINESS_USER") {
        showToast.error("❌ Business accounts must use the Admin Login page");
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
          result.isNewUser ? "Welcome! Your account has been created." : "Welcome back!",
        );
        onOpenChange(false);
        window.location.reload();
      }
    } catch (err: any) {
      showToast.error(err || "Telegram login failed. Please try again.");
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {/* Header */}
        <DialogHeader className="text-left">
          <div>
            <DialogTitle className="text-2xl">{businessName}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "login"
                ? "Sign in to your account"
                : "Create a new account"}
            </p>
          </div>
        </DialogHeader>

        <Separator />

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
          {(["login", "register"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => switchTab(tab)}
              className={cn(
                "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Body - Login Form */}
        {activeTab === "login" && (
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
                onClick={() => switchTab("register")}
                className="text-primary font-semibold hover:underline"
              >
                Register
              </button>
            </p>

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
          </form>
        )}

        {/* Body - Register Form */}
        {activeTab === "register" && (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField
                name="firstName"
                label="First Name"
                placeholder="John"
                control={registerForm.control}
                error={registerForm.formState.errors.firstName}
                disabled={isAnyLoading}
              />
              <TextField
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                control={registerForm.control}
                error={registerForm.formState.errors.lastName}
                disabled={isAnyLoading}
              />
            </div>

            <TextField
              name="userIdentifier"
              label="Email"
              type="email"
              placeholder="name@example.com"
              control={registerForm.control}
              error={registerForm.formState.errors.userIdentifier}
              disabled={isAnyLoading}
              required
            />

            <TextField
              name="phoneNumber"
              label="Phone"
              type="tel"
              placeholder="+855 12 345 678"
              control={registerForm.control}
              error={registerForm.formState.errors.phoneNumber}
              disabled={isAnyLoading}
            />

            <PasswordField
              name="password"
              label="Password"
              placeholder="Min 8 characters"
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
              placeholder="Re-enter password"
              control={registerForm.control}
              error={registerForm.formState.errors.confirmPassword}
              disabled={isAnyLoading}
              required
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword((v) => !v)}
            />

            <Divider />

            <TelegramLoginButton
              botName={SocialAuthConfig.TELEGRAM_BOT_NAME}
              botId={SocialAuthConfig.TELEGRAM_BOT_ID}
              onAuth={handleTelegramAuth}
              disabled={isAnyLoading}
              loading={isTelegramLoading}
              className="w-full"
            >
              Register with Telegram
            </TelegramLoginButton>

            <p className="text-center text-sm text-muted-foreground">
              Have account?{" "}
              <button
                type="button"
                onClick={() => switchTab("login")}
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>

            {/* Footer - Submit Button */}
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 font-semibold"
                disabled={isAnyLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
