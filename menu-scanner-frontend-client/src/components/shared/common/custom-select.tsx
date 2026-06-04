"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  required?: boolean;
  layout?: "vertical" | "horizontal";
  labelSize?: "xs" | "sm" | "md";
}

const CUSTOM_SELECT_SIZES = {
  sm: {
    button: "h-5 text-xs",
    icon: "h-2 w-2",
    item: "text-xs py-1 px-1",
  },
  md: {
    button: "h-6 text-xs",
    icon: "h-3 w-3",
    item: "text-xs py-1 px-2",
  },
  lg: {
    button: "h-7 text-xs",
    icon: "h-3 w-3",
    item: "text-xs py-1 px-2",
  },
  xl: {
    button: "h-6 text-xs",
    icon: "h-3 w-3",
    item: "text-xs py-1 px-2",
  },
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
  layout = "vertical",
  labelSize = "xs",
}) => {
  const [open, setOpen] = useState(false);
  const sizeConfig = CUSTOM_SELECT_SIZES[size];
  const selectedOption = options.find((opt) => opt.value === value);

  const labelSizeClass = {
    xs: "text-xs",
    sm: "text-xs",
    md: "text-xs",
  }[labelSize];

  const wrapperClass = layout === "vertical"
    ? "flex flex-col gap-1 w-full"
    : "flex flex-row items-center gap-1 w-full";

  return (
    <div className={wrapperClass}>
      {label && (
        <Label className={cn(labelSizeClass, "font-semibold text-foreground")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between gap-1 transition-all duration-200",

              "border-input",

              "hover:bg-primary/10 hover:border-primary hover:text-primary",

              "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/30",

              open && "bg-primary/20 border-primary text-primary",
              sizeConfig.button,
              className,
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={label || "Select option"}
          >
            <span
              className={cn(
                "truncate",
                selectedOption ? "text-foreground" : "text-muted-foreground",

                open && "text-primary"
              )}
            >
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown
              className={cn(
                `${sizeConfig.icon} shrink-0 transition-all duration-200`,
                !open && "opacity-50",
                open && "opacity-100 text-primary rotate-180"
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          side="bottom"
        >
          <div className="max-h-[300px] overflow-y-auto" role="listbox">
            {options.length === 0 ? (
              <div className="p-2 text-xs text-muted-foreground text-center">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  disabled={option.disabled}
                  onClick={() => {
                    if (!option.disabled) {
                      onValueChange(option.value);
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-1 text-left transition-colors",
                    sizeConfig.item,
                    "hover:bg-primary/10 hover:text-primary",
                    value === option.value
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-foreground",
                    option.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  <Check
                    className={cn(
                      "h-3 w-3 flex-shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
