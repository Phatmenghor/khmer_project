"use client";

import { Messages } from "@/constants/messages";
import { useState, useEffect } from "react";
import Image from "next/image";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { loginService } from "@/features/auth/store/thunks/auth-thunks";
import { telegramAuthenticateService } from "@/features/auth/store/thunks/social-auth-thunks";
import { ROUTES } from "@/constants/app-routes/routes";
import { showToast } from "@/components/shared/common/show-toast";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { AppDefault, SocialAuthConfig } from "@/constants/app-resource/default/default";
import { TelegramLoginButton } from "@/components/shared/telegram/telegram-login-widget";
import { TelegramAuthData } from "@/features/auth/store/models/request/social-auth-request";
import { UserGropeType } from "@/constants/status/status";

const formSchema = z.object({
  userIdentifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);
  const router = useRouter();

  const { isLoading, dispatch, accessToken, authReady } = useAuthState();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (authReady && accessToken) {
      router.replace(ROUTES.ADMIN.DASHBOARD);
    }
  }, [authReady, accessToken, router]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { userIdentifier: "", password: "" },
  });

  async function handleLoginSubmit(values: FormData) {
    try {
      await dispatch(
        loginService({
          userIdentifier: values.userIdentifier,
          password: values.password,
          userType: "BUSINESS_USER",
          businessId: AppDefault.BUSINESS_ID,
        }),
      ).unwrap();
      showToast.success(Messages.auth.loginSuccess);
      setTimeout(() => {
        router.replace(ROUTES.ADMIN.DASHBOARD);
      }, 500);
    } catch (err: any) {
      let errorMessage: string = Messages.auth.loginFailed;

      // Debug: Log error structure
      console.log('Login error:', err, typeof err);

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

      console.log('Final error message:', errorMessage);
      showToast.error(errorMessage);
    }
  }

  const handleTelegramAuth = async (telegramData: TelegramAuthData) => {
    setIsTelegramLoading(true);
    try {
      await dispatch(
        telegramAuthenticateService({
          telegramData,
          userType: UserGropeType.BUSINESS_USER,
          businessId: AppDefault.BUSINESS_ID,
        }),
      ).unwrap();
      showToast.success(Messages.auth.welcomeBack);
      setTimeout(() => {
        router.replace(ROUTES.ADMIN.DASHBOARD);
      }, 500);
    } catch (err: any) {
      let errorMessage: string = Messages.auth.telegramFailed;

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
      setIsTelegramLoading(false);
    }
  };

  const isAnyLoading = isLoading || isTelegramLoading;

  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* ── Left — hero image ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <Image
          src={appImages.CpBank}
          alt="Background"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

        {/* bottom branding */}
        <div className="absolute bottom-7 left-7 right-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
            Management System
          </p>
          <h2 className="text-xs font-bold leading-snug">Admin Control Panel</h2>
          <p className="text-xs text-white/50 mt-1 max-w-xs leading-relaxed">
            Secure access to manage your business operations and team.
          </p>
        </div>
      </div>

      {/* ── Right — form panel ── */}
      <div className="flex flex-1 items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-lg shadow-2xl border border-border/60 rounded overflow-hidden">

          {/* Card header */}
          <div className="bg-primary/5 border-b border-border/50 px-5 pt-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Admin Panel
              </span>
            </div>
            <h1 className="text-base font-bold text-foreground leading-tight">
              Welcome back
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {/* Card body */}
          <CardContent className="px-5 py-5 space-y-3">

            {/* Credentials form */}
            <form onSubmit={form.handleSubmit(handleLoginSubmit)} className="space-y-3">
              <TextField
                name="userIdentifier"
                label="Email or Username"
                placeholder="name@example.com"
                control={form.control}
                error={form.formState.errors.userIdentifier}
                disabled={isAnyLoading}
                required
              />

              <PasswordField
                name="password"
                label="Password"
                placeholder="Enter your password"
                control={form.control}
                error={form.formState.errors.password}
                disabled={isAnyLoading}
                required
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((v) => !v)}
              />

              <Button
                type="submit"
                className="w-full h-7 font-semibold"
                disabled={isAnyLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
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

            {/* Sign up link */}
            <div className="text-center text-xs pt-1">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                href="/(auth)/signup"
                className="text-primary hover:underline font-semibold"
              >
                Sign up
              </Link>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
