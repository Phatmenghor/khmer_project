"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LogIn } from "lucide-react";
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
      let errorMessage: string = "Login failed. Please try again.";

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

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-screen sm:w-full sm:max-w-sm max-h-[100dvh] sm:max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden rounded-none sm:rounded">
        {/* Mobile drag handle */}
        <div className="sm:hidden h-1 bg-slate-300 rounded-full w-8 mx-auto mt-2"></div>

        {/* Header — admin FormHeader style with icon tile */}
        <DialogHeader className="px-3 pt-3 pb-2 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 border border-primary/30 bg-primary/10 rounded shrink-0">
              <LogIn className="h-4 w-4 text-primary" strokeWidth={2.25} />
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0 text-left">
              <DialogTitle className="text-xs font-semibold leading-tight">
                Welcome Back
              </DialogTitle>
              <DialogDescription className="text-[11px] leading-snug">
                Sign in to your platform account
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="px-3 py-3 space-y-3">
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
            </div>

            {/* Footer — admin FormFooter style */}
            <div className="flex flex-col gap-1.5 px-2.5 py-2 border-t bg-muted/30 flex-shrink-0 sm:flex-row sm:items-center sm:justify-between sm:px-3">
              <div className="text-[11px] text-muted-foreground flex items-center gap-1 order-2 sm:order-1">
                {isSubmitting && (
                  <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                )}
                <span>{isSubmitting ? "Signing in..." : "Ready to sign in"}</span>
              </div>
              <div className="flex gap-2 order-1 sm:order-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="h-6 px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-6 min-w-[96px] px-3 text-xs bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
