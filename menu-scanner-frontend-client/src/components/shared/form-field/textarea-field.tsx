"use client";

import React from "react";
import { Controller, FieldError, Control, FieldValues, Path } from "react-hook-form";
import { Label } from "@/components/ui/label";

interface TextAreaFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function TextAreaField<T extends FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  placeholder = "",
  className = "",
  rows = 3,
}: TextAreaFieldProps<T>) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name as string} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <textarea
            {...field}
            value={field.value ?? ""}
            id={name as string}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={`w-full px-3 py-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-200 ${
              disabled ? "bg-muted/50 cursor-not-allowed" : ""
            } ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                : "border-input focus:border-primary focus:ring-2 focus:ring-primary/30"
            }`}
          />
        )}
      />
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
