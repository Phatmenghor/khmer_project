"use client";

import React from "react";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  FieldError,
} from "react-hook-form";
import { Label } from "@/components/ui/label";

interface PromotionValueFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  promotionType?: "FIXED_AMOUNT" | "PERCENTAGE";
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function PromotionValueField<T extends FieldValues>({
  name,
  label,
  control,
  promotionType,
  error,
  disabled = false,
  required = false,
  className = "",
}: PromotionValueFieldProps<T>) {
  const suffix = promotionType === "PERCENTAGE" ? "%" : "$";
  const placeholder = promotionType === "PERCENTAGE" ? "0-100" : "Amount";

  return (
    <div className="space-y-2">
      <Label
        htmlFor={name}
        className="text-xs sm:text-sm font-semibold text-foreground px-0.5"
      >
        {label} {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div
            className={`relative h-10 overflow-hidden rounded-md border border-border hover:border-primary/50 transition-colors duration-200 ${className}`}
          >
            <input
              {...field}
              id={name}
              type="number"
              placeholder={placeholder}
              step="0.01"
              min="0"
              max={promotionType === "PERCENTAGE" ? "100" : ""}
              disabled={disabled}
              className="w-full h-full px-3 sm:px-4 py-2 sm:py-2.5 border-0 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset transition-all bg-background"
            />
            {promotionType && (
              <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-semibold text-muted-foreground pointer-events-none">
                {suffix}
              </span>
            )}
          </div>
        )}
      />
      {error && (
        <p className="text-xs text-destructive font-medium px-0.5">
          {error?.message}
        </p>
      )}
    </div>
  );
}
