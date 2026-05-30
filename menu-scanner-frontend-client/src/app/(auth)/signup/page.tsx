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
    },
  });

  async function handleSignupSubmit(values: FormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/public/register-business-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerUserIdentifier: values.ownerUserIdentifier,
          ownerFullName: values.ownerFullName,
          ownerEmail: values.ownerEmail,
          ownerPassword: values.ownerPassword,
          businessName: values.businessName,
          businessEmail: values.businessEmail,
          planId: null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.message || "Registration failed");
      }

      showToast.success("Registration successful! You can now login.");
      setTimeout(() => {
        router.push("/(auth)/login");
      }, 1000);
    } catch (err: any) {
      const errorMessage = err?.message || "Registration failed";
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

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
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
            Management System
          </p>
          <h2 className="text-3xl font-bold leading-snug">Admin Control Panel</h2>
          <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
            Secure access to manage your business operations and team.
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
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Register your business and get started
            </p>
          </div>

          {/* Card body */}
          <CardContent className="px-8 py-7 space-y-5">

            {/* Registration form */}
            <form onSubmit={form.handleSubmit(handleSignupSubmit)} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full h-10 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Sign in link */}
            <div className="text-center text-sm">
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
