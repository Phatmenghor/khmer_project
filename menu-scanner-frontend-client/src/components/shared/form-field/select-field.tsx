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
                    "w-full justify-between h-10 px-3 transition-all duration-200 border-input",
                    // Hover state
                    "hover:bg-primary/10 hover:border-primary hover:text-primary",
                    // Focus state
                    "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/30",
                    // Active/Open state
                    open && "bg-primary/20 border-primary text-primary",
                    // Error state
                    error && "border-red-500 focus:border-red-500",
                    // Disabled state
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
                    "ml-2 h-4 w-4 shrink-0 transition-all duration-200",
                    !open && "opacity-50",
                    open && "opacity-100 text-primary rotate-180"
                  )} />
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
                        "w-full flex items-center gap-2 px-3 py-2 text-sm text-left cursor-pointer transition-colors",
                        "hover:bg-primary/10 hover:text-primary/50",
                        currentValue === option.value
                          ? "bg-primary/20 text-primary/50 font-medium"
                          : "text-foreground"
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
