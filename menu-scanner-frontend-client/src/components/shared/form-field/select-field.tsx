"use client";

import React from "react";
import { Controller, FieldValues } from "react-hook-form";
import { SelectFormFieldProps } from "./form-field-types";
import { CustomSelect } from "@/components/shared/common/custom-select";

interface SelectFieldProps<T extends FieldValues = FieldValues> extends SelectFormFieldProps<T> {
  loading?: boolean;
  loadingPlaceholder?: string;
}

export function SelectField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  options,
  placeholder = "Select an option",
  onValueChange,
  className = "",
  loading = false,
  loadingPlaceholder = "Loading...",
}: SelectFieldProps<T>) {
  // Convert standard options (value: string | number) to CustomSelect options (value: string)
  const mappedOptions = options.map((opt) => ({
    value: String(opt.value),
    label: opt.label,
  }));

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          // Normalize React Hook Form value to string
          const currentValue = Array.isArray(field.value)
            ? String(field.value[0] ?? "")
            : String(field.value ?? "");

          return (
            <CustomSelect
              id={name as string}
              label={label}
              required={required}
              options={mappedOptions}
              value={currentValue}
              placeholder={loading ? loadingPlaceholder : placeholder}
              disabled={disabled || loading}
              error={!!error}
              onValueChange={(val) => {
                // Find the original option to preserve the original value type (string or number)
                const originalOption = options.find((opt) => String(opt.value) === val);
                const selectedValue = originalOption ? originalOption.value : val;

                if (onValueChange) {
                  onValueChange(selectedValue);
                } else {
                  field.onChange(selectedValue);
                }
              }}
            />
          );
        }}
      />
      <p className={`text-xs text-red-500 ${error?.message ? "min-h-[16px]" : ""}`}>
        {error?.message || ""}
      </p>
    </div>
  );
}
