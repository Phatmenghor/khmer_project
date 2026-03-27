"use client";

import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { SelectFieldProps } from ".";
import { cn } from "@/lib/utils";

export function SelectField({
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
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

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
            ? field.value[0] || ""
            : field.value || "";

          const selectedOption = options.find((opt) => opt.value === currentValue);

          return (
            <div className="relative w-full">
              <button
                id={name}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled || loading}
                className={cn(
                  "w-full flex items-center justify-between h-10 px-3 py-2 text-sm rounded-md border bg-transparent transition-colors",
                  "text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  error ? "border-red-500 focus:border-red-500" : "border-input"
                )}
              >
                <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
                  {loading ? loadingPlaceholder : selectedOption?.label || placeholder}
                </span>
                <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
              </button>

              {isOpen && !disabled && (
                <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-popover border rounded-md shadow-md max-h-56 overflow-y-auto">
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
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                        currentValue === option.value && "bg-accent text-accent-foreground"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }}
      />
      {error && <p className="text-sm text-red-600">{error?.message}</p>}
    </div>
  );
}
