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
import { formatEnumLabel } from "@/utils/common/enum-convert";

interface ResetPasswordModalProps {
  userId?: string;
  userName?: string;
  userRole?: string[];
  profileImageUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResetPasswordModal({
  userId,
  isOpen,
  userName,
  userRole,
  profileImageUrl,
  onClose,
}: ResetPasswordModalProps) {
  const dispatch = useAppDispatch();
  const isResettingPassword = useAppSelector(selectIsResettingPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState(AppDefault.RESET_PASSWORD);

  const onReset = async () => {
    if (!userId) {
      toast.error("User ID missing");
      return;
    }
    if (!password || password.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    try {
      await dispatch(
        adminChangePasswordService({
          userId: userId,
          newPassword: password,
          confirmPassword: password,
        })
      ).unwrap();

      showToast.success("Password reset successfully");
      handleClose();
    } catch (error: any) {
      toast.error(error || "Reset failed. Please try again.");
    }
  };

  const handleClose = () => {
    setShowPassword(false);
    setPassword(AppDefault.RESET_PASSWORD);
    onClose();
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Password copied to clipboard");
    } catch {
      toast.error("Failed to copy password");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title="Reset Password"
          description="Reset the user's password to the default value"
          avatarName={userName}
        />

        <FormBody>
          <div className="space-y-4">
            {/* User Info Card */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-primary">
                        {userName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {userName || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userRole && userRole.length > 0
                        ? userRole.map((r) => formatEnumLabel(r)).join(", ")
                        : "User Account"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Key className="h-3 w-3 text-muted-foreground" />
                <Label className="text-xs font-semibold">New Password</Label>
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-14 font-mono text-xs h-8 py-2"
                  placeholder="Enter new password"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-5 w-5 p-0"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyPassword}
                    className="h-5 w-5 p-0"
                    title="Copy password"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                User must change this password on first login
              </p>
            </div>

            {/* Warning Card */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <AlertTriangle className="h-3 w-3 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-orange-900">
                      Important Notice
                    </p>
                    <p className="text-xs text-orange-800 mt-1">
                      This action will log out the user from all devices. They
                      must use the new password to sign in.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </FormBody>

        <div className="flex gap-2 px-3 py-3 border-t bg-muted/30 flex-shrink-0 sm:px-4 justify-end">
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
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
