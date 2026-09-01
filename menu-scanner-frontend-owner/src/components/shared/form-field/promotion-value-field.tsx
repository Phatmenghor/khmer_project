"use client";

import React from "react";
import { Controller, FieldValues } from "react-hook-form";
import { PromoValueFormFieldProps } from "./form-field-types";
import { CustomInput } from "./custom-input";

export function PromotionValueField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  promotionType,
  error,
  disabled = false,
  required = false,
}: PromoValueFormFieldProps<T>) {
  const suffix = promotionType === "PERCENTAGE" ? "%" : "$";
  const placeholder = promotionType === "PERCENTAGE" ? "0 - 100" : "Enter discount amount";

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, ...fieldProps } }) => (
        <CustomInput
          {...fieldProps}
          value={value ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            // Only allow numbers and decimal values with up to 2 decimal places
            if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
              onChange(val);
            }
          }}
          id={name}
          label={label}
          required={required}
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          rightIcon={
            promotionType ? (
              <span className="text-xs font-semibold text-muted-foreground select-none">
                {suffix}
              </span>
            ) : undefined
          }
          error={error?.message}
          size="sm"
        />
      )}
    />
  );
}
