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
}: TextFormFieldProps<T>) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <Label htmlFor={name} className={`text-xs font-medium text-foreground ${labelClassName}`}>
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
            className={cn(
              disabled && "bg-muted/50",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
              inputClassName
            )}
          />
        )}
      />
      <p className={`text-xs text-red-500 ${error?.message ? "min-h-[16px]" : ""}`}>{error?.message || ""}</p>
    </div>
  );
}
