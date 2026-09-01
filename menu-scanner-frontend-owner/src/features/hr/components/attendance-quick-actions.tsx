"use client";

import React, { ChangeEvent } from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Zap, Upload, Loader2 } from "lucide-react";

interface AttendanceQuickActionsProps {
  isProcessing: boolean;
  processingAction: "scan" | "upload" | "quick" | null;
  onQuickCheckIn: () => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function AttendanceQuickActions({
  isProcessing,
  processingAction,
  onQuickCheckIn,
  onImageUpload,
}: AttendanceQuickActionsProps) {
  return (
    <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3">
      <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-primary" />
        <span>Quick Actions</span>
      </h4>

      <div className="grid grid-cols-2 gap-2.5">
        <CustomButton
          variant="default"
          size="sm"
          type="button"
          onClick={onQuickCheckIn}
          disabled={isProcessing}
          className="h-10 px-3.5 py-2.5 rounded-xl text-xs font-extrabold gap-1.5 cursor-pointer shadow-xs w-full justify-center"
        >
          {isProcessing && processingAction === "quick" ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300 shrink-0" />
              <span>Checking in...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
              <span>Quick Check-In</span>
            </>
          )}
        </CustomButton>

        <label
          className={`h-10 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/60 text-foreground text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs hover:border-primary/40 w-full ${
            isProcessing ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {isProcessing && processingAction === "upload" ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
              <span>Reading QR...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Upload QR</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={onImageUpload} disabled={isProcessing} className="hidden" />
        </label>
      </div>
    </div>
  );
}
