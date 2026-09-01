"use client";

import { LogOut, AlertCircle } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "./custom-modal";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface SignoutModalProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  isSubmitting?: boolean;
  title?: string;
  description?: string;
}

export function SignoutModal({
  open,
  isOpen,
  onOpenChange,
  onClose,
  onConfirm,
  isLoading = false,
  isSubmitting = false,
  title = "Sign Out",
  description = "Are you sure you want to end your current session?",
}: SignoutModalProps) {
  const { profile, user, isAuthenticated } = useAuthState();

  const isModalOpen = isOpen ?? open ?? false;
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const inFlight = isLoading || isSubmitting;

  const displayName = profile?.fullName || user?.userIdentifier || "Current Account";
  const userEmail = profile?.email;
  const avatarUrl =
    profile?.profileImage?.sm ||
    profile?.profileImage?.md ||
    profile?.profileImage?.o;

  return (
    <CustomModal
      isOpen={isModalOpen}
      onClose={handleClose}
      size="sm"
      className="overflow-hidden rounded-2xl border border-border/70 shadow-xl"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 p-4 px-5 border-b border-border/60 shrink-0">
        <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shrink-0 shadow-2xs">
          <LogOut className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <DialogTitle className="font-extrabold text-base text-foreground leading-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-medium">
            End active user session
          </DialogDescription>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-4 px-5 space-y-3.5 bg-card/40">
        {/* User Account Info Card (if authenticated) */}
        {isAuthenticated && (
          <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/60">
            <CustomAvatar
              imageUrl={avatarUrl}
              name={displayName}
              size="md"
              className="shrink-0 ring-1 ring-border"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-foreground truncate">
                {displayName}
              </span>
              {user?.userType && (
                <span className="text-[11px] font-semibold text-primary">
                  {user.userType.replace("_", " ")}
                </span>
              )}
              {userEmail && (
                <span className="text-[11px] text-muted-foreground truncate">
                  {userEmail}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Message */}
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
          {description} You will need to sign in again to access your account data and orders.
        </p>

        {/* Notice alert */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed font-medium">
            Any unsaved checkout changes or active forms will be discarded upon signing out.
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="p-4 px-5 border-t border-border/60 flex items-center justify-end gap-2.5 shrink-0">
        <CustomButton
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClose}
          disabled={inFlight}
          className="font-bold min-w-[90px] rounded-xl border-border/60 hover:bg-muted/50 text-xs py-2 cursor-pointer"
        >
          Cancel
        </CustomButton>
        <CustomButton
          type="button"
          variant="destructive"
          size="sm"
          onClick={onConfirm}
          disabled={inFlight}
          isLoading={inFlight}
          icon={!inFlight ? <LogOut className="h-3.5 w-3.5" /> : undefined}
          className="font-bold min-w-[115px] rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs py-2 shadow-xs cursor-pointer gap-1.5"
        >
          {inFlight ? "Signing out…" : "Sign Out"}
        </CustomButton>
      </div>
    </CustomModal>
  );
}
