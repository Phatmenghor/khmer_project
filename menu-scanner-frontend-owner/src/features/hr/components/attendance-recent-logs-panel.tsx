"use client";

import React from "react";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { Clock, User, UserCheck, LogOut, AlertCircle, Hourglass } from "lucide-react";
import { AttendanceModel, getUserAvatarUrl } from "@/features/hr/store/models/hr-models";

interface AttendanceRecentLogsPanelProps {
  attendanceList: AttendanceModel[];
}

interface ScanEventItem {
  id: string;
  attendanceId: string;
  fullName: string;
  avatarUrl?: string;
  userIdentifier: string;
  timeStr?: string;
  checkType: string;
  status: string;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  overtimeMinutes?: number;
  referenceNumber?: string;
}

function getRelativeTimeString(timeStr?: string): string {
  if (!timeStr) return "Just now";
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 30) return "Just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AttendanceRecentLogsPanel({
  attendanceList,
}: AttendanceRecentLogsPanelProps) {
  // Flatten all today's scan check-in/out events across all staff records
  const allTodayScans: ScanEventItem[] = (attendanceList || []).flatMap((log: AttendanceModel) => {
    const fullName = `${log.userInfo?.firstName || "Staff"} ${log.userInfo?.lastName || ""}`.trim();
    const avatarUrl = getUserAvatarUrl(log.userInfo);
    const userIdentifier = log.userInfo?.userIdentifier || log.userInfo?.email || "";

    if (log.checkIns && log.checkIns.length > 0) {
      return log.checkIns.map((check): ScanEventItem => {
        let computedLate = check.lateMinutes !== undefined ? check.lateMinutes : log.lateMinutes;
        if (computedLate === undefined && check.checkInTime) {
          const t = new Date(check.checkInTime);
          const expected = new Date(t);
          expected.setHours(9, 0, 0, 0); // 09:00 AM default expected shift start
          if (t.getTime() > expected.getTime()) {
            computedLate = Math.floor((t.getTime() - expected.getTime()) / 60000);
          }
        }

        return {
          id: check.id || `${log.id}-${check.checkInType}-${check.checkInTime}`,
          attendanceId: log.id,
          fullName,
          avatarUrl,
          userIdentifier,
          timeStr: check.checkInTime || log.createdAt,
          checkType: check.checkInType || log.status,
          status: log.status,
          lateMinutes: computedLate,
          earlyLeaveMinutes: check.earlyLeaveMinutes !== undefined ? check.earlyLeaveMinutes : log.earlyLeaveMinutes,
          overtimeMinutes: check.overtimeMinutes !== undefined ? check.overtimeMinutes : log.overtimeMinutes,
          referenceNumber: check.referenceNumber || log.referenceNumber,
        };
      });
    }

    return [{
      id: log.id,
      attendanceId: log.id,
      fullName,
      avatarUrl,
      userIdentifier,
      timeStr: log.attendanceDate || log.createdAt,
      checkType: log.status,
      status: log.status,
      lateMinutes: log.lateMinutes,
      earlyLeaveMinutes: log.earlyLeaveMinutes,
      overtimeMinutes: log.overtimeMinutes,
      referenceNumber: log.referenceNumber,
    }];
  }).sort((a, b) => new Date(b.timeStr || 0).getTime() - new Date(a.timeStr || 0).getTime());

  return (
    <div className="p-4 rounded-2xl border border-border bg-card space-y-3.5 shadow-2xs">
      {/* Header with Static Green Dot & Count */}
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          {/* Static Green Dot (No Animation) */}
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Recent Check-Ins Today</span>
          </h4>
        </div>
        <span className="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 shadow-2xs">
          {allTodayScans.length} {allTodayScans.length === 1 ? "Scan Today" : "Scans Today"}
        </span>
      </div>

      {/* Activity List */}
      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
        {allTodayScans && allTodayScans.length > 0 ? (
          allTodayScans.map((scan) => {
            const isCheckIn = scan.checkType === "CHECK_IN" || scan.checkType === "START" || scan.status === "PRESENT" || scan.status === "LATE";
            const isLate = scan.status === "LATE" || (scan.lateMinutes !== undefined && scan.lateMinutes > 0);
            const isHalfDay = scan.status === "HALF_DAY";
            const relativeTime = getRelativeTimeString(scan.timeStr);
            
            // Format time: only HH:MM AM/PM (without seconds)
            const formattedTime = scan.timeStr
              ? new Date(scan.timeStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Recently";

            return (
              <div
                key={scan.id}
                className="group relative p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/30 flex items-center justify-between text-xs transition-all shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <CustomAvatar
                      imageUrl={scan.avatarUrl}
                      name={scan.fullName}
                      size="md"
                      className="ring-2 ring-border group-hover:ring-primary/40 transition-all"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
                        isLate
                          ? "bg-amber-500"
                          : isCheckIn
                          ? "bg-emerald-500"
                          : "bg-blue-500"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="font-extrabold text-foreground text-xs truncate group-hover:text-primary transition-colors">
                      {scan.fullName}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1 font-semibold text-foreground/80">
                        <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                        {formattedTime}
                      </span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold text-muted-foreground shrink-0">
                        {relativeTime}
                      </span>
                    </div>

                    {scan.userIdentifier && (
                      <p className="text-[11px] font-medium text-muted-foreground/80 truncate">
                        {scan.userIdentifier}
                      </p>
                    )}
                  </div>
                </div>

                {/* Distinct Merged Action Pill */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {isHalfDay ? (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-1 shadow-2xs">
                      <Hourglass className="w-3.5 h-3.5 shrink-0" /> Half Day
                    </span>
                  ) : isCheckIn ? (
                    isLate ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-2xs">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Late {scan.lateMinutes && scan.lateMinutes > 0 ? `(${scan.lateMinutes} mins)` : ""}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-2xs">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" /> Check In
                      </span>
                    )
                  ) : (
                    scan.earlyLeaveMinutes && scan.earlyLeaveMinutes > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-2xs">
                        <LogOut className="w-3.5 h-3.5 shrink-0" /> Early ({scan.earlyLeaveMinutes} mins)
                      </span>
                    ) : scan.overtimeMinutes && scan.overtimeMinutes > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1 shadow-2xs">
                        <LogOut className="w-3.5 h-3.5 shrink-0" /> Overtime
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1 shadow-2xs">
                        <LogOut className="w-3.5 h-3.5 shrink-0" /> Check Out
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-border text-center space-y-2 bg-muted/10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-foreground">No attendance scan records yet today</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Scan staff QR code or click Quick Check-In to record attendance</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
