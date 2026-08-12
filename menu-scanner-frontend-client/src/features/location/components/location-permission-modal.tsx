"use client";

import React from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Compass } from "lucide-react";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export function LocationPermissionModal({
  isOpen,
  onClose,
  onRetry,
}: LocationPermissionModalProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      className="rounded-[24px] p-6 text-center"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
          <Compass className="h-9 w-9 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">Enable Location Access</h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Your browser has blocked location access for this site. To detect your current location, please allow permission in your browser settings.
          </p>
        </div>

        <div className="w-full bg-muted/50 border border-border/60 rounded-2xl p-3.5 text-left space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span className="text-muted-foreground">Click the <strong>tune / lock icon</strong> on the left side of your browser address bar.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span className="text-muted-foreground">Switch the <strong>Location</strong> setting to <strong>Allow</strong>.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span className="text-muted-foreground">Click <strong>Try Again</strong> below to detect your current position.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full pt-1">
          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 rounded-xl text-xs font-semibold"
          >
            Close
          </CustomButton>
          <CustomButton
            type="button"
            variant="default"
            onClick={onRetry}
            className="flex-1 h-10 rounded-xl text-xs font-bold bg-primary text-primary-foreground border border-primary hover:border-primary/60 shadow-sm"
          >
            Try Again
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
}
