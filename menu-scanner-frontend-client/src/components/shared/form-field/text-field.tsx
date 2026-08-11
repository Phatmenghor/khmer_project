"use client";

import { Controller, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
  inputClassName = "",
  labelClassName = "",
  autoComplete,
}: TextFormFieldProps<T>) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <Label htmlFor={name} className={cn("text-xs font-semibold text-foreground leading-tight flex items-center min-h-[16px]", labelClassName)}>
        <span>{label}</span>
        {required && <span className="text-destructive ml-0.5">*</span>}
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
            autoComplete={autoComplete || "off"}
            onChange={(e) => {
              const raw = e.target.value;
              if (valueAsNumber) {
                if (raw === "") {
                  field.onChange(undefined);
                  onCustomChange?.("");
                  return;
                }
                if (/^\d*\.?\d{0,2}$/.test(raw)) {
                  const num = parseFloat(raw);
                  if (isNaN(num)) {
                    field.onChange(undefined);
                    onCustomChange?.(raw);
                  } else if (num === 0 && !allowZero) {
                    field.onChange(undefined);
                    onCustomChange?.(raw);
                  } else {
                    field.onChange(num);
                    onCustomChange?.(raw);
                  }
                }
              } else if (type === "number" || step === "0.01" || step === 0.01) {
                if (raw === "" || /^\d*\.?\d{0,2}$/.test(raw)) {
                  field.onChange(raw === "" ? undefined : raw);
                  onCustomChange?.(raw);
                }
              } else {
                let value = raw;
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
            pattern={pattern ? `${pattern}*` : undefined}
            className={cn(
              disabled && "bg-muted/50",
              error && "border-destructive focus:border-destructive",
              inputClassName
            )}
          />
        )}
      />
      {error?.message && <p className="text-xs text-destructive font-medium mt-1">{error.message}</p>}
    </div>
  );
}
