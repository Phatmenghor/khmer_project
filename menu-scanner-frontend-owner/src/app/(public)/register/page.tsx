"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
      {/* ── Form panel ── */}
      <div className="flex flex-1 items-start justify-center bg-gradient-to-b from-white to-slate-50 p-6 overflow-y-auto">
        <div className="w-full max-w-3xl py-8">
          {/* Logo */}
          <Link href={ROUTES.PUBLIC.HOME} className="flex items-center gap-2 mb-8">
            <Image
              src="/images/logo/my_logo.png"
              alt="Emenu Cambodia Logo"
              width={80}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <Card className="shadow-2xl border-2 border-primary/20 rounded-2xl overflow-hidden bg-white">
            {/* Card header */}
            <div className="bg-gradient-to-r from-primary/8 via-primary/3 to-primary/5 border-b border-primary/20 px-8 pt-8 pb-6">
              <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-3">
                Start Your Free Trial
              </h1>
              <p className="text-base text-slate-600">
                Get full access to all features completely free for 30 days. No credit card required. Upgrade anytime as your business grows.
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
                  className="w-full h-12 font-bold text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white rounded-xl"
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

                <p className="text-center text-sm text-slate-600">
                  By registering you agree to our{" "}
                  <a href="#" className="text-primary font-medium hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary font-medium hover:underline">Privacy Policy</a>.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
