"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

function Divider({ label }: { label: string }) {
  return (
    <div className="relative my-1">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/60" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">
          {label}
        </span>
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
      await dispatch(
        loginService({
          userIdentifier: values.userIdentifier,
          password: values.password,
          userType: "CUSTOMER",
        }),
      ).unwrap();
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
      <DialogContent className="p-0 gap-0 w-full sm:max-w-md overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">
          {activeTab === "login" ? "Sign in" : "Create account"}
        </DialogTitle>

        {/* ── Brand header ── */}
        <div className="bg-primary px-6 pt-8 pb-6 text-primary-foreground">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-base font-semibold tracking-wide opacity-90">
              eMenu
            </span>
          </div>
          <h2 className="text-2xl font-bold leading-tight">
            {activeTab === "login" ? "Welcome back!" : "Create your account"}
          </h2>
          <p className="text-sm mt-1.5 opacity-75">
            {activeTab === "login"
              ? "Sign in to continue shopping"
              : "Join us and start exploring"}
          </p>
        </div>

        {/* ── Tab switcher ── */}
        <div className="flex border-b border-border/60 bg-muted/30">
          {(["login", "register"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => switchTab(tab)}
              className={cn(
                "flex-1 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* ── Form area ── */}
        <div className="px-6 py-6 max-h-[60dvh] overflow-y-auto">
          {/* Login form */}
          {activeTab === "login" && (
            <div className="space-y-5">
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
              >
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
                <Button
                  type="submit"
                  className="w-full h-10 font-semibold mt-2 rounded-xl"
                  disabled={isAnyLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <Divider label="or continue with" />

              <TelegramLoginButton
                botName={SocialAuthConfig.TELEGRAM_BOT_NAME}
                botId={SocialAuthConfig.TELEGRAM_BOT_ID}
                onAuth={handleTelegramAuth}
                disabled={isAnyLoading}
                loading={isTelegramLoading}
                className="w-full"
              />

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchTab("register")}
                  className="text-primary font-semibold hover:underline"
                >
                  Register now
                </button>
              </p>
            </div>
          )}

          {/* Register form */}
          {activeTab === "register" && (
            <div className="space-y-5">
              <form
                onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                className="space-y-4"
              >
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
                  label="Phone Number"
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
                  placeholder="Confirm your password"
                  control={registerForm.control}
                  error={registerForm.formState.errors.confirmPassword}
                  disabled={isAnyLoading}
                  required
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword((v) => !v)}
                />

                <Button
                  type="submit"
                  className="w-full h-10 font-semibold mt-2 rounded-xl"
                  disabled={isAnyLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <Divider label="or register with" />

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
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchTab("login")}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-3.5 border-t border-border/50 bg-muted/20">
          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Terms
            </a>{" "}
            &{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
