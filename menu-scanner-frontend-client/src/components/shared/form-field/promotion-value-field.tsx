"use client";

import React from "react";
import {
  Controller,
  FieldValues,
} from "react-hook-form";
import { PromoValueFormFieldProps } from "./form-field-types";
import { Label } from "@/components/ui/label";

export function PromotionValueField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  promotionType,
  error,
  disabled = false,
  required = false,
  className = "",
}: PromoValueFormFieldProps<T>) {
  const suffix = promotionType === "PERCENTAGE" ? "%" : "$";
  const placeholder = promotionType === "PERCENTAGE" ? "0-100" : "Amount";

  return (
    <div className="space-y-1">
      <Label
        htmlFor={name}
        className="text-xs sm:text-xs font-semibold text-foreground px-0.5"
      >
        {label} {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div
            className={`relative h-7 overflow-hidden rounded border border-border hover:border-primary/50 transition-colors duration-200 ${className}`}
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
              className="w-full h-full px-2 sm:px-3 py-1 sm:py-1 border-0 text-xs sm:text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset transition-all bg-background"
            />
            {promotionType && (
              <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs sm:text-xs font-semibold text-muted-foreground pointer-events-none">
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
