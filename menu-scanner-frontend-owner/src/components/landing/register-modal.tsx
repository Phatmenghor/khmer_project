"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { showToast } from "@/components/shared/common/show-toast";
import { axiosClient } from "@/utils/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const schema = z
  .object({
    ownerFullName: z.string().min(1, "Full name is required"),
    userIdentifier: z.string().min(3, "Username must be at least 3 characters"),
    ownerEmail: z.string().email("Invalid email address"),
    ownerPhone: z.string().min(6, "Phone number is required"),
    ownerPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    businessName: z.string().min(1, "Business name is required"),
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

export function RegisterModal({ isOpen, onClose, plan }: RegisterModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
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
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      enableStockManagement: false,
      primaryColor: "#A32D62", // Owner project primary color (HSL 334 51% 39%)
    },
    mode: "onChange",
  });

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

      // Include planId if user selected a plan from pricing page
      if (plan?.id) {
        payload.planId = plan.id;
      }

      await axiosClient.post("/api/v1/business-owners/register", payload);
      showToast.success("Account created! Please sign in to continue.");
      reset();
      onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen sm:w-full sm:max-w-7xl max-h-[100dvh] sm:max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden rounded-none sm:rounded-lg">
        {/* Mobile drag handle */}
        <div className="sm:hidden h-1 bg-slate-300 rounded-full w-12 mx-auto mt-3"></div>

        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex flex-col gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                Create Your Account
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground mt-1">
                Register to get started with your business
              </DialogDescription>
            </div>

            {/* Selected Plan Display */}
            {plan && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{plan.name} Plan</h4>
                  <span className="text-sm text-muted-foreground">{plan.price} {plan.period}</span>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0 w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-8 space-y-10">
            {/* Account Credentials Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">1</span>
                  Account Credentials
                </h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Login Fields - First Priority */}
                  <TextField
                    name="userIdentifier"
                    label="Username *"
                    placeholder="Enter username"
                    control={control}
                    error={errors.userIdentifier}
                    disabled={isSubmitting}
                    required
                  />
                  <PasswordField
                    name="ownerPassword"
                    label="Password *"
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
                  {/* Personal Information */}
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
                    name="ownerEmail"
                    label="Email Address"
                    type="email"
                    placeholder="Enter email address"
                    control={control}
                    error={errors.ownerEmail}
                    disabled={isSubmitting}
                    required
                  />
                  <TextField
                    name="ownerPhone"
                    label="Phone Number"
                    type="tel"
                    placeholder="Enter phone number"
                    control={control}
                    error={errors.ownerPhone}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Business section */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">2</span>
                  Business Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  <TextField
                    name="businessName"
                    label="Business Name"
                    placeholder="Enter business name"
                    control={control}
                    error={errors.businessName}
                    disabled={isSubmitting}
                    required
                  />
                  <TextField
                    name="businessEmail"
                    label="Business Email"
                    type="email"
                    placeholder="Enter business email"
                    control={control}
                    error={errors.businessEmail}
                    disabled={isSubmitting}
                    required
                  />
                  <TextField
                    name="businessPhone"
                    label="Business Phone"
                    type="tel"
                    placeholder="Enter business phone"
                    control={control}
                    error={errors.businessPhone}
                    disabled={isSubmitting}
                    required
                  />
                  <TextField
                    name="businessAddress"
                    label="Business Address"
                    placeholder="Enter business address"
                    control={control}
                    error={errors.businessAddress}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Settings section */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">3</span>
                  Settings
                </h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enable Stock Management</label>
                    <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
                      <Switch
                        checked={watch("enableStockManagement")}
                        onCheckedChange={(checked) => setValue("enableStockManagement", checked)}
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-muted-foreground">
                        {watch("enableStockManagement") ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Color</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={watch("primaryColor")}
                        onChange={(e) => setValue("primaryColor", e.target.value)}
                        disabled={isSubmitting}
                        className="w-20 h-10 cursor-pointer rounded border border-input"
                      />
                      <input
                        placeholder="#RRGGBB"
                        value={watch("primaryColor")}
                        onChange={(e) => setValue("primaryColor", e.target.value)}
                        disabled={isSubmitting}
                        className={`flex-1 px-3 py-2 border rounded-md ${errors.primaryColor ? "border-red-500" : "border-input"}`}
                      />
                    </div>
                    {errors.primaryColor && (
                      <p className="text-xs text-red-500">{errors.primaryColor.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Main brand color applied site-wide
                    </p>
                  </div>
                </div>
              </div>
            </form>
        </ScrollArea>

        {/* Footer with buttons - outside scroll area */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {isSubmitting && (
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            )}
            <span>{isSubmitting ? "Creating account..." : "Ready to create account"}</span>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
