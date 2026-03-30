"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  required?: boolean;
}

const CUSTOM_SELECT_SIZES = {
  sm: "h-8 text-xs",
  md: "h-9 text-sm",
  lg: "h-10 text-base",
} as const;

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value = "",
  placeholder = "Select option",
  onValueChange,
  className = "",
  disabled = false,
  size = "md",
  label,
  required = false,
}) => {
  const sizeClass = CUSTOM_SELECT_SIZES[size];

  return (
    <div className="space-y-2 w-full">
      {label && (
        <Label className="text-xs sm:text-sm font-semibold text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Select
        value={value || ""}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={`min-w-[150px] ${sizeClass} ${className}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={sizeClass}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
