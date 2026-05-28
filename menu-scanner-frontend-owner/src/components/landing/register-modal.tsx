"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: string;
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
      reset();
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Start Your Free Trial
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Get full access to all features {plan && `for the ${plan} plan`}. No credit card required.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Owner section */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">1</span>
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
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">2</span>
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

              {/* Actions */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
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
              </div>

              <p className="text-center text-xs text-muted-foreground mt-4">
                By registering you agree to our{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>
                {" "}and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex-shrink-0 text-xs text-muted-foreground">
          <p>✓ No credit card required  •  ✓ Full access to all features  •  ✓ Cancel anytime</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
