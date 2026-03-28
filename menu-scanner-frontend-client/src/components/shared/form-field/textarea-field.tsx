"use client";

import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";

interface TextAreaFieldProps {
  name: string;
  label: string;
  control: any;
  error?: FieldError;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function TextAreaField({
  name,
  label,
  control,
  error,
  disabled = false,
  placeholder = "",
  className = "",
  rows = 3,
}: TextAreaFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <textarea
            {...field}
            value={field.value ?? ""}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={`w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
              disabled ? "bg-muted/50 cursor-not-allowed" : ""
            } ${error ? "border-red-500 focus:ring-red-500" : ""}`}
          />
        )}
      />
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
