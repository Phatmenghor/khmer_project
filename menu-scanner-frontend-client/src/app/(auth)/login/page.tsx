"use client";

import { Messages } from "@/constants/messages";
import { useState } from "react";
import Image from "next/image";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { loginService } from "@/features/auth/store/thunks/auth-thunks";
import { telegramAuthenticateService } from "@/features/auth/store/thunks/social-auth-thunks";
import { ROUTES } from "@/constants/app-routes/routes";
import { showToast } from "@/components/shared/common/show-toast";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { AppDefault } from "@/constants/app-resource/default/default";
import { TelegramLoginButton, TelegramIcon } from "@/components/shared/telegram/telegram-login-widget";
import { TelegramAuthData } from "@/features/auth/store/models/request/social-auth-request";
import { UserGropeType } from "@/constants/status/status";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";

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
    } catch (err: unknown) {
      showToast.error((err as { message?: string })?.message || Messages.auth.loginFailed);
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
    } catch (err: unknown) {
      showToast.error((err as { message?: string })?.message || Messages.auth.telegramFailed);
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const isAnyLoading = isLoading || isTelegramLoading;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* ── Left hero panel ── */}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        {/* bottom-left branding */}
        <div className="absolute bottom-10 left-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
            Management System
          </p>
          <h2 className="text-3xl font-bold leading-snug">Admin Control Panel</h2>
          <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
            Secure access to manage your business operations and team.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm space-y-8">

          {/* Icon + heading */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                Admin Panel
              </p>
              <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to your account to continue
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(handleLoginSubmit)} className="space-y-4">
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
              className="w-full h-11 font-semibold mt-2"
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
          <div className="space-y-2">
            <TelegramLoginButton
              botName={SocialAuthConfig.TELEGRAM_BOT_NAME}
              botId={SocialAuthConfig.TELEGRAM_BOT_ID}
              onAuth={handleTelegramAuth}
              disabled={isAnyLoading}
              loading={isTelegramLoading}
              className="w-full h-11"
            >
              <TelegramIcon className="h-4 w-4" />
              Continue with Telegram
            </TelegramLoginButton>
            <p className="text-center text-xs text-muted-foreground">
              Telegram must be synced from your profile settings first
            </p>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
