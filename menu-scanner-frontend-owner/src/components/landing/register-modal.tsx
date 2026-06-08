"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, Building2, User, Mail, Phone, CreditCard, LogIn, Globe, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { showToast } from "@/components/shared/common/show-toast";
import { axiosClient } from "@/utils/axios";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

const schema = z
  .object({
    ownerFullName: z.string().min(1, "Full name is required"),
    userIdentifier: z.string().min(3, "Username must be at least 3 characters"),
    ownerEmail: z.string().email("Invalid email address"),
    ownerPhone: z.string().min(6, "Phone number is required"),
    ownerPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    businessName: z.string().min(1, "Business name is required"),
    subdomain: z
      .string()
      .min(3, "Subdomain must be at least 3 characters")
      .max(50, "Subdomain must be 50 characters or less")
      .regex(subdomainRegex, "Only lowercase letters, numbers, hyphens (not at start/end)")
      .or(z.literal("")),
    businessEmail: z.string().email("Invalid business email"),
    businessPhone: z.string().min(6, "Business phone is required"),
    businessAddress: z.string().min(1, "Business address is required"),
    enableStockManagement: z.boolean().default(false),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  })
  .refine((d) => d.ownerPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

interface PlanData {
  id?: string;
  name: string;
  price: string;
  period: string;
  description: string;
}

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: PlanData;
}

function SectionHeading({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
        {step}
      </span>
      <div className="min-w-0">
        <h3 className="text-xs font-semibold text-foreground leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground leading-snug">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface SuccessInfo {
  ownerFullName: string;
  ownerEmail: string;
  ownerPhone: string;
  businessName: string;
  subdomain?: string;
  plan?: PlanData;
}

function RegistrationSuccessModal({
  isOpen,
  onClose,
  info,
}: {
  isOpen: boolean;
  onClose: () => void;
  info: SuccessInfo | null;
}) {
  if (!info) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b bg-primary/5">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Registration Successful!</h2>
            <p className="text-xs text-muted-foreground">Your account is ready — sign in to get started</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Welcome to <span className="font-semibold text-foreground">Emenu Cambodia</span>! Your business account has been created. Here&apos;s a summary of your registration:
          </p>

          {/* Details */}
          <div className="rounded-lg border bg-muted/30 divide-y text-xs">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-24 flex-shrink-0">Owner Name</span>
              <span className="font-medium text-foreground truncate">{info.ownerFullName}</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-24 flex-shrink-0">Email</span>
              <span className="font-medium text-foreground truncate">{info.ownerEmail}</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-24 flex-shrink-0">Phone</span>
              <span className="font-medium text-foreground truncate">{info.ownerPhone}</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-24 flex-shrink-0">Business</span>
              <span className="font-medium text-foreground truncate">{info.businessName}</span>
            </div>
            {info.subdomain && (
              <div className="flex items-center gap-3 px-3 py-2.5">
                <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground w-24 flex-shrink-0">Subdomain</span>
                <span className="font-medium text-foreground truncate">{info.subdomain}.emenu-cambodia.com</span>
              </div>
            )}
            {info.plan && (
              <div className="flex items-center gap-3 px-3 py-2.5">
                <CreditCard className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground w-24 flex-shrink-0">Plan</span>
                <span className="font-medium text-foreground truncate">
                  {info.plan.name}
                  <span className="text-muted-foreground font-normal ml-1">· {info.plan.price} {info.plan.period}</span>
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Use your <span className="font-medium text-foreground">username</span> and <span className="font-medium text-foreground">password</span> to sign in to the owner dashboard.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t bg-muted/20">
          <p className="text-[11px] text-muted-foreground">You can sign in at any time</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="h-8 text-xs px-4">
              Close
            </Button>
            <Button
              onClick={onClose}
              className="h-8 text-xs px-4 bg-primary hover:bg-primary/90 gap-1.5"
            >
              <LogIn className="w-3 h-3" />
              Sign In Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type SubdomainStatus = "idle" | "checking" | "available" | "taken";

export function RegisterModal({ isOpen, onClose, plan }: RegisterModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState<SubdomainStatus>("idle");
  const subdomainTouchedRef = useRef(false);
  const subdomainDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ownerFullName: "",
      userIdentifier: "",
      ownerEmail: "",
      ownerPhone: "",
      ownerPassword: "",
      confirmPassword: "",
      businessName: "",
      subdomain: "",
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      enableStockManagement: false,
      primaryColor: "#A32D62",
    },
    mode: "onChange",
  });

  const businessNameValue = watch("businessName");
  const subdomainValue = watch("subdomain");

  useEffect(() => {
    // Auto-fill subdomain from business name unless user has manually edited it
    if (businessNameValue && !subdomainTouchedRef.current) {
      const slug = slugify(businessNameValue);
      setValue("subdomain", slug, { shouldValidate: false, shouldDirty: false });
    }
  }, [businessNameValue, setValue]);

  // Track if user manually edited subdomain (differs from auto-generated)
  useEffect(() => {
    if (businessNameValue && subdomainValue !== undefined) {
      const autoSlug = slugify(businessNameValue);
      if (subdomainValue !== autoSlug && subdomainValue !== "") {
        subdomainTouchedRef.current = true;
      }
    }
  }, [subdomainValue, businessNameValue]);

  // Debounced subdomain availability check
  useEffect(() => {
    if (subdomainDebounceRef.current) clearTimeout(subdomainDebounceRef.current);

    const val = subdomainValue ?? "";
    if (!val || val.length < 3 || !subdomainRegex.test(val)) {
      setSubdomainStatus("idle");
      return;
    }

    setSubdomainStatus("checking");
    subdomainDebounceRef.current = setTimeout(async () => {
      try {
        const res = await axiosClient.get<{ data: boolean }>(
          `/api/v1/public/businesses/check-subdomain?subdomain=${encodeURIComponent(val)}`
        );
        setSubdomainStatus(res.data.data ? "available" : "taken");
      } catch {
        setSubdomainStatus("idle");
      }
    }, 500);

    return () => {
      if (subdomainDebounceRef.current) clearTimeout(subdomainDebounceRef.current);
    };
  }, [subdomainValue]);

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const payload: any = {
        ownerFullName: values.ownerFullName,
        ownerUserIdentifier: values.userIdentifier,
        ownerEmail: values.ownerEmail,
        ownerPhone: values.ownerPhone,
        ownerPassword: values.ownerPassword,
        businessName: values.businessName,
        businessEmail: values.businessEmail,
        businessPhone: values.businessPhone,
        businessAddress: values.businessAddress,
        enableStockManagement: values.enableStockManagement,
        primaryColor: values.primaryColor,
      };

      if (values.subdomain) payload.subdomain = values.subdomain;
      if (plan?.id) payload.planId = plan.id;

      await axiosClient.post("/api/v1/business-owners/register", payload);
      setSuccessInfo({
        ownerFullName: values.ownerFullName,
        ownerEmail: values.ownerEmail,
        ownerPhone: values.ownerPhone,
        businessName: values.businessName,
        subdomain: values.subdomain || slugify(values.businessName),
        plan,
      });
      reset();
      onClose();
      setShowSuccess(true);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed. Please try again.";
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      reset();
      setSubdomainStatus("idle");
      subdomainTouchedRef.current = false;
    }
  };

  return (
    <>
    <RegistrationSuccessModal
      isOpen={showSuccess}
      onClose={() => setShowSuccess(false)}
      info={successInfo}
    />
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="w-screen sm:w-full sm:max-w-3xl max-h-[100dvh] sm:max-h-[92dvh] h-[100dvh] sm:h-auto p-0 gap-0 flex flex-col overflow-hidden rounded-none sm:rounded"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden h-1 bg-slate-300 rounded-full w-8 mx-auto mt-2" />

        {/* Header */}
        <FormHeader
          title="Create Your Account"
          description="Register your business — every plan unlocks every feature."
        />

        {/* Selected plan strip (only when arriving from pricing) */}
        {plan && (
          <div className="px-3 py-2 border-b bg-primary/5 flex-shrink-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {plan.name}
              <span className="text-muted-foreground font-normal ml-1">
                · {plan.price} {plan.period}
              </span>
            </p>
            {plan.description && (
              <p className="text-[11px] text-muted-foreground truncate">{plan.description}</p>
            )}
          </div>
        )}

        {/* Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <FormBody contentClassName="px-3 py-3 space-y-5">
            {/* Step 1 — Account credentials */}
            <section>
              <SectionHeading
                step={1}
                title="Account Credentials"
                subtitle="Your sign-in details and personal contact info"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  name="userIdentifier"
                  label="Username"
                  placeholder="Enter username"
                  control={control}
                  error={errors.userIdentifier}
                  disabled={isSubmitting}
                  required
                />
                <TextField
                  name="ownerEmail"
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  control={control}
                  error={errors.ownerEmail}
                  disabled={isSubmitting}
                  required
                />
                <PasswordField
                  name="ownerPassword"
                  label="Password"
                  placeholder="Enter password"
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
                  placeholder="Confirm password"
                  control={control}
                  error={errors.confirmPassword}
                  disabled={isSubmitting}
                  required
                  showPassword={showConfirm}
                  onTogglePassword={() => setShowConfirm((v) => !v)}
                />
                <TextField
                  name="ownerFullName"
                  label="Full Name"
                  placeholder="Enter full name"
                  control={control}
                  error={errors.ownerFullName}
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
              </div>
            </section>

            {/* Step 2 — Business information */}
            <section>
              <SectionHeading
                step={2}
                title="Business Information"
                subtitle="How your business appears to customers"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  name="businessName"
                  label="Business Name"
                  placeholder="e.g. Mega Store"
                  control={control}
                  error={errors.businessName}
                  disabled={isSubmitting}
                  required
                />
                <div className="flex flex-col gap-1 w-full">
                  <div className="relative">
                    <TextField
                      name="subdomain"
                      label="Subdomain"
                      placeholder="e.g. mega-store"
                      control={control}
                      error={errors.subdomain}
                      disabled={isSubmitting}
                    />
                    {/* availability badge — positioned top-right of label row */}
                    {subdomainStatus !== "idle" && (
                      <span className={`absolute right-0 top-0 flex items-center gap-1 text-[10px] font-medium ${
                        subdomainStatus === "checking" ? "text-muted-foreground" :
                        subdomainStatus === "available" ? "text-emerald-600" : "text-rose-500"
                      }`}>
                        {subdomainStatus === "checking" && (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        )}
                        {subdomainStatus === "available" && (
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        )}
                        {subdomainStatus === "taken" && (
                          <XCircle className="w-2.5 h-2.5" />
                        )}
                        {subdomainStatus === "checking" ? "Checking..." :
                         subdomainStatus === "available" ? "Available" : "Already taken"}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Your menu URL:{" "}
                    <span className="font-medium text-foreground">
                      {watch("subdomain") || "your-business"}.emenu-cambodia.com
                    </span>
                  </p>
                </div>
                <TextField
                  name="businessEmail"
                  label="Business Email"
                  type="email"
                  placeholder="contact@business.com"
                  control={control}
                  error={errors.businessEmail}
                  disabled={isSubmitting}
                  required
                />
                <TextField
                  name="businessPhone"
                  label="Business Phone"
                  type="tel"
                  placeholder="+855 12 345 678"
                  control={control}
                  error={errors.businessPhone}
                  disabled={isSubmitting}
                  required
                />
                <TextField
                  name="businessAddress"
                  label="Business Address"
                  placeholder="Street, City, Country"
                  control={control}
                  error={errors.businessAddress}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </section>

            {/* Step 3 — Settings */}
            <section>
              <SectionHeading
                step={3}
                title="Settings"
                subtitle="Branding and inventory preferences (you can change these later)"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 w-full">
                  <Label className="text-xs font-medium text-foreground">
                    Stock Management
                  </Label>
                  <div className="flex items-center gap-2 h-[26px] px-2 border border-input rounded bg-muted/30">
                    <Switch
                      checked={watch("enableStockManagement")}
                      onCheckedChange={(checked) =>
                        setValue("enableStockManagement", checked, {
                          shouldDirty: true,
                        })
                      }
                      disabled={isSubmitting}
                    />
                    <span className="text-xs text-muted-foreground">
                      {watch("enableStockManagement")
                        ? "Track stock levels"
                        : "Skip stock tracking"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <Label className="text-xs font-medium text-foreground">
                    Primary Color
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={watch("primaryColor")}
                      onChange={(e) =>
                        setValue("primaryColor", e.target.value, {
                          shouldDirty: true,
                        })
                      }
                      disabled={isSubmitting}
                      className="w-12 h-[26px] cursor-pointer rounded border border-input"
                    />
                    <input
                      placeholder="#RRGGBB"
                      value={watch("primaryColor")}
                      onChange={(e) =>
                        setValue("primaryColor", e.target.value, {
                          shouldDirty: true,
                        })
                      }
                      disabled={isSubmitting}
                      className={`flex h-[26px] flex-1 rounded border bg-transparent px-2 py-0.5 text-xs shadow-sm transition-all focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 ${
                        errors.primaryColor
                          ? "border-red-500"
                          : "border-input"
                      }`}
                    />
                  </div>
                  <p
                    className={`text-[11px] text-red-500 ${
                      errors.primaryColor?.message ? "min-h-[14px]" : ""
                    }`}
                  >
                    {errors.primaryColor?.message || ""}
                  </p>
                </div>
              </div>
            </section>
          </FormBody>

          {/* Footer — admin FormFooter style */}
          <div className="flex flex-col gap-1.5 px-2.5 py-2 border-t bg-muted/30 flex-shrink-0 sm:flex-row sm:items-center sm:justify-between sm:px-3">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 order-2 sm:order-1">
              {isSubmitting && (
                <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
              )}
              {isDirty && !isSubmitting && (
                <div className="h-1 w-1 rounded-full bg-orange-500" />
              )}
              <span>
                {isSubmitting
                  ? "Creating account..."
                  : isDirty
                    ? "You have unsaved changes"
                    : "Fill in the form to register"}
              </span>
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px] bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
