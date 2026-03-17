"use client";

import React, { useEffect, useState } from "react";
import { Controller, FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DayOfWeek } from "@/types/business-profile";
import { Check } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: DayOfWeek.MONDAY, label: "Monday" },
  { value: DayOfWeek.TUESDAY, label: "Tuesday" },
  { value: DayOfWeek.WEDNESDAY, label: "Wednesday" },
  { value: DayOfWeek.THURSDAY, label: "Thursday" },
  { value: DayOfWeek.FRIDAY, label: "Friday" },
  { value: DayOfWeek.SATURDAY, label: "Saturday" },
  { value: DayOfWeek.SUNDAY, label: "Sunday" },
] as const;

// Default working days: Monday to Friday
const DEFAULT_WORK_DAYS = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
];

interface MultiSelectDaysFieldProps {
  name: string;
  label: string;
  control: any;
  error?: FieldError | any;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  defaultDays?: DayOfWeek[];
}

export function MultiSelectDaysField({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  className = "",
  defaultDays = DEFAULT_WORK_DAYS,
}: MultiSelectDaysFieldProps) {
  const hasError = !!error;
  const errorMessage =
    error?.message || (typeof error === "string" ? error : "");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <MultiSelectDaysContent
            field={field}
            label={label}
            hasError={hasError}
            errorMessage={errorMessage}
            disabled={disabled}
            required={required}
            className={className}
            defaultDays={defaultDays}
          />
        );
      }}
    />
  );
}

interface MultiSelectDaysContentProps {
  field: any;
  label: string;
  hasError: boolean;
  errorMessage: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  defaultDays: DayOfWeek[];
}

function MultiSelectDaysContent({
  field,
  label,
  hasError,
  errorMessage,
  disabled = false,
  required = false,
  className = "",
  defaultDays,
}: MultiSelectDaysContentProps) {
  // Local state to manage selected days - using DayOfWeek enum
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    (Array.isArray(field.value) && field.value.length > 0
      ? field.value
      : defaultDays) || defaultDays,
  );

  // Initialize with default days if field is empty
  useEffect(() => {
    const fieldValue = Array.isArray(field.value) ? field.value : [];
    if (fieldValue.length === 0) {
      setSelectedDays(defaultDays);
      field.onChange(defaultDays);
    } else {
      setSelectedDays(fieldValue);
    }
  }, []);

  // Sync local state with form when field value changes externally
  useEffect(() => {
    const fieldValue = Array.isArray(field.value) ? field.value : [];
    if (JSON.stringify(fieldValue) !== JSON.stringify(selectedDays)) {
      setSelectedDays(fieldValue);
    }
  }, [field.value]);

  // Handle day selection/deselection
  const handleToggleDay = (day: DayOfWeek) => {
    if (disabled) return;

    setSelectedDays((prevDays) => {
      let newDays: DayOfWeek[];
      if (prevDays.includes(day)) {
        newDays = prevDays.filter((d) => d !== day);
      } else {
        newDays = [...prevDays, day];
      }
      field.onChange(newDays);
      return newDays;
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <div
        className={cn(
          "flex flex-wrap gap-2 p-3 rounded-md border",
          hasError ? "border-red-500 bg-red-50" : "border-input bg-white",
        )}
      >
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDays.includes(day.value);

          return (
            <button
              key={day.value}
              type="button"
              onClick={() => handleToggleDay(day.value)}
              disabled={disabled}
              className={cn(
                "px-3 py-2 rounded-md border text-sm font-medium transition-colors flex items-center gap-2",
                isSelected
                  ? "bg-primary/10 text-primary border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              {isSelected && <Check className="w-4 h-4" />}
              {day.label}
            </button>
          );
        })}
      </div>

      {hasError && errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
