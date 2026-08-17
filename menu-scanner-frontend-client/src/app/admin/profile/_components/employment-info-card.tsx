"use client";

import { Briefcase, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { formatDate } from "@/utils/date/date-time-format";

interface EmploymentInfoCardProps {
  control: any;
  errors: any;
  isEditing: boolean;
  watch: (name: string) => any;
}

export function EmploymentInfoCard({
  control,
  errors,
  isEditing,
  watch,
}: EmploymentInfoCardProps) {
  const leaveBalance = watch("leaveBalance");

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-extrabold flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary shrink-0" />
          <span>Employment Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isEditing ? (
            <>
              <TextField
                control={control}
                name="employeeId"
                label="Employee ID"
                placeholder="Employee ID"
                error={errors.employeeId}
              />
              <TextField
                control={control}
                name="position"
                label="Position"
                placeholder="Position"
                error={errors.position}
              />
              <TextField
                control={control}
                name="department"
                label="Department"
                placeholder="Department"
                error={errors.department}
              />
              <DateTimePickerField
                control={control}
                name="joinDate"
                label="Join Date"
                mode="date"
                placeholder="Join date"
                error={errors.joinDate}
              />
              <DateTimePickerField
                control={control}
                name="leaveDate"
                label="Leave Date"
                mode="date"
                placeholder="Leave date"
                error={errors.leaveDate}
              />
            </>
          ) : (
            <>
              <DisplayField label="Employee ID" value={watch("employeeId")} />
              <DisplayField label="Position" value={watch("position")} />
              <DisplayField label="Department" value={watch("department")} />
              <DisplayField label="Join Date" value={formatDate(watch("joinDate"))} />
              <DisplayField label="Leave Date" value={formatDate(watch("leaveDate"))} />
            </>
          )}
        </div>

        {/* API Managed Staff Leave Quotas & Balances Card */}
        {leaveBalance && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-primary">
                <CalendarCheck className="w-4 h-4" />
                <span>Leave Entitlements ({leaveBalance.targetYear || new Date().getFullYear()})</span>
              </div>
              {leaveBalance.isProRated !== undefined && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {leaveBalance.isProRated ? "Pro-Rated Allowance" : "Full Year Allowance"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-card border border-border/60 text-center">
                <span className="text-[10px] text-muted-foreground font-medium block">Annual Leave</span>
                <span className="text-xs font-black text-foreground">{leaveBalance.remainingAnnualLeave ?? leaveBalance.annualLeaveQuota ?? 0} Days Remaining</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Used: {leaveBalance.usedAnnualLeave || 0} / Total: {leaveBalance.annualLeaveQuota || 0}</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-border/60 text-center">
                <span className="text-[10px] text-muted-foreground font-medium block">Sick Leave</span>
                <span className="text-xs font-black text-foreground">{leaveBalance.remainingSickLeave ?? leaveBalance.sickLeaveQuota ?? 0} Days Remaining</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Used: {leaveBalance.usedSickLeave || 0} / Total: {leaveBalance.sickLeaveQuota || 0}</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-border/60 text-center">
                <span className="text-[10px] text-muted-foreground font-medium block">Special Leave</span>
                <span className="text-xs font-black text-foreground">{leaveBalance.remainingSpecialLeave ?? leaveBalance.specialLeaveQuota ?? 0} Days Remaining</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Used: {leaveBalance.usedSpecialLeave || 0} / Total: {leaveBalance.specialLeaveQuota || 0}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
