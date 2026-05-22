"use client";

import { Controller } from "react-hook-form";
import type { TimePickerFormFieldProps } from "./form-field-types";
import { Label } from "@/components/ui/label";
import { CustomTimePicker } from "@/components/shared/common/custom-time-picker";

type TimePickerFieldProps = TimePickerFormFieldProps;

export function TimePickerField({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "Select time",
  className = "",
}: TimePickerFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium">
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
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
