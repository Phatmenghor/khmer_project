"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, QrCode, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { showToast } from "@/components/shared/common/show-toast";
import { ROUTES } from "@/constants/app-routes/routes";
import { axiosClient } from "@/utils/axios";

const schema = z
  .object({
    ownerFullName: z.string().min(1, "Full name is required"),
    ownerUserIdentifier: z.string().min(3, "Username must be at least 3 characters"),
    ownerEmail: z.string().email("Invalid email address"),
    ownerPhone: z.string().min(6, "Phone number is required"),
    ownerPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    businessName: z.string().min(1, "Business name is required"),
    businessEmail: z.string().email("Invalid business email"),
    businessPhone: z.string().min(6, "Business phone is required"),
    businessAddress: z.string().min(1, "Business address is required"),
  })
  .refine((d) => d.ownerPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const benefits = [
  "Full access to all Professional features",
  "No credit card required",
  "14-day free trial included",
  "Free onboarding support",
  "Cancel anytime",
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ownerFullName: "",
      ownerUserIdentifier: "",
      ownerEmail: "",
      ownerPhone: "",
      ownerPassword: "",
      confirmPassword: "",
      businessName: "",
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      await axiosClient.post("/api/v1/business-owners/register", {
        ownerFullName: values.ownerFullName,
        ownerUserIdentifier: values.ownerUserIdentifier,
        ownerEmail: values.ownerEmail,
        ownerPhone: values.ownerPhone,
        ownerPassword: values.ownerPassword,
        businessName: values.businessName,
        businessEmail: values.businessEmail,
        businessPhone: values.businessPhone,
        businessAddress: values.businessAddress,
      });
      showToast.success("Account created! Please sign in to continue.");
      router.push(ROUTES.AUTH.LOGIN);
    } catch (err: unknown) {
      showToast.error(
        (err as { message?: string })?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* ── Left — brand panel ── */}
      <div className="hidden lg:flex w-[42%] flex-col bg-foreground px-10 py-12 text-background">
        {/* Logo */}
        <Link href={ROUTES.PUBLIC.HOME} className="flex items-center gap-2.5 mb-16">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <QrCode className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-background tracking-tight">eMenu</span>
        </Link>

        {/* Heading */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-background leading-snug mb-3">
            Start your free 14-day trial
          </h2>
          <p className="text-sm text-background/60 mb-8 max-w-xs leading-relaxed">
            Join 500+ restaurants in Cambodia using eMenu to digitize their menus and grow faster.
          </p>

          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-background/80">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>

          {/* Decorative stats */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { value: "500+", label: "Restaurants" },
              { value: "1M+", label: "Orders served" },
              { value: "50+", label: "Cities" },
              { value: "99.9%", label: "Uptime" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-background/5 rounded-lg p-4 border border-background/10">
                <div className="text-xl font-bold text-primary">{value}</div>
                <div className="text-xs text-background/50">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-background/30 mt-8">
          © {new Date().getFullYear()} eMenu. All rights reserved.
        </p>
      </div>

      {/* ── Right — form panel ── */}
      <div className="flex flex-1 items-start justify-center bg-muted/40 p-6 overflow-y-auto">
        <div className="w-full max-w-2xl py-8">
          {/* Mobile logo */}
          <Link href={ROUTES.PUBLIC.HOME} className="flex lg:hidden items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <QrCode className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">eMenu</span>
          </Link>

          <div className="text-right text-sm text-muted-foreground mb-6">
            Already have an account?{" "}
            <Link href={ROUTES.AUTH.LOGIN} className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </div>

          <Card className="shadow-2xl border border-border/60 rounded-2xl overflow-hidden">
            {/* Card header */}
            <div className="bg-primary/5 border-b border-border/50 px-8 pt-8 pb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  New Account
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                Register Your Business
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Set up your restaurant account and start your free trial.
              </p>
            </div>

            <CardContent className="px-8 py-7">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Owner section */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
                    Owner Information
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField
                      name="ownerFullName"
                      label="Full Name"
                      placeholder="Sokha Nhem"
                      control={control}
                      error={errors.ownerFullName}
                      disabled={isSubmitting}
                      required
                    />
                    <TextField
                      name="ownerUserIdentifier"
                      label="Username"
                      placeholder="sokha.nhem"
                      control={control}
                      error={errors.ownerUserIdentifier}
                      disabled={isSubmitting}
                      required
                    />
                    <TextField
                      name="ownerEmail"
                      label="Email Address"
                      type="email"
                      placeholder="owner@example.com"
                      control={control}
                      error={errors.ownerEmail}
                      disabled={isSubmitting}
                      required
                    />
                    <TextField
                      name="ownerPhone"
                      label="Phone Number"
                      type="tel"
                      placeholder="+855 12 345 678"
                      control={control}
                      error={errors.ownerPhone}
                      disabled={isSubmitting}
                      required
                    />
                    <PasswordField
                      name="ownerPassword"
                      label="Password"
                      placeholder="Min. 6 characters"
                      control={control}
                      error={errors.ownerPassword}
                      disabled={isSubmitting}
                      required
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword((v) => !v)}
                    />
                    <PasswordField
                      name="confirmPassword"
                      label="Confirm Password"
                      placeholder="Re-enter password"
                      control={control}
                      error={errors.confirmPassword}
                      disabled={isSubmitting}
                      required
                      showPassword={showConfirm}
                      onTogglePassword={() => setShowConfirm((v) => !v)}
                    />
                  </div>
                </div>

                {/* Business section */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
                    Business Information
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField
                      name="businessName"
                      label="Business Name"
                      placeholder="The Green Table"
                      control={control}
                      error={errors.businessName}
                      disabled={isSubmitting}
                      required
                    />
                    <TextField
                      name="businessEmail"
                      label="Business Email"
                      type="email"
                      placeholder="info@greentable.com"
                      control={control}
                      error={errors.businessEmail}
                      disabled={isSubmitting}
                      required
                    />
                    <TextField
                      name="businessPhone"
                      label="Business Phone"
                      type="tel"
                      placeholder="+855 23 456 789"
                      control={control}
                      error={errors.businessPhone}
                      disabled={isSubmitting}
                      required
                    />
                    <TextField
                      name="businessAddress"
                      label="Business Address"
                      placeholder="Street 278, Phnom Penh"
                      control={control}
                      error={errors.businessAddress}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-semibold text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account & Start Free Trial"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By registering you agree to our{" "}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
