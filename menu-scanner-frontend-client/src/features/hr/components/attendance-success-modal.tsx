"use client";

import React, { useState } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Copy, CheckCheck, Clock, ShieldCheck, Building } from "lucide-react";
import { AttendanceModel, getUserAvatarUrl } from "@/features/hr/store/models/hr-models";
import { showToast } from "@/components/shared/common/show-toast";

interface AttendanceSuccessModalProps {
  open: boolean;
  onClose: () => void;
  result: AttendanceModel | null;
  currentUser?: any;
}

export function AttendanceSuccessModal({
  open,
  onClose,
  result,
  currentUser,
}: AttendanceSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const latestCheckIn = result.checkIns && result.checkIns.length > 0
    ? result.checkIns[result.checkIns.length - 1]
    : null;
  const displayRefNumber = latestCheckIn?.referenceNumber || result.referenceNumber || result.id || "";

  const handleCopyReference = () => {
    if (!displayRefNumber) return;
    navigator.clipboard.writeText(displayRefNumber);
    setCopied(true);
    showToast.success("Reference ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const staffName = result.userInfo?.firstName || currentUser?.fullName || "Staff Member";
  const staffLastName = result.userInfo?.lastName || "";
  const fullName = `${staffName} ${staffLastName}`.trim();
  const staffEmail = result.userInfo?.email || currentUser?.email || "Attendance Staff";
  const avatarUrl = getUserAvatarUrl(result.userInfo) || currentUser?.profileImageUrl;

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      size="sm"
      disableScrollWrapper={true}
    >
      {/* Centered Success Header — POS Style */}
      <div className="flex flex-col items-center justify-center text-center p-6 pb-2">
        <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shadow-2xs border border-emerald-500/20 mb-4 animate-in zoom-in duration-300">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs">
            <Check className="h-6 w-6" strokeWidth={3} />
          </div>
        </div>
        <DialogTitle className="text-lg font-black text-foreground tracking-tight">
          Attendance Recorded!
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
          Check-in details registered to business system
        </DialogDescription>
      </div>

      {/* Details Card — POS Style */}
      <div className="px-6 py-2 space-y-4">
        <div className="rounded-[12px] border border-border/80 bg-muted/20 p-4 space-y-3 text-xs shadow-3xs">
          {/* Staff Info */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/60">
            <CustomAvatar
              imageUrl={avatarUrl}
              name={fullName}
              size="lg"
            />
            <div>
              <h4 className="font-extrabold text-foreground text-xs">
                {fullName}
              </h4>
              <p className="text-[10px] text-muted-foreground font-medium">
                {staffEmail}
              </p>
            </div>
          </div>

          {/* Reference ID with Copy Button */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-semibold">Reference ID</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-foreground">
                #{displayRefNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyReference}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5"
                title="Copy Reference ID"
              >
                {copied ? (
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Check-In Time */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-semibold">Check-In Time</span>
            <span className="font-bold text-foreground">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>

          {/* Shift Status */}
          <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
            <span className="font-extrabold text-foreground">Shift Status</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                result.status === "PRESENT"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : result.status === "LATE"
                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
              }`}
            >
              {result.status || "PRESENT"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button — POS Style */}
      <div className="p-4 pt-2 flex flex-col gap-2">
        <CustomButton
          onClick={onClose}
          size="sm"
          className="w-full h-9 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-2xs hover:shadow transition-all duration-300 cursor-pointer"
        >
          Done
        </CustomButton>
      </div>
    </CustomModal>
  );
}
