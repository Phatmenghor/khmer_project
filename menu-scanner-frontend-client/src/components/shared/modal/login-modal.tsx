"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, LogIn, UserPlus, ArrowRight, ShoppingBag } from "lucide-react";
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
import { selectBusinessName, selectBusinessLogo } from "@/redux/features/business/store/selectors/business-settings-selector";

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
  const businessName = useAppSelector(selectBusinessName);
  const businessLogo = useAppSelector(selectBusinessLogo);
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

      // Block business users from logging in via public modal
      if (result?.userType === "BUSINESS_USER") {
        showToast.error("❌ Business accounts must use the Admin Login page");
        // Clear the tokens since we shouldn't have stored them
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

      // Block business users from logging in via public modal
      if (result?.userType === "BUSINESS_USER") {
        showToast.error("❌ Business accounts must use the Admin Login page");
        // Clear the tokens
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
      <DialogContent className="p-0 gap-0 w-full sm:max-w-2xl overflow-hidden rounded-3xl shadow-2xl border-border/20">
        <DialogTitle className="sr-only">
          {activeTab === "login" ? "Sign in" : "Create account"}
        </DialogTitle>

        <div className="flex flex-col lg:flex-row">
          {/* ── Left Side: Branding & Feature Highlights ── */}
          <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex-col justify-between p-8 text-primary-foreground">
            {/* Logo & Business Name */}
            <div>
              <div className="flex items-center gap-3.5 mb-8">
                {businessLogo ? (
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/20 flex-shrink-0">
                    <Image
                      src={businessLogo}
                      alt={businessName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-75 font-medium">Menu Scanner</p>
                  <h1 className="text-xl font-bold leading-tight">{businessName}</h1>
                </div>
              </div>

              <h3 className="text-3xl font-bold leading-tight mb-4">
                {activeTab === "login" ? "Welcome Back!" : "Join Us Today"}
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                {activeTab === "login"
                  ? "Sign in to access your account and continue shopping with us."
                  : "Create an account to unlock exclusive features and save your preferences."}
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3">
              {[
                { icon: "✓", text: "Fast & Secure Login" },
                { icon: "✓", text: "Save Your Preferences" },
                { icon: "✓", text: "Track Your Orders" },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-lg font-bold">{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Side: Form ── */}
          <div className="w-full lg:w-3/5 flex flex-col">
            {/* Mobile Header */}
            <div className="lg:hidden bg-gradient-to-r from-primary to-primary/90 px-6 py-6 text-primary-foreground">
              <h2 className="text-2xl font-bold">
                {activeTab === "login" ? "Sign In" : "Create Account"}
              </h2>
              <p className="text-sm mt-1 opacity-80">
                {activeTab === "login"
                  ? "Welcome back to {businessName}"
                  : "Join {businessName} today"}
              </p>
            </div>

            {/* Tab Switcher - Modern Pill Style */}
            <div className="px-6 pt-6 lg:pt-8">
              <div className="flex gap-2 bg-muted/50 p-1 rounded-full">
                {(["login", "register"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => switchTab(tab)}
                    className={cn(
                      "flex-1 py-2.5 px-4 text-sm font-medium transition-all rounded-full duration-300",
                      activeTab === tab
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab === "login" ? (
                      <span className="flex items-center justify-center gap-2">
                        <LogIn className="h-4 w-4" /> Sign In
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <UserPlus className="h-4 w-4" /> Register
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Form area ── */}
            <div className="px-6 py-6 lg:py-8 flex-1 overflow-y-auto max-h-[65dvh]">
            {/* Login form */}
            {activeTab === "login" && (
              <div className="space-y-6">
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4.5"
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

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border/60 accent-primary cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        Remember me
                      </span>
                    </label>
                    <a
                      href="#"
                      className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold mt-3 rounded-xl text-base transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                    disabled={isAnyLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
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

                <p className="text-center text-sm text-muted-foreground pt-2">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("register")}
                    className="text-primary font-bold hover:text-primary/80 transition-colors"
                  >
                    Create one
                  </button>
                </p>
              </div>
            )}

            {/* Register form */}
            {activeTab === "register" && (
              <div className="space-y-6">
                <form
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  className="space-y-4.5"
                >
                  <div className="grid grid-cols-2 gap-3.5">
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
                    label="Email Address"
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
                    placeholder="Minimum 8 characters"
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
                    placeholder="Re-enter your password"
                    control={registerForm.control}
                    error={registerForm.formState.errors.confirmPassword}
                    disabled={isAnyLoading}
                    required
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword((v) => !v)}
                  />

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border/60 accent-primary cursor-pointer mt-1 flex-shrink-0"
                    />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      I agree to the{" "}
                      <a href="#" className="text-primary font-medium hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary font-medium hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold mt-3 rounded-xl text-base transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                    disabled={isAnyLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
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

                <p className="text-center text-sm text-muted-foreground pt-2">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("login")}
                    className="text-primary font-bold hover:text-primary/80 transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            )}
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-4 border-t border-border/60 bg-muted/20 mt-auto">
              <p className="text-center text-xs text-muted-foreground leading-relaxed">
                By continuing, you agree to our{" "}
                <a href="#" className="text-primary hover:underline font-medium transition-colors">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline font-medium transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
