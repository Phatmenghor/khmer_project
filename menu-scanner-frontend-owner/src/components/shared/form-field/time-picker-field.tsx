"use client";

import { Controller, FieldValues } from "react-hook-form";
import type { TimePickerFormFieldProps } from "./form-field-types";
import { Label } from "@/components/ui/label";
import { CustomTimePicker } from "@/components/shared/common/custom-time-picker";

export function TimePickerField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "Select time",
  className = "",
}: TimePickerFormFieldProps<T>) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <Label htmlFor={name} className="text-xs font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <CustomTimePicker
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            placeholder={placeholder}
            error={!!error}
          />
        )}
      />
      <p className={`text-xs text-red-600 ${error?.message ? "min-h-[16px]" : ""}`}>{error?.message || ""}</p>
    </div>
  );
}
