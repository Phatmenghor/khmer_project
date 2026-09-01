"use client";

import React, { useEffect, useState } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatTime } from "@/utils/date/date-time-format";
import { useAppDispatch } from "@/store";
import { fetchWorkScheduleByIdService } from "@/features/hr/store/thunks/hr-thunks";
import {
  WorkScheduleModel,
  DayShiftDto,
  getUserDisplayName,
  getUserRolesDisplay,
  getUserIdentifierDisplay,
  getUserAvatarUrl,
  getWorkingDaysFormattedInfo,
} from "@/features/hr/store/models/hr-models";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface WorkScheduleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewId?: string | null;
  initialSchedule?: WorkScheduleModel | null;
}

const WEEK_DAYS = [
  { day: "MONDAY", label: "Monday", short: "Mon" },
  { day: "TUESDAY", label: "Tuesday", short: "Tue" },
  { day: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { day: "THURSDAY", label: "Thursday", short: "Thu" },
  { day: "FRIDAY", label: "Friday", short: "Fri" },
  { day: "SATURDAY", label: "Saturday", short: "Sat" },
  { day: "SUNDAY", label: "Sunday", short: "Sun" },
];

export function WorkScheduleDetailModal({
  isOpen,
  onClose,
  viewId,
  initialSchedule,
}: WorkScheduleDetailModalProps) {
  const dispatch = useAppDispatch();
  const [schedule, setSchedule] = useState<WorkScheduleModel | null>(initialSchedule || null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (viewId && isOpen) {
      setLoading(true);
      dispatch(fetchWorkScheduleByIdService(viewId))
        .unwrap()
        .then((res) => {
          setSchedule(res);
        })
        .catch(() => {
          if (initialSchedule) setSchedule(initialSchedule);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (initialSchedule) {
      setSchedule(initialSchedule);
    }
  }, [viewId, isOpen, initialSchedule, dispatch]);

  const user = schedule?.userInfo;
  const staffName = getUserDisplayName(user);
  const userIdentifier = getUserIdentifierDisplay(user);
  const rolesDisplay = getUserRolesDisplay(user);
  const avatarUrl = getUserAvatarUrl(user);
  const daysInfo = getWorkingDaysFormattedInfo(schedule?.workDays, schedule?.dayShifts);

  const dayShiftsMap = new Map<string, DayShiftDto>(
    (schedule?.dayShifts || []).map((ds) => [ds.dayOfWeek.toUpperCase(), ds])
  );

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      isLoading={loading}
      isEmpty={!schedule}
      emptyMessage="No work schedule data available"
      title={schedule?.name || "Work Schedule Details"}
      description="Work Schedule & Shift Roster Details"
      avatarUrl={avatarUrl}
      avatarName={staffName}
      size="5xl"
    >
      {schedule && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          {/* Merged Schedule Overview & Staff Details */}
          <SectionTitle>Schedule Overview</SectionTitle>
          <InfoRow label="Schedule Name" value={schedule.name} />
          <InfoRow label="Staff Name" value={staffName} />
          <InfoRow label="User Identifier" value={userIdentifier || "-"} />
          <InfoRow label="Roles" value={rolesDisplay || "-"} />
          <InfoRow
            label="Working Days"
            value={
              <span className="text-xs font-bold text-foreground">
                {daysInfo.summaryLabel || "-"}
              </span>
            }
          />
          <InfoRow label="Email" value={user?.email || "-"} />
          <InfoRow label="Phone" value={user?.phoneNumber || "-"} />

          {/* 7-Day Shift Roster Breakdown */}
          <div className="col-span-2 space-y-2.5 mt-1">
            <SectionTitle>7-Day Shift Roster Breakdown</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {WEEK_DAYS.map((d) => {
                const shift = dayShiftsMap.get(d.day);
                const isEnabled = shift ? shift.enabled : schedule.workDays?.includes(d.day);
                const startTime = shift?.startTime || schedule.startTime;
                const endTime = shift?.endTime || schedule.endTime;
                const breakStart = shift?.breakStartTime || schedule.breakStartTime;
                const breakEnd = shift?.breakEndTime || schedule.breakEndTime;

                return (
                  <div
                    key={d.day}
                    className={cn(
                      "p-3 rounded-xl border flex items-center justify-between gap-3 text-left transition-all bg-card shadow-2xs",
                      isEnabled
                        ? "border-primary/40"
                        : "border-border/60"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {isEnabled ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{d.label}</span>
                        <span
                          className={cn(
                            "text-[10px] font-semibold inline-block",
                            isEnabled ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {isEnabled ? "Working Day" : "Off Day"}
                        </span>
                      </div>
                    </div>

                    {isEnabled ? (
                      <div className="flex flex-col text-right text-xs">
                        <span className="font-semibold text-foreground">
                          {startTime && endTime ? `${formatTime(startTime)} - ${formatTime(endTime)}` : "No Time Set"}
                        </span>
                        {breakStart && breakEnd ? (
                          <span className="text-[11px] text-muted-foreground font-medium">
                            Break: {formatTime(breakStart)} - {formatTime(breakEnd)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/80 font-normal">No Break</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
                        Off Day
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Info */}
          <SectionTitle>System Info</SectionTitle>
          <InfoRow label="Created By" value={schedule.createdBy || "-"} />
          <InfoRow
            label="Created At"
            value={dateTimeFormat(schedule.createdAt ?? "")}
          />
          <InfoRow label="Updated By" value={schedule.updatedBy || "-"} />
          <InfoRow
            label="Last Updated"
            value={dateTimeFormat(schedule.updatedAt ?? "")}
          />
        </div>
      )}
    </DetailModal>
  );
}
