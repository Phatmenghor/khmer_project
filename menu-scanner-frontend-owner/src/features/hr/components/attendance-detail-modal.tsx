"use client";

import React, { useEffect } from "react";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import {
  AttendanceModel,
  AttendanceCheckIn,
  getUserDisplayName,
  getUserAvatarUrl,
} from "@/features/hr/store/models/hr-models";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { LogIn, LogOut, MapPin, Clock } from "lucide-react";
import { useAppDispatch } from "@/store";
import { getAttendanceByIdService } from "../store/thunks/hr-thunks";
import { clearSelectedAttendance } from "../store/slice/hr-slice";
import { useHRState } from "../store/state/hr-state";

interface AttendanceDetailModalProps {
  attendanceId?: string;
  isOpen: boolean;
  onClose: () => void;
  attendance?: AttendanceModel | null;
}

export function AttendanceDetailModal({
  attendanceId,
  isOpen,
  onClose,
  attendance: propAttendance,
}: AttendanceDetailModalProps) {
  const dispatch = useAppDispatch();
  const { selectedAttendance, selectedAttendanceLoading } = useHRState();

  useEffect(() => {
    if (!attendanceId || !isOpen) return;
    dispatch(getAttendanceByIdService(attendanceId)).unwrap().catch(() => {});
  }, [attendanceId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedAttendance());
    onClose();
  };

  const attendanceData = propAttendance || selectedAttendance;

  if (!isOpen) return null;

  const user = attendanceData?.userInfo;
  const fullName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);
  const email = user?.email || "-";
  const identifier = user?.userIdentifier || "-";
  const roles = user?.roles?.join(", ") || user?.position || "Staff Member";
  const isLate = attendanceData?.status === "LATE" || (attendanceData?.lateMinutes !== undefined && attendanceData.lateMinutes > 0);

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={selectedAttendanceLoading}
      isEmpty={!attendanceData}
      emptyMessage="No attendance record available"
      title={fullName || "Attendance Record Details"}
      description={attendanceData ? `Attendance Reference: #${attendanceData.referenceNumber || attendanceData.id}` : "Manage staff attendance details"}
      avatarUrl={avatarUrl}
      avatarName={fullName}
      size="4xl"
    >
      {attendanceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          {/* Staff & Business Profile */}
          <SectionTitle>Staff & Business Profile</SectionTitle>
          <InfoRow label="Staff Name" value={fullName || "-"} />
          <InfoRow label="User Identifier" value={identifier} />
          <InfoRow label="Email" value={email} />
          <InfoRow label="Role / Position" value={roles} />

          {/* Attendance Record Information */}
          <SectionTitle>Attendance Record</SectionTitle>
          <InfoRow label="Reference ID" value={`#${attendanceData.referenceNumber || attendanceData.id}`} />
          <InfoRow label="Attendance Date" value={attendanceData.attendanceDate || "-"} />
          <InfoRow
            label="Status"
            value={
              isLate ? (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Late {attendanceData.lateMinutes ? `(${attendanceData.lateMinutes} mins)` : ""}
                </span>
              ) : attendanceData.status === "PRESENT" ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Present</span>
              ) : attendanceData.status === "HALF_DAY" ? (
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Half Day</span>
              ) : (
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{attendanceData.status}</span>
              )
            }
          />
          <InfoRow
            label="Late Duration"
            value={attendanceData.lateMinutes && attendanceData.lateMinutes > 0 ? `${attendanceData.lateMinutes} minutes` : "On Time"}
          />
          <InfoRow
            label="Overtime Duration"
            value={attendanceData.overtimeMinutes && attendanceData.overtimeMinutes > 0 ? "Overtime" : "None"}
          />
          <InfoRow
            label="Early Leave Duration"
            value={attendanceData.earlyLeaveMinutes && attendanceData.earlyLeaveMinutes > 0 ? `${attendanceData.earlyLeaveMinutes} minutes` : "None"}
          />

          {/* Clock Logs Timeline */}
          {(!attendanceData.checkIns || attendanceData.checkIns.length === 0) ? (
            <div className="col-span-1 md:col-span-2 space-y-2">
              <SectionTitle>Clock Logs (0)</SectionTitle>
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-center text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2">
                <span>No clock-in or clock-out scan recorded for this date. (Marked as Absent)</span>
              </div>
            </div>
          ) : (
            <div className="col-span-1 md:col-span-2 space-y-2">
              <SectionTitle>Clock Logs ({attendanceData.checkIns.length})</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {attendanceData.checkIns.map((ci: AttendanceCheckIn, idx: number) => {
                  const isCheckIn = ci.checkInType === "CHECK_IN" || (ci as any).checkInType === "START";
                  const formattedTime = ci.checkInTime
                    ? new Date(ci.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Recently";

                  const ciLateMins = ci.lateMinutes !== undefined ? ci.lateMinutes : attendanceData.lateMinutes;
                  const isCiLate = ci.isLate || (ciLateMins !== undefined && ciLateMins > 0) || isLate;

                  const ciEarlyMins = ci.earlyLeaveMinutes !== undefined ? ci.earlyLeaveMinutes : attendanceData.earlyLeaveMinutes;
                  const isCiEarly = ci.isEarly || (ciEarlyMins !== undefined && ciEarlyMins > 0);
                  const isCiOvertime = ci.isOvertime || (attendanceData.overtimeMinutes !== undefined && attendanceData.overtimeMinutes > 0);

                  return (
                    <div
                      key={ci.id || idx}
                      className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center ${
                            isCheckIn
                              ? isCiLate
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : isCiEarly
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              : isCiOvertime
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                          }`}
                        >
                          {isCheckIn ? <LogIn className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-extrabold text-foreground text-xs flex items-center gap-1">
                            <span>{isCheckIn ? "Clock In (START)" : "Clock Out (END)"}</span>
                            <span
                              className={`text-[10px] font-extrabold ${
                                isCheckIn
                                  ? isCiLate
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                  : isCiEarly
                                  ? "text-rose-600 dark:text-rose-400"
                                  : isCiOvertime
                                  ? "text-indigo-600 dark:text-indigo-400"
                                  : "text-blue-600 dark:text-blue-400"
                              }`}
                            >
                              • {isCheckIn
                                ? isCiLate
                                  ? `Late ${ciLateMins ? `${ciLateMins}m` : ""}`
                                  : "Present"
                                : isCiEarly
                                ? `Early ${ciEarlyMins ? `${ciEarlyMins}m` : ""}`
                                : isCiOvertime
                                ? "Overtime"
                                : "Normal"}
                            </span>
                          </p>
                          <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {formattedTime}
                          </p>
                        </div>
                      </div>

                      {ci.latitude && ci.longitude ? (
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                            <MapPin className="w-3 h-3" /> GPS Verified
                          </span>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            {ci.latitude.toFixed(4)}, {ci.longitude.toFixed(4)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold text-muted-foreground">Standard Scan</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* System Audit Info */}
          <SectionTitle>System Info</SectionTitle>
          <InfoRow label="Created By" value={attendanceData.createdBy || "-"} />
          <InfoRow label="Created At" value={attendanceData.createdAt ? dateTimeFormat(attendanceData.createdAt) : "-"} />
          <InfoRow label="Updated By" value={attendanceData.updatedBy || "-"} />
          <InfoRow label="Last Updated" value={attendanceData.updatedAt ? dateTimeFormat(attendanceData.updatedAt) : "-"} />
        </div>
      )}
    </DetailModal>
  );
}
