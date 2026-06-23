"use client";

import React, { useState } from "react";
import { Controller, FieldValues } from "react-hook-form";
import { SelectFormFieldProps } from "./form-field-types";
import { Label } from "@/components/ui/label";
import { CustomButton } from "@/components/shared/button/custom-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectFieldProps<T extends FieldValues = FieldValues> extends SelectFormFieldProps<T> {
  loading?: boolean;
  loadingPlaceholder?: string;
}

export function SelectField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  options,
  placeholder = "Select an option",
  onValueChange,
  className = "",
  loading = false,
  loadingPlaceholder = "Loading...",
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <Label htmlFor={name} className="text-xs font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {

          const currentValue = Array.isArray(field.value)
            ? field.value[0] ?? ""
            : field.value ?? "";

          const selectedOption = options.find((opt) => opt.value === currentValue);

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <CustomButton
                  id={name as string}
                  variant="outline"
                  role="combobox"
                  disabled={disabled || loading}
                  className={cn(
                    "w-full justify-between h-[32px] px-3 text-base md:text-sm font-normal transition-all duration-200 border-input",

                    "hover:bg-primary/10 hover:border-primary hover:text-primary",

                    "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/20",

                    open && "bg-primary/20 border-primary text-primary",

                    error && "border-red-500 focus:border-red-500",

                    disabled || loading ? "opacity-50 cursor-not-allowed" : ""
                  )}
                >
                  <span
                    className={cn(
                      selectedOption ? "text-foreground" : "text-muted-foreground",
                      open && "text-primary"
                    )}
                  >
                    {loading
                      ? loadingPlaceholder
                      : selectedOption?.label || placeholder}
                  </span>
                  <ChevronDown className={cn(
                    "ml-1 h-4 w-4 shrink-0 transition-all duration-200",
                    !open && "opacity-50",
                    open && "opacity-100 text-primary rotate-180"
                  )} />
                </CustomButton>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <div className="max-h-[300px] overflow-y-auto">
                  {options.map((option) => (
                    <CustomButton variant="unstyled" size="unstyled"
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (onValueChange) {
                          onValueChange(option.value);
                        } else {
                          field.onChange(option.value);
                        }
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-1 px-2 py-1 text-xs text-left cursor-pointer transition-colors",
                        "hover:bg-primary/10 hover:text-primary/50",
                        currentValue === option.value
                          ? "bg-primary/20 text-primary/50 font-medium"
                          : "text-foreground"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3 w-3",
                          currentValue === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CustomButton>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        }}
      />
      <p className={`text-xs text-red-600 ${error?.message ? "min-h-[16px]" : ""}`}>{error?.message || ""}</p>
    </div>
  );
}
