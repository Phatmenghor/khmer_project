"use client";

import React from "react";
import { Controller, FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TextareaFieldProps } from ".";

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
}: TextareaFieldProps<T>) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <Label htmlFor={name} className="text-xs font-semibold text-foreground leading-tight flex items-center min-h-[16px]">
          <span>{label}</span>
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
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
              error ? "border-destructive focus:border-destructive" : ""
            }`}
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
