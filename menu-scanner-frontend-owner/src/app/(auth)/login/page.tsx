"use client";

import { useState, useEffect } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, ShieldCheck } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Card, CardContent } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { SmartImage } from "@/components/shared/image/smart-image";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { loginService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { telegramAuthenticateService } from "@/redux/features/auth/store/thunks/social-auth-thunks";
import { ROUTES } from "@/constants/app-routes/routes";
import { showToast } from "@/components/shared/common/show-toast";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";
import { TelegramLoginButton } from "@/components/shared/telegram/telegram-login-widget";
import { TelegramAuthData } from "@/redux/features/auth/store/models/request/social-auth-request";
import { appImages } from "@/constants/app-resource/icons/app-images";

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
      router.replace(ROUTES.DASHBOARD.INDEX);
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
      router.replace(ROUTES.DASHBOARD.INDEX);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.payload?.message ||
        err?.payload ||
        err?.message ||
        (typeof err === "string" ? err : null) ||
        "Login failed. Please try again.";
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
      router.replace(ROUTES.DASHBOARD.INDEX);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.payload?.message ||
        err?.payload ||
        err?.message ||
        (typeof err === "string" ? err : null) ||
        "Telegram login failed. Please try again.";
      showToast.error(errorMessage);
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const isAnyLoading = isLoading || isTelegramLoading;

  return (
    <div className="relative min-h-screen w-full flex overflow-x-hidden">
      {/* Background image: full-screen on small screens, left 50% panel on lg+ */}
      <div className="absolute inset-0 lg:relative lg:inset-auto lg:w-1/2 lg:h-screen">
        <SmartImage
          src={appImages.loginBg}
          alt="Background"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
        {/* Dark overlay for readability on mobile */}
        <div className="absolute inset-0 bg-black/50 lg:hidden" />
      </div>

      {/* Form panel: overlays image on small screens, plain right-hand panel on lg+ */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center p-4 lg:w-1/2 lg:bg-background">
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4">
          <Card className="w-full shadow-2xl border border-border/70 rounded-3xl overflow-hidden bg-background/95 dark:bg-card/95 backdrop-blur-xl transition-all duration-300">
            {/* Card header */}
            <div className="bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-b border-border/50 px-6 pt-6 pb-4 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-xl bg-primary flex items-center justify-center shadow-xs shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  Owner Admin Panel
                </span>
              </div>
              <h1 className="text-xl font-black text-foreground leading-tight mt-2 tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Sign in to your account to continue
              </p>
            </div>

            {/* Card body */}
            <CardContent className="px-6 py-5 space-y-4">
              {/* Credentials form */}
              <form
                onSubmit={form.handleSubmit(handleLoginSubmit)}
                className="space-y-3.5"
              >
                <TextField
                  name="userIdentifier"
                  label="Email or Username"
                  placeholder="name@example.com"
                  control={form.control}
                  error={form.formState.errors.userIdentifier}
                  disabled={isAnyLoading}
                  required
                  inputClassName="h-9 text-xs rounded-xl"
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
                  inputClassName="h-9 text-xs rounded-xl"
                />

                <CustomButton
                  type="submit"
                  className="w-full h-9 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
                  disabled={isAnyLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </CustomButton>
              </form>

              {/* Divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/70" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
