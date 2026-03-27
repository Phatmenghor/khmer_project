"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { AppDefault } from "@/constants/app-resource/default/default";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { adminChangePasswordService } from "@/redux/features/auth/store/thunks/users-thunks";
import { selectIsResettingPassword } from "@/redux/features/auth/store/selectors/users-selectors";
import { showToast } from "../common/show-toast";
import { FormHeader } from "../form-field/form-header";
import { FormBody } from "../form-field/form-body";
import { FormFooter } from "../form-field/form-footer";

interface ResetPasswordModalProps {
  userId?: string;
  userName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResetPasswordModal({
  userId,
  isOpen,
  userName,
  onClose,
}: ResetPasswordModalProps) {
  const dispatch = useAppDispatch();

  // Get resetting password state from Redux
  const isResettingPassword = useAppSelector(selectIsResettingPassword);

  const [showPassword, setShowPassword] = useState(false);
  const defaultPassword = AppDefault.RESET_PASSWORD;

  const onReset = async () => {
    if (!userId) {
      toast.error("User ID missing");
      return;
    }

    try {
      await dispatch(
        adminChangePasswordService({
          userId: userId,
          newPassword: defaultPassword,
          confirmPassword: defaultPassword,
        })
      ).unwrap();

      showToast.success("Password reset successfully");

      handleClose();
    } catch (error: any) {
      console.error("Password reset failed:", error);
      toast.error(error || "Reset failed. Please try again.");
    }
  };

  const handleClose = () => {
    setShowPassword(false);
    onClose();
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(defaultPassword);
      toast.success("Password copied to clipboard");
    } catch (error) {
      console.error("Failed to copy password:", error);
      toast.error("Failed to copy password");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-lg max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title="Reset Password"
          description="Reset the user's password to the default value"
          avatarName={userName}
        />

        <FormBody>
          <div className="space-y-6">
            {/* User Preview Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {userName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {userName || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground">User Account</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Default Password Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">New Password</Label>
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={defaultPassword}
                  readOnly
                  className="pr-20 font-mono text-sm h-12 py-3"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-8 w-8 p-0"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyPassword}
                    className="h-8 w-8 p-0"
                    title="Copy password"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                User must change this password on first login
              </p>
            </div>

            {/* Warning Card */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-orange-900">
                      Important Notice
                    </p>
                    <p className="text-sm text-orange-800 mt-1">
                      This action will log out the user from all devices. They must use the new password to sign in.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </FormBody>

        <FormFooter isSubmitting={isResettingPassword}>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isResettingPassword}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onReset}
            disabled={isResettingPassword}
            variant="destructive"
          >
            {isResettingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
