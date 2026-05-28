"use client";

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
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { loginService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { telegramAuthenticateService } from "@/redux/features/auth/store/thunks/social-auth-thunks";
import { ROUTES } from "@/constants/app-routes/routes";
import { showToast } from "@/components/shared/common/show-toast";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";
import { TelegramLoginButton } from "@/components/shared/telegram/telegram-login-widget";
import { TelegramAuthData } from "@/redux/features/auth/store/models/request/social-auth-request";

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

  useEffect(() => {
    if (authReady && accessToken) {
      router.replace(ROUTES.DASHBOARD.USERS);
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
          userType: "PLATFORM_USER",
        }),
      ).unwrap();
      showToast.success("Welcome back! Redirecting to dashboard...");
      setTimeout(() => {
        router.replace(ROUTES.DASHBOARD.INDEX);
      }, 500);
    } catch (err: unknown) {
      let errorMessage = "Login failed. Please try again.";

      // API wrapper returns error message as plain string
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (typeof err === 'object' && err !== null) {
        const error = err as any;
        // Try different error structures
        if (error.message) {
          errorMessage = error.message;
        } else if (error.payload?.message) {
          errorMessage = error.payload.message;
        } else if (error.payload?.data?.message) {
          errorMessage = error.payload.data.message;
        }
      }

      showToast.error(errorMessage);
    }
  }

  const handleTelegramAuth = async (telegramData: TelegramAuthData) => {
    setIsTelegramLoading(true);
    try {
      await dispatch(
        telegramAuthenticateService({
          telegramData,
          userType: "PLATFORM_USER",
        }),
      ).unwrap();
      showToast.success("Welcome back! Redirecting to dashboard...");
      setTimeout(() => {
        router.replace(ROUTES.DASHBOARD.USERS);
      }, 500);
    } catch (err: unknown) {
      let errorMessage = "Telegram login failed. Please try again.";

      // API wrapper returns error message as plain string
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (typeof err === 'object' && err !== null) {
        const error = err as any;
        // Try different error structures
        if (error.message) {
          errorMessage = error.message;
        } else if (error.payload?.message) {
          errorMessage = error.payload.message;
        } else if (error.payload?.data?.message) {
          errorMessage = error.payload.data.message;
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
          src="/assets/image/cpbank.png"
          alt="Background"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
            Management System
          </p>
          <h2 className="text-3xl font-bold leading-snug">
            Owner Control Panel
          </h2>
          <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
            Secure access to manage businesses, subscriptions, and platform
            operations.
          </p>
        </div>
      </div>

      {/* ── Right — form panel ── */}
      <div className="flex flex-1 items-center justify-center bg-muted/40 p-6">
        <Card className="w-full max-w-lg shadow-2xl border border-border/60 rounded-2xl overflow-hidden">
          {/* Card header */}
          <div className="bg-primary/5 border-b border-border/50 px-8 pt-8 pb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Admin Panel
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {/* Card body */}
          <CardContent className="px-8 py-7 space-y-5">
            {/* Credentials form */}
            <form
              onSubmit={form.handleSubmit(handleLoginSubmit)}
              className="space-y-4"
            >
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
                className="w-full h-10 font-semibold"
                disabled={isAnyLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                <span className="bg-background px-3 text-xs text-muted-foreground">
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
              className="w-full h-10"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
