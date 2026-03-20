"use client";

import { useState } from "react";
import Image from "next/image";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { loginService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { telegramAuthenticateService } from "@/redux/features/auth/store/thunks/social-auth-thunks";
import { ROUTES } from "@/constants/app-routes/routes";
import { showToast } from "@/components/shared/common/show-toast";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { AppDefault } from "@/constants/app-resource/default/default";
import { TelegramLoginModal } from "@/components/shared/telegram/telegram-login-modal";
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

  const { isLoading, error, dispatch } = useAuthState();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIdentifier: "phatmenghor20@gmail.com",
      password: "88889999",
    },
  });

  async function onSubmit(values: FormData) {
    try {
      console.log("🔐 Attempting login...");
      const result = await dispatch(
        loginService({
          userIdentifier: values.userIdentifier,
          password: values.password,
          userType: "BUSINESS_USER",
          businessId: AppDefault.BUSINESS_ID,
        }),
      ).unwrap();

      console.log("✓ Login successful, result:", result);
      showToast.success("Welcome to the emenu dashboard!");

      // Use push for better navigation, with window.location fallback
      setTimeout(() => {
        try {
          router.push(ROUTES.ADMIN.DASHBOARD);
        } catch (navErr) {
          console.error("✗ Push failed, using window.location:", navErr);
          window.location.href = ROUTES.ADMIN.DASHBOARD;
        }
      }, 300);
    } catch (err: any) {
      console.error("✗ Login failed:", err);
      showToast.error(err?.message || error || "Login failed. Please try again.");
    }
  }

  const handleTelegramAuth = async (telegramData: TelegramAuthData) => {
    setIsTelegramLoading(true);
    try {
      console.log("🔐 Attempting Telegram auth...");
      const result = await dispatch(
        telegramAuthenticateService({
          telegramData,
          userType: "BUSINESS_USER",
          businessId: AppDefault.BUSINESS_ID,
        }),
      ).unwrap();

      console.log("✓ Telegram auth successful, result:", result);
      showToast.success(
        result?.isNewUser
          ? "Welcome! Your account has been created successfully."
          : "Welcome back!",
      );

      // Use push for better navigation, with window.location fallback
      setTimeout(() => {
        try {
          router.push(ROUTES.ADMIN.DASHBOARD);
        } catch (navErr) {
          console.error("✗ Push failed, using window.location:", navErr);
          window.location.href = ROUTES.ADMIN.DASHBOARD;
        }
      }, 300);
    } catch (err: any) {
      console.error("✗ Telegram auth failed:", err);
      showToast.error(err?.message || err || "Telegram login failed. Please try again.");
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const isAnyLoading = isLoading || isTelegramLoading;

  return (
    <div className="flex h-screen w-full">
      {/* Left side — decorative image (desktop only) */}
      <div className="hidden flex-1 relative lg:block">
        <Image
          src={appImages.CpBank}
          alt="CPBank Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right side — login form */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md border border-gray-200 shadow-2xl">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Admin Panel Login
            </h1>
            <p className="text-sm text-gray-600">
              Enter your credentials to continue
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                className="w-full h-11 mt-2 font-semibold"
                disabled={isAnyLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <TelegramLoginModal
              onAuth={handleTelegramAuth}
              disabled={isAnyLoading}
              loading={isTelegramLoading}
              className="w-full h-11"
            />

            <p className="text-center text-xs text-gray-500 mt-5">
              By signing in, you agree to our{" "}
              <a
                href="#"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Privacy Policy
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
