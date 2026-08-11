"use client";

import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { EMPLOYMENT_TYPE_OPTIONS } from "@/constants/form-options";
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
  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-extrabold flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary shrink-0" />
          <span>Employment Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
              <SelectField
                control={control}
                name="employmentType"
                label="Employment Type"
                placeholder="Select type"
                options={EMPLOYMENT_TYPE_OPTIONS}
                error={errors.employmentType}
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
              <TextField
                control={control}
                name="shift"
                label="Shift"
                placeholder="Shift"
                error={errors.shift}
              />
            </>
          ) : (
            <>
              <DisplayField label="Employee ID" value={watch("employeeId")} />
              <DisplayField label="Position" value={watch("position")} />
              <DisplayField label="Department" value={watch("department")} />
              <DisplayField
                label="Employment Type"
                value={
                  EMPLOYMENT_TYPE_OPTIONS.find(
                    (o) => o.value === watch("employmentType")
                  )?.label
                }
              />
              <DisplayField label="Join Date" value={formatDate(watch("joinDate"))} />
              <DisplayField label="Leave Date" value={formatDate(watch("leaveDate"))} />
              <DisplayField label="Shift" value={watch("shift")} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
