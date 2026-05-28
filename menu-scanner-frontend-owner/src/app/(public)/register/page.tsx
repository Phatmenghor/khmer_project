"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  QrCode,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Building2,
  BarChart3,
  Users,
  ArrowRight,
} from "lucide-react";

// ─── Zod schema ────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters"),
    ownerName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .min(8, "Phone number must be at least 8 digits")
      .regex(/^[\d\s\+\-\(\)]+$/, "Please enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    plan: z.enum(["starter", "professional", "enterprise"]),
    agreeToTerms: z.boolean().refine((v) => v === true, {
      message: "You must agree to the Terms of Service",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Plan options ───────────────────────────────────────────────────────────────
const planOptions = [
  {
    id: "starter" as const,
    name: "Starter",
    price: "$29/mo",
    description: "1 location, 50 items",
  },
  {
    id: "professional" as const,
    name: "Professional",
    price: "$79/mo",
    description: "5 locations, unlimited items",
    popular: true,
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    price: "Custom",
    description: "Unlimited locations",
  },
];

// ─── Left-side benefits ─────────────────────────────────────────────────────────
const benefits = [
  "Full access to all Professional features",
  "No credit card required",
  "Cancel anytime, no questions asked",
  "Free onboarding support included",
];

// ─── Main component ─────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      plan: "professional",
      agreeToTerms: false,
    },
  });

  const selectedPlan = watch("plan");
  const agreeToTerms = watch("agreeToTerms");

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    console.log("Registration data:", data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    // Redirect after brief success display
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
            Account Created!
          </h2>
          <p className="text-gray-500 mb-6">
            Welcome to eMenu. Redirecting you to sign in...
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-5 h-5 text-[#A23469] animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (brand / benefits) ── */}
      <aside className="hidden lg:flex lg:w-2/5 bg-[#1a1a2e] flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        {/* Background decor */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#A23469]/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[#A23469]/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* Top: logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[#A23469] flex items-center justify-center shadow-lg">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              eMenu
            </span>
          </Link>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-5">
            Start your free
            <br />
            <span className="bg-gradient-to-r from-[#A23469] to-[#D56B9E] bg-clip-text text-transparent">
              14-day trial
            </span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-10">
            Join 500+ restaurants already using eMenu to boost sales and
            delight their guests.
          </p>

          {/* Benefits */}
          <ul className="space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#A23469]/20 border border-[#A23469]/40 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A23469]" />
                </div>
                <span className="text-sm text-gray-300">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: stats mockup */}
        <div className="relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">
              Dashboard Preview
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: Building2, label: "Locations", value: "3" },
                { icon: BarChart3, label: "Revenue", value: "$4.2k" },
                { icon: Users, label: "Staff", value: "12" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="bg-white/5 rounded-xl p-3 text-center"
                >
                  <Icon className="w-4 h-4 text-[#A23469] mx-auto mb-1" />
                  <div className="text-white font-bold text-base">{value}</div>
                  <div className="text-gray-500 text-xs">{label}</div>
                </div>
              ))}
            </div>
            {/* Mini bar chart */}
            <div className="space-y-2">
              {[
                { label: "Mon", w: "65%" },
                { label: "Tue", w: "80%" },
                { label: "Wed", w: "55%" },
                { label: "Thu", w: "90%" },
              ].map(({ label, w }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-6">{label}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#A23469] to-[#D56B9E]"
                      style={{ width: w }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6">{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right panel (form) ── */}
      <main className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-gray-100">
          {/* Mobile logo */}
          <Link
            href="/"
            className="flex items-center gap-2 lg:hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-[#A23469] flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#A23469]">eMenu</span>
          </Link>
          <div className="hidden lg:block" />
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#A23469] font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Form area */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-10">
          <div className="max-w-xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-500 text-sm">
                Get started in minutes. Free for 14 days.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {/* Business Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Business Name <span className="text-[#A23469]">*</span>
                </label>
                <input
                  {...register("businessName")}
                  type="text"
                  placeholder="The Green Table Restaurant"
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-[#A23469]/20 focus:border-[#A23469] ${
                    errors.businessName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />
                {errors.businessName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.businessName.message}
                  </p>
                )}
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Owner Full Name <span className="text-[#A23469]">*</span>
                </label>
                <input
                  {...register("ownerName")}
                  type="text"
                  placeholder="Sokha Nhem"
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-[#A23469]/20 focus:border-[#A23469] ${
                    errors.ownerName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />
                {errors.ownerName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.ownerName.message}
                  </p>
                )}
              </div>

              {/* Email + Phone (2 cols on sm+) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address <span className="text-[#A23469]">*</span>
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@restaurant.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-[#A23469]/20 focus:border-[#A23469] ${
                      errors.email
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number <span className="text-[#A23469]">*</span>
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="+855 12 345 678"
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-[#A23469]/20 focus:border-[#A23469] ${
                      errors.phone
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password <span className="text-[#A23469]">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm text-gray-900 placeholder-gray-400 bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-[#A23469]/20 focus:border-[#A23469] ${
                      errors.password
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm Password <span className="text-[#A23469]">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm text-gray-900 placeholder-gray-400 bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-[#A23469]/20 focus:border-[#A23469] ${
                      errors.confirmPassword
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Plan selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Your Plan
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {planOptions.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setValue("plan", plan.id)}
                        className={`relative flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-[#A23469] bg-[#FDF2F7] shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#A23469] text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                            Popular
                          </span>
                        )}
                        <span
                          className={`text-sm font-bold mb-0.5 ${
                            isSelected ? "text-[#A23469]" : "text-gray-800"
                          }`}
                        >
                          {plan.name}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? "text-[#A23469]" : "text-gray-500"
                          }`}
                        >
                          {plan.price}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                          {plan.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Terms checkbox */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      {...register("agreeToTerms")}
                      type="checkbox"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 pointer-events-none ${
                        agreeToTerms
                          ? "bg-[#A23469] border-[#A23469]"
                          : errors.agreeToTerms
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300 bg-white group-hover:border-[#A23469]/50"
                      }`}
                    >
                      {agreeToTerms && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 leading-snug">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-[#A23469] font-medium hover:underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-[#A23469] font-medium hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1.5 text-xs text-red-500 pl-8">
                    {errors.agreeToTerms.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#A23469] text-white font-bold text-base hover:bg-[#802A54] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* OR divider */}
              <div className="flex items-center gap-4 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Telegram option */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 text-[#229ED9]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 1 0 24 12 12 12 0 0 0 11.944 0ZM9.5 17.5l-1-4.5L17 7.5l-5 8.5-2.5-1.5Z" />
                </svg>
                Continue with Telegram
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-8 pb-8">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-[#A23469] hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#A23469] hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
