"use client";

import React, { useEffect, useState } from "react";
import { Controller, ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { MultiSelectDaysFieldProps } from "./form-field-types";
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


const DEFAULT_WORK_DAYS = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
];

interface MultiSelectDaysFieldPropsWithDefaults<T extends FieldValues = FieldValues> extends MultiSelectDaysFieldProps<T> {
  defaultDays?: DayOfWeek[];
}

export function MultiSelectDaysField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  className = "",
  defaultDays = DEFAULT_WORK_DAYS,
}: MultiSelectDaysFieldPropsWithDefaults<T>) {
  const hasError = !!error;
  const errorMessage =
    error?.message || (typeof error === "string" ? error : "");

  return (
    <Controller
      control={control}
      name={name as Path<T>}
      render={({ field }) => {
        return (
          <MultiSelectDaysContent
            field={field as unknown as ControllerRenderProps<FieldValues>}
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
  field: ControllerRenderProps<FieldValues>;
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

  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    (Array.isArray(field.value) && field.value.length > 0
      ? field.value
      : defaultDays) || defaultDays,
  );


  useEffect(() => {
    const fieldValue = Array.isArray(field.value) ? field.value : [];
    if (fieldValue.length === 0) {
      setSelectedDays(defaultDays);
      field.onChange(defaultDays);
    } else {
      setSelectedDays(fieldValue);
    }
  }, []);


  useEffect(() => {
    const fieldValue = Array.isArray(field.value) ? field.value : [];
    if (JSON.stringify(fieldValue) !== JSON.stringify(selectedDays)) {
      setSelectedDays(fieldValue);
    }
  }, [field.value]);


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
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <div
        className={cn(
          "flex flex-wrap gap-1 p-2 rounded border",
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
                "px-2 py-1 rounded border text-xs font-medium transition-colors flex items-center gap-1",
                isSelected
                  ? "bg-primary/10 text-primary border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              {isSelected && <Check className="w-3 h-3" />}
              {day.label}
            </button>
          );
        })}
      </div>

      <p className={`text-xs text-red-600 ${errorMessage ? "min-h-[16px]" : ""}`}>{errorMessage || ""}</p>
    </div>
  );
}
