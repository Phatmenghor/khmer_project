"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomCheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "accent" | "outline";
  label?: string;
  title?: string;
  ariaLabel?: string;
}

/**
 * CustomCheckbox - Fully customizable checkbox without shadcn/ui dependency
 * @param checked - Whether checkbox is checked
 * @param onCheckedChange - Callback when checkbox state changes
 * @param disabled - Whether checkbox is disabled
 * @param id - HTML id attribute
 * @param className - Additional CSS classes
 * @param size - Size variant: sm (16px), md (20px), lg (24px), xl (32px)
 * @param variant - Style variant: default, accent, outline
 * @param label - Optional label text
 * @param title - Tooltip text
 * @param ariaLabel - ARIA label for accessibility
 */
export function CustomCheckbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  id,
  className = "",
  size = "md",
  variant = "default",
  label,
  title,
  ariaLabel,
}: CustomCheckboxProps) {
  // Size configuration
  const sizeConfig = {
    sm: {
      box: "w-4 h-4",
      innerBox: "w-2 h-2",
      icon: "w-3 h-3",
      text: "text-xs",
    },
    md: {
      box: "w-5 h-5",
      innerBox: "w-2.5 h-2.5",
      icon: "w-4 h-4",
      text: "text-sm",
    },
    lg: {
      box: "w-6 h-6",
      innerBox: "w-3 h-3",
      icon: "w-5 h-5",
      text: "text-base",
    },
    xl: {
      box: "w-8 h-8",
      innerBox: "w-4 h-4",
      icon: "w-6 h-6",
      text: "text-lg",
    },
  };

  // Variant configuration (shadcn/ui style)
  const variantConfig = {
    default: {
      unchecked:
        "bg-white border border-input hover:border-input/80",
      checked:
        "bg-primary border-2 border-primary hover:bg-primary/90 hover:border-primary/90",
      icon: "text-white",
    },
    accent: {
      unchecked:
        "bg-white border border-input hover:border-input/80",
      checked:
        "bg-primary border-2 border-primary hover:bg-primary/90 hover:border-primary/90",
      icon: "text-white",
    },
    outline: {
      unchecked:
        "bg-white border border-input hover:border-input/80",
      checked:
        "bg-primary border-2 border-primary hover:bg-primary/90 hover:border-primary/90",
      icon: "text-white",
    },
  };

  const config = sizeConfig[size];
  const varConfig = variantConfig[variant];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  const baseCheckboxClass = cn(
    "relative inline-flex items-center justify-center rounded transition-all duration-200 cursor-pointer",
    config.box,
    checked ? varConfig.checked : varConfig.unchecked,
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  const checkboxContent = (
    <>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="absolute w-full h-full opacity-0 cursor-pointer"
        aria-label={ariaLabel || label}
        title={title}
      />
      {checked ? (
        <Check className={cn(config.icon, varConfig.icon, "pointer-events-none")} />
      ) : (
        <div className={cn(config.innerBox, "bg-gray-300 rounded transition-all duration-200 pointer-events-none")} />
      )}
    </>
  );

  // Wrapper for label (if provided)
  if (label) {
    return (
      <div className="flex items-center gap-2">
        <div className={baseCheckboxClass} title={title}>
          {checkboxContent}
        </div>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              config.text,
              "font-medium text-gray-700 cursor-pointer select-none",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }

  // Checkbox only (no label)
  return (
    <div className={baseCheckboxClass} title={title}>
      {checkboxContent}
    </div>
  );
}
