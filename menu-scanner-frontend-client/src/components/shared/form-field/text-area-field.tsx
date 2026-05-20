"use client";

import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps {
  name: string;
  label: string;
  control: any;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
}

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
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium">
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
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
