"use client";

import { Controller, FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TextareaFormFieldProps } from "./form-field-types";

export function TextareaField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "",
  rows = 3,
  className = "",
}: TextareaFormFieldProps<T>) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <Label htmlFor={name} className="text-xs font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Textarea
            {...field}
            value={field.value || ""}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={`transition-colors resize-none ${
              error ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
        )}
      />
      <p className={`text-xs text-red-600 ${error?.message ? "min-h-[16px]" : ""}`}>{error?.message || ""}</p>
    </div>
  );
}
