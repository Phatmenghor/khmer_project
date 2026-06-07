"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";

interface SignoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function SignoutModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: SignoutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md max-h-[92vh] p-0 gap-0 flex flex-col">
        <FormHeader
          title="Sign Out"
          description="End your current session"
          isCreate={false}
          icon={LogOut}
          variant="destructive"
        />

        <FormBody className="flex-1">
          <div className="space-y-3 py-2">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded">
              <p className="text-xs text-red-900 dark:text-red-100 font-medium leading-relaxed">
                Are you sure you want to sign out? You&apos;ll need to sign in
                again to access your dashboard and saved data.
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded">
              <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed">
                <span className="font-semibold">⚠️ Important:</span> Make sure
                you&apos;ve saved any ongoing work before signing out. This
                action will end your current session and redirect you to the
                login page.
              </p>
            </div>
          </div>
        </FormBody>

        <div className="flex justify-end items-center gap-2 px-4 py-3 border-t bg-muted/30 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded"
          >
            Stay Signed In
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded bg-red-600 hover:bg-red-700 focus:ring-red-600 gap-1.5"
          >
            <LogOut className="h-3 w-3" />
            {isLoading ? "Signing out…" : "Sign Out"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
