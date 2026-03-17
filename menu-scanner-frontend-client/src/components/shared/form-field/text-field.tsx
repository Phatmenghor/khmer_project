"use client";

import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextFieldProps {
  name: string;
  label: string;
  control: any;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  type?:
    | "text"
    | "email"
    | "tel"
    | "password"
    | "number"
    | "url"
    | "datetime-local";
  placeholder?: string;
  className?: string;
  valueAsNumber?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
  allowZero?: boolean; // New prop: whether 0 is a valid value (default true)
}

export function TextField({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  type = "text",
  placeholder = "",
  className = "",
  valueAsNumber = false,
  min,
  max,
  step,
  allowZero = true, // Default: 0 is valid
}: TextFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ""}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            autoComplete="off"
            onChange={(e) => {
              if (valueAsNumber && type === "number") {
                const value = e.target.valueAsNumber;

                // Handle empty input (NaN)
                if (isNaN(value)) {
                  field.onChange(undefined);
                  return;
                }

                // Handle zero based on allowZero prop
                if (value === 0 && !allowZero) {
                  field.onChange(undefined);
                  return;
                }

                // Valid number (including 0 if allowZero is true)
                field.onChange(value);
              } else if (type === "number" && !valueAsNumber) {
                // Return string representation for number inputs without valueAsNumber
                const value = e.target.value;
                field.onChange(value === "" ? undefined : value);
              } else {
                // For non-number types
                field.onChange(e.target.value);
              }
            }}
            className={`transition-colors ${disabled ? "bg-muted/50" : ""} ${
              error ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
        )}
      />
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
