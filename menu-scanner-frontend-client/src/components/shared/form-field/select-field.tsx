"use client";

import React, { useState } from "react";
import { Controller, FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectFieldProps } from ".";

export function SelectField<T extends FieldValues = any>({
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
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          // Handle array values (for roles field)
          const currentValue = Array.isArray(field.value)
            ? field.value[0] ?? ""
            : field.value ?? "";

          const selectedOption = options.find((opt) => opt.value === currentValue);

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id={name as string}
                  variant="outline"
                  role="combobox"
                  disabled={disabled || loading}
                  className={cn(
                    "w-full justify-between h-10 px-3 transition-colors",
                    error && "border-red-500 focus:border-red-500"
                  )}
                >
                  <span
                    className={
                      selectedOption ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {loading
                      ? loadingPlaceholder
                      : selectedOption?.label || placeholder}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <div className="max-h-[300px] overflow-y-auto">
                  {options.map((option) => (
                    <button
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
                        "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                        currentValue === option.value && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          currentValue === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        }}
      />
      {error && <p className="text-sm text-red-600">{error?.message}</p>}
    </div>
  );
}
