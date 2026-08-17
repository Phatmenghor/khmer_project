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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                      "p-2.5 rounded-lg border flex items-center justify-between gap-2 text-left",
                      isEnabled
                        ? "bg-card border-border/80"
                        : "bg-muted/20 border-border/40 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-[110px]">
                      {isEnabled ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-foreground">{d.label}</span>
                    </div>

                    {isEnabled ? (
                      <div className="flex flex-col text-right text-xs">
                        <span className="font-medium text-foreground">
                          Shift: {startTime && endTime ? `${formatTime(startTime)} - ${formatTime(endTime)}` : "Unset"}
                        </span>
                        {breakStart && breakEnd ? (
                          <span className="text-[11px] text-muted-foreground">
                            Break: {formatTime(breakStart)} - {formatTime(breakEnd)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Break: None</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Off Day</span>
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
