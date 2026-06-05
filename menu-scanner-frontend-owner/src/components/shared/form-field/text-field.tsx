"use client";

import React from "react";
import { Controller, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextFieldProps } from ".";

export function TextField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  type = "text",
  placeholder = "",
  className = "",
}: TextFieldProps<T>) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={name} className="text-xs sm:text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value || ""}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            className={`transition-colors ${disabled ? "bg-muted/50" : ""} ${
              error ? "border-destructive focus:border-destructive" : ""
            }`}
          />
        )}
      />
      {error && <p className="text-xs text-destructive font-medium">{error.message}</p>}
    </div>
  );
}
