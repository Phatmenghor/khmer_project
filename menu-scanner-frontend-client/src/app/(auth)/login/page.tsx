"use client";

import { Messages } from "@/constants/messages";
import { useState } from "react";
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

  const { isLoading, dispatch } = useAuthState();
  // Auth-based routing for /login and /admin/* is handled by middleware.ts.

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
      router.replace(ROUTES.ADMIN.DASHBOARD);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.payload?.message ||
        err?.payload ||
        err?.message ||
        (typeof err === "string" ? err : null) ||
        Messages.auth.loginFailed;
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
      router.replace(ROUTES.ADMIN.DASHBOARD);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.payload?.message ||
        err?.payload ||
        err?.message ||
        (typeof err === "string" ? err : null) ||
        Messages.auth.telegramFailed;
      showToast.error(errorMessage);
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const isAnyLoading = isLoading || isTelegramLoading;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-x-hidden">
      {/* Full screen background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={appImages.loginBg}
          alt="Background"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center text-white mb-2">
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg mb-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">eMenu Cambodia</h1>
          <p className="text-xs text-white/70">Admin Control Panel</p>
        </div>

        <Card className="w-full shadow-2xl border border-border/60 rounded overflow-hidden bg-background/95 backdrop-blur-md">
          {/* Card header */}
          <div className="bg-primary/5 border-b border-border/50 px-4 pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-primary flex items-center justify-center shadow-sm shrink-0">
                <ShieldCheck className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Admin Panel
              </span>
            </div>
            <h1 className="text-lg font-bold text-foreground leading-tight mt-1.5">
              Welcome back
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sign in to your account to continue
            </p>
          </div>

          {/* Card body */}
          <CardContent className="px-4 py-4 space-y-3">

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
                className="w-full font-semibold"
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
            <div className="relative py-0.5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-2 text-[10px] text-muted-foreground uppercase tracking-wider">
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
              className="w-full"
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
