"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";

const schema = z.object({
  userIdentifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      userIdentifier: "",
      password: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const response = await axiosClient.post("/api/v1/auth/login", {
        userIdentifier: values.userIdentifier,
        password: values.password,
        userType: "PLATFORM_USER",
      });

      if (response?.data?.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
        if (response.data.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.data.refreshToken);
        }
        showToast.success("Welcome back! Redirecting to dashboard...");
        reset();
        onClose();
        setTimeout(() => {
          router.push(ROUTES.DASHBOARD.INDEX);
        }, 500);
      }
    } catch (err: any) {
      let errorMessage = "Login failed. Please try again.";

      // Handle different error formats (axios)
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen sm:w-full sm:max-w-md max-h-[100dvh] sm:max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden rounded-none sm:rounded-lg">
        {/* Mobile drag handle */}
        <div className="sm:hidden h-1 bg-slate-300 rounded-full w-12 mx-auto mt-3"></div>

        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-1">
            Sign in to your account
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <TextField
                name="userIdentifier"
                label="Email or Username"
                placeholder="name@example.com"
                control={control}
                error={errors.userIdentifier}
                disabled={isSubmitting}
                required
              />

              <PasswordField
                name="password"
                label="Password"
                placeholder="Enter your password"
                control={control}
                error={errors.password}
                disabled={isSubmitting}
                required
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((v) => !v)}
              />

              <div className="flex justify-between items-center pt-4 -mx-6 -mb-8 px-6 py-4 border-t bg-muted/30">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {isSubmitting && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                  <span>{isSubmitting ? "Signing in..." : "Ready to sign in"}</span>
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
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
