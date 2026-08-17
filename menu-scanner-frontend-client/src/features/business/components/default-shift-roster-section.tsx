"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { BASE_WEEK_DAYS } from "@/constants/week-days";
import { DayDutyHeaderField } from "@/components/shared/form-field/day-duty-header-field";
import { ShiftTimePickerField } from "@/components/shared/form-field/shift-time-picker-field";
import { CustomSwitch } from "@/components/shared/common/custom-switch";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

function SectionHeader({ icon: Icon, title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/40">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-foreground tracking-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface DefaultShiftRosterSectionProps {
  dayShifts: any[];
  onUpdateDayShift: (index: number, field: any, value: any) => void;
  disabled?: boolean;
  className?: string;
}

export function DefaultShiftRosterSection({
  dayShifts,
  onUpdateDayShift,
  disabled = false,
  className,
}: DefaultShiftRosterSectionProps) {
  return (
    <div className={cn("rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs", className)}>
      <SectionHeader
        icon={Calendar}
        title="Staff Working Time (Default Per-Day Shift Roster)"
        subtitle="Dynamic per-day shift working hours and attendance scan rules used when creating new staff schedules"
      />

      <div className="space-y-2.5 pt-1">
        {BASE_WEEK_DAYS.map((wDay, idx) => {
          const dayConfig = dayShifts[idx];
          const isEnabled = Boolean(dayConfig?.enabled);
          const isCheckInEnabled = dayConfig?.enableCheckIn !== false;
          const currentScanMode = dayConfig?.scanMode || "FULL_TIME";

          return (
            <div
              key={wDay.day}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("input, button, [role='combobox'], [role='switch']")) return;
                onUpdateDayShift(idx, "enabled", !isEnabled);
              }}
              className={cn(
                "p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col gap-3 cursor-pointer select-none bg-card",
                isEnabled
                  ? "border-primary/40 shadow-2xs hover:border-primary/60"
                  : "border-border/60 hover:border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <DayDutyHeaderField
                  label={wDay.label}
                  enabled={isEnabled}
                  onToggle={() => onUpdateDayShift(idx, "enabled", !isEnabled)}
                  disabled={disabled}
                  showCheckbox={true}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border transition-colors",
                    isEnabled
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted/30 text-muted-foreground border-border/40"
                  )}
                >
                  {isEnabled ? "Working Day" : "Off Day"}
                </span>
              </div>

              {isEnabled && (
                <div
                  className="flex flex-col gap-3 w-full pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 4 Shift Time Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 flex-1 items-center">
                    <ShiftTimePickerField
                      label="Start Time"
                      required={true}
                      value={dayConfig?.startTime || ""}
                      onChange={(val) => onUpdateDayShift(idx, "startTime", val)}
                      disabled={disabled}
                      placeholder="Select time"
                      iconColorClassName="text-primary"
                    />

                    <ShiftTimePickerField
                      label="End Time"
                      required={true}
                      value={dayConfig?.endTime || ""}
                      onChange={(val) => onUpdateDayShift(idx, "endTime", val)}
                      disabled={disabled}
                      placeholder="Select time"
                      iconColorClassName="text-primary"
                    />

                    <ShiftTimePickerField
                      label="Break Start"
                      required={false}
                      value={dayConfig?.breakStartTime || ""}
                      onChange={(val) => onUpdateDayShift(idx, "breakStartTime", val)}
                      disabled={disabled}
                      placeholder="Optional"
                      iconColorClassName="text-muted-foreground"
                    />

                    <ShiftTimePickerField
                      label="Break End"
                      required={false}
                      value={dayConfig?.breakEndTime || ""}
                      onChange={(val) => onUpdateDayShift(idx, "breakEndTime", val)}
                      disabled={disabled}
                      placeholder="Optional"
                      iconColorClassName="text-muted-foreground"
                    />
                  </div>

                  {/* Per-Day Attendance Scan Mode Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <CustomSwitch
                        checked={isCheckInEnabled}
                        onCheckedChange={(checked) => onUpdateDayShift(idx, "enableCheckIn", checked)}
                        disabled={disabled}
                      />
                      <span className="text-xs font-bold text-foreground">Scan / Check-in Required</span>
                    </div>

                    {isCheckInEnabled && (
                      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
                        <button
                          type="button"
                          onClick={() => onUpdateDayShift(idx, "scanMode", "FULL_TIME")}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border",
                            currentScanMode === "FULL_TIME"
                              ? "bg-primary text-primary-foreground border-primary shadow-2xs font-extrabold"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                          disabled={disabled}
                        >
                          Full Time (2 Scans)
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateDayShift(idx, "scanMode", "FOUR_TIMES")}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border",
                            currentScanMode === "FOUR_TIMES"
                              ? "bg-primary text-primary-foreground border-primary shadow-2xs font-extrabold"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                          disabled={disabled}
                        >
                          4 Times (4 Scans)
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateDayShift(idx, "scanMode", "HALF_TIME")}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border",
                            currentScanMode === "HALF_TIME"
                              ? "bg-primary text-primary-foreground border-primary shadow-2xs font-extrabold"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                          disabled={disabled}
                        >
                          Half Time
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
