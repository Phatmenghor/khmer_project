"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TextareaFieldProps } from ".";

export function TextareaField({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  placeholder = "",
  rows = 3,
  className = "",
}: TextareaFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={name} className="text-xs sm:text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
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
              error ? "border-destructive focus:border-destructive" : ""
            }`}
          />
        )}
      />
      {error && <p className="text-xs text-destructive font-medium">{error.message}</p>}
    </div>
  );
}
