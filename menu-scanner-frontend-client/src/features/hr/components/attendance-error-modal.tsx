"use client";

import React from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

interface AttendanceErrorModalProps {
  open: boolean;
  onClose: () => void;
  message: string | null;
}

export function AttendanceErrorModal({
  open,
  onClose,
  message,
}: AttendanceErrorModalProps) {
  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      size="sm"
      disableScrollWrapper={true}
    >
      {/* Centered Error Header — POS Style */}
      <div className="flex flex-col items-center justify-center text-center p-6 pb-2">
        <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shadow-2xs border border-amber-500/20 mb-4 animate-in zoom-in duration-300">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-xs">
            <AlertCircle className="h-6 w-6" strokeWidth={3} />
          </div>
        </div>
        <DialogTitle className="text-lg font-black text-foreground tracking-tight">
          Check-In Notice
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
          Attendance check-in rule notification
        </DialogDescription>
      </div>

      {/* Error Details Card — POS Style */}
      <div className="px-6 py-2 space-y-4">
        <div className="rounded-[12px] border border-amber-500/30 bg-amber-500/5 p-4 text-xs space-y-2 shadow-3xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Shift Validation Notice</span>
          </div>
          <p className="text-xs text-foreground font-semibold leading-relaxed">
            {message || "Attendance check-in/out already completed for today."}
          </p>
        </div>
      </div>

      {/* Action Button — POS Style */}
      <div className="p-4 pt-2 flex flex-col gap-2">
        <CustomButton
          onClick={onClose}
          variant="outline"
          size="sm"
          className="w-full h-9 text-xs font-bold rounded-xl border-border/80 hover:bg-muted/50 transition-all duration-200 cursor-pointer"
        >
          Understand & Close
        </CustomButton>
      </div>
    </CustomModal>
  );
}
