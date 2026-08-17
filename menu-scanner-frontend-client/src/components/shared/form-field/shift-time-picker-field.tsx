"use client";

import React from "react";
import { Clock } from "lucide-react";
import { CustomTimePicker } from "@/components/shared/common/custom-time-picker";
import { cn } from "@/lib/utils";

interface ShiftTimePickerFieldProps {
  label: string;
  value?: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  iconColorClassName?: string;
  error?: string;
  className?: string;
}

export function ShiftTimePickerField({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select time",
  iconColorClassName = "text-primary",
  error,
  className,
}: ShiftTimePickerFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      <label className="text-[10px] font-extrabold text-muted-foreground flex items-center gap-1">
        <Clock className={cn("h-2.5 w-2.5", iconColorClassName)} />
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <CustomTimePicker
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        error={!!error}
      />
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
}
