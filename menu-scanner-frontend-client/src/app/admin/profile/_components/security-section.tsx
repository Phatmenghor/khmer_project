"use client";

import { Lock, Trash2, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { TelegramSyncCard } from "@/components/shared/telegram/telegram-sync-card";

interface SecuritySectionProps {
  onChangePassword: () => void;
  onDeleteAccount: () => void;
}

export function SecuritySection({
  onChangePassword,
  onDeleteAccount,
}: SecuritySectionProps) {
  return (
    <div className="w-full space-y-4">
      {/* Connected Accounts */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 px-0.5">
          <Link2 className="h-3.5 w-3.5 text-primary" />
          <span>Connected Accounts</span>
        </h3>
        <TelegramSyncCard />
      </div>

      {/* Change Password Card */}
      <Card className="border-border/80 shadow-2xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                Change Password
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your password regularly to keep your admin account safe and secure
              </p>
            </div>
            <CustomButton
              variant="primary"
              size="sm"
              onClick={onChangePassword}
              className="gap-1.5 font-bold text-xs h-8 shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              Change Password
            </CustomButton>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Card */}
      <Card className="border-destructive/30 bg-destructive/5 shadow-2xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-destructive">
                Delete Account
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and remove all personal settings and data
              </p>
            </div>
            <CustomButton
              variant="destructive"
              size="sm"
              onClick={onDeleteAccount}
              className="gap-1.5 font-bold text-xs h-8 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </CustomButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
