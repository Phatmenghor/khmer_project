"use client";

import React from "react";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  FieldError,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { CustomDateTimePicker } from "../common/custom-date-picker";

interface DateTimePickerFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  mode?: "date" | "datetime";
}

export function DateTimePickerField<T extends FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "Select date",
  className = "",
  mode = "date",
}: DateTimePickerFieldProps<T>) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-[12px] font-normal text-gray-300">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <CustomDateTimePicker
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
      {error && <p className="text-xs text-red-500">{error?.message}</p>}
    </div>
  );
}
