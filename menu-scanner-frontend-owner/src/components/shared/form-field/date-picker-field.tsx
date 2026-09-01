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

export function DateTimePickerField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "Select date",
  className = "",
  mode = "date",
  inputClassName = "",
}: DatePickerFormFieldProps<T> & { inputClassName?: string }) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <Label
        htmlFor={name}
        className="text-xs font-semibold text-foreground leading-tight flex items-center min-h-[16px]"
      >
        <span>{label}</span>
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Controller
        control={control}
        name={name as Path<T>}
        render={({ field }) => (
          <CustomDateTimePicker
            className={inputClassName}
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
      {error?.message && (
        <p className="text-xs text-destructive font-medium mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}

export const DatePickerField = DateTimePickerField;

