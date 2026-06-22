"use client";

import { Messages } from "@/constants/messages";
import { useState, useEffect } from "react";
import Image from "next/image";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, ShieldCheck } from "lucide-react";
import { axiosClient } from "@/utils/axios";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/shared/common/show-toast";
import { appImages } from "@/constants/app-resource/icons/app-images";
import Link from "next/link";

const formSchema = z.object({
  ownerUserIdentifier: z.string().min(3, "Username must be at least 3 characters"),
  ownerFullName: z.string().min(2, "Full name is required"),
  ownerEmail: z.string().email("Invalid email format"),
  ownerPassword: z.string().min(6, "Password must be at least 6 characters"),
  businessName: z.string().min(2, "Business name is required"),
  businessEmail: z.string().email("Invalid email format"),
  planId: z.string().min(1, "Please select a plan"),
  enableStockManagement: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerUserIdentifier: "",
      ownerFullName: "",
      ownerEmail: "",
      ownerPassword: "",
      businessName: "",
      businessEmail: "",
      planId: "",
      enableStockManagement: false,
    },
  });

  async function handleSignupSubmit(values: FormData) {
    setIsLoading(true);
    try {
      await axiosClient.post("/api/v1/public/register-business-owner", {
        ownerUserIdentifier: values.ownerUserIdentifier,
        ownerFullName: values.ownerFullName,
        ownerEmail: values.ownerEmail,
        ownerPassword: values.ownerPassword,
        businessName: values.businessName,
        businessEmail: values.businessEmail,
        planId: values.planId,
        enableStockManagement: values.enableStockManagement,
      });

      showToast.success("Registration successful! You can now login.");
      setTimeout(() => {
        router.push("/(auth)/login");
      }, 1000);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Registration failed";
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

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

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-4">
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
          <div className="bg-primary/5 border-b border-border/50 px-5 pt-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Admin Panel
              </span>
            </div>
            <h1 className="text-xs font-bold text-foreground leading-tight">
              Create your account
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Register your business and get started
            </p>
          </div>

          {/* Card body */}
          <CardContent className="px-5 py-5 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">

            {/* Registration form */}
            <form onSubmit={form.handleSubmit(handleSignupSubmit)} className="space-y-3">
              <TextField
                name="ownerUserIdentifier"
                label="Username"
                placeholder="johndoe"
                control={form.control}
                error={form.formState.errors.ownerUserIdentifier}
                disabled={isLoading}
                required
              />

              <TextField
                name="ownerFullName"
                label="Full Name"
                placeholder="John Doe"
                control={form.control}
                error={form.formState.errors.ownerFullName}
                disabled={isLoading}
                required
              />

              <TextField
                name="ownerEmail"
                label="Email"
                placeholder="john@example.com"
                type="email"
                control={form.control}
                error={form.formState.errors.ownerEmail}
                disabled={isLoading}
                required
              />

              <PasswordField
                name="ownerPassword"
                label="Password"
                placeholder="Enter your password"
                control={form.control}
                error={form.formState.errors.ownerPassword}
                disabled={isLoading}
                required
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((v) => !v)}
              />

              <TextField
                name="businessName"
                label="Business Name"
                placeholder="Your Restaurant"
                control={form.control}
                error={form.formState.errors.businessName}
                disabled={isLoading}
                required
              />

              <TextField
                name="businessEmail"
                label="Business Email"
                placeholder="business@example.com"
                type="email"
                control={form.control}
                error={form.formState.errors.businessEmail}
                disabled={isLoading}
                required
              />

              <div className="space-y-1">
                <label className="text-xs font-medium">Enable Stock Management</label>
                <div className="flex items-center gap-2 p-2 border rounded bg-muted/30">
                  <Switch
                    name="enableStockManagement"
                    checked={form.watch("enableStockManagement")}
                    onCheckedChange={(checked) => form.setValue("enableStockManagement", checked)}
                    disabled={isLoading}
                  />
                  <span className="text-xs text-muted-foreground">
                    {form.watch("enableStockManagement") ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <SelectField
                name="planId"
                label="Select Plan"
                control={form.control}
                error={form.formState.errors.planId}
                disabled={isLoading}
                options={[
                  { value: "", label: "Choose a plan..." },
                  { value: "basic", label: "Basic Plan" },
                  { value: "pro", label: "Pro Plan" },
                  { value: "enterprise", label: "Enterprise Plan" },
                ]}
              />

              <Button
                type="submit"
                className="w-full h-7 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Sign in link */}
            <div className="text-center text-xs">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                href="/(auth)/login"
                className="text-primary hover:underline font-semibold"
              >
                Sign in
              </Link>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
