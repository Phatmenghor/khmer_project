"use client";

import React from "react";
import {
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";
import { DatePickerFormFieldProps } from "./form-field-types";
import { Label } from "@/components/ui/label";
import { CustomDateTimePicker } from "../common/custom-date-picker";

export function DateTimePickerField<T extends FieldValues = any>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "Select date",
  className = "",
  mode = "date",
}: DatePickerFormFieldProps<T>) {
  return (
    <div className={`space-y-1.5`}>
      <Label
        htmlFor={name}
        className="text-xs sm:text-xs font-semibold text-foreground"
      >
        {label} {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        control={control}
        name={name as Path<T>}
        render={({ field }) => (
          <CustomDateTimePicker
            className={className}
            id={name}
            value={field.value || ""}
            onChange={field.onChange}
            disabled={disabled}
            placeholder={placeholder}
            error={!!error}
            mode={mode}
          />
        )}
      />
      {error && (
        <p className="text-xs text-destructive font-medium">{error?.message}</p>
      )}
    </div>
  );
}
