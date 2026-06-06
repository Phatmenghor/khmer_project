"use client";

import { Controller, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TextFormFieldProps } from "./form-field-types";

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
  valueAsNumber = false,
  min,
  max,
  step,
  allowZero = true,
  pattern,
  onCustomChange,
}: TextFormFieldProps<T>) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={name} className="text-xs font-medium text-foreground">
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


                if (isNaN(value)) {
                  field.onChange(undefined);
                  return;
                }


                if (value === 0 && !allowZero) {
                  field.onChange(undefined);
                  return;
                }


                field.onChange(value);
              } else if (type === "number" && !valueAsNumber) {

                const value = e.target.value;
                field.onChange(value === "" ? undefined : value);
              } else {

                let value = e.target.value;


                if (pattern) {
                  const regex = new RegExp(`^${pattern}*$`);
                  if (!regex.test(value)) {

                    return;
                  }
                }

                field.onChange(value);
                onCustomChange?.(value);
              }
            }}
            pattern={pattern}
            className={`h-[26px] transition-all duration-200 border ${disabled ? "bg-muted/50" : ""} ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-input focus:border-primary focus:ring-2 focus:ring-primary/30"
            }`}
          />
        )}
      />
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
