"use client";

import React, { useState } from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown, X } from "lucide-react";
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
  error?: boolean;
  id?: string;
}

const CUSTOM_SELECT_SIZES = {
  sm: {
    button: "h-8 text-xs rounded-[10px] bg-muted/50 border border-border px-3 hover:bg-muted/65 hover:border-border focus:bg-background transition-all",
    icon: "h-3.5 w-3.5",
    item: "h-8 text-xs py-1 px-2.5 rounded-[8px]",
  },
  md: {
    button: "h-[36px] text-base md:text-sm rounded-[12px] bg-muted/50 border border-border px-3.5 hover:bg-muted/65 hover:border-border focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all duration-200",
    icon: "h-4 w-4",
    item: "h-8 text-xs py-1 px-2.5 rounded-[8px]",
  },
  lg: {
    button: "h-10 text-base md:text-sm rounded-[12px] bg-muted/50 border border-border px-3.5 hover:bg-muted/65 hover:border-border focus:bg-background transition-all",
    icon: "h-4 w-4",
    item: "h-8.5 text-xs py-1 px-2.5 rounded-[8px]",
  },
  xl: {
    button: "h-11 text-base md:text-sm rounded-[12px] bg-muted/50 border border-border px-3.5 hover:bg-muted/65 hover:border-border focus:bg-background transition-all",
    icon: "h-4 w-4",
    item: "h-9 text-sm py-1.5 px-3 rounded-[8px]",
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
  error = false,
  id,
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
        <Label className={cn(labelSizeClass, "font-semibold text-foreground leading-tight flex items-center min-h-[16px]")}>
          <span>{label}</span>
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <CustomButton
            id={id}
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between gap-1 transition-all duration-200 shadow-2xs",
              "border-input",
              "hover:bg-primary/10 hover:border-primary",
              "focus:bg-primary/10 focus:border-primary focus:ring-2 focus:ring-primary/20",
              open && "bg-primary/20 border-primary",
              sizeConfig.button,
              className,
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/30"
            )}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={label || "Select option"}
          >
            <span
              className={cn(
                "truncate flex-1 text-left",
                selectedOption ? "text-foreground font-medium" : "text-muted-foreground/75"
              )}
            >
              {selectedOption?.label || placeholder}
            </span>
            <div className="flex items-center gap-1 shrink-0 ml-1.5">
              {Boolean(value) &&
                String(value).toUpperCase() !== "ALL" &&
                String(value).trim() !== "" &&
                !disabled && (
                  <span
                    role="button"
                    tabIndex={0}
                    title="Clear selection"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const allOpt = options.find(
                        (opt) => String(opt.value).toUpperCase() === "ALL"
                      );
                      onValueChange(allOpt ? String(allOpt.value) : "");
                    }}
                    className="p-0.5 rounded-full hover:bg-destructive/15 hover:text-destructive text-muted-foreground/70 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
              <ChevronDown
                className={cn(
                  `${sizeConfig.icon} shrink-0 transition-all duration-200 text-muted-foreground/80`,
                  open && "text-primary rotate-180"
                )}
              />
            </div>
          </CustomButton>
        </PopoverTrigger>
        <PopoverContent
          className="min-w-[var(--radix-popover-trigger-width)] w-auto max-w-[90vw] sm:max-w-xs md:max-w-sm p-1.5 rounded-[12px] border border-border/80 bg-popover shadow-md z-50 pointer-events-auto"
          align="start"
          side="bottom"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div
            className="max-h-[300px] overflow-y-auto overscroll-contain touch-auto pointer-events-auto"
            role="listbox"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {options.length === 0 ? (
              <div className="p-2 text-xs text-muted-foreground text-center">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <CustomButton variant="unstyled" size="unstyled"
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    title={option.label}
                    onClick={() => {
                      if (!option.disabled) {
                        onValueChange(option.value);
                        setOpen(false);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 text-left transition-all my-0.5 select-none",
                      sizeConfig.item,
                      isSelected
                        ? "bg-primary/15 text-primary font-semibold border border-primary/20 shadow-2xs"
                        : "hover:bg-primary/10 hover:text-primary text-foreground",
                      option.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                    )}
                  >
                    <span className="whitespace-nowrap flex-1 text-left">{option.label}</span>
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 flex-shrink-0 transition-opacity",
                        isSelected ? "opacity-100 text-primary" : "opacity-0"
                      )}
                      aria-hidden="true"
                    />
                  </CustomButton>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
