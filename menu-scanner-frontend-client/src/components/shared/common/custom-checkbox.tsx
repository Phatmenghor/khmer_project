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
  size?: "sm" | "md" | "lg";
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
 * @param size - Size variant: sm (16px), md (20px), lg (24px)
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
      icon: "w-3 h-3",
      text: "text-xs",
    },
    md: {
      box: "w-5 h-5",
      icon: "w-4 h-4",
      text: "text-sm",
    },
    lg: {
      box: "w-6 h-6",
      icon: "w-5 h-5",
      text: "text-base",
    },
  };

  // Variant configuration
  const variantConfig = {
    default: {
      unchecked:
        "bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50",
      checked:
        "bg-blue-600 border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700",
      icon: "text-white",
    },
    accent: {
      unchecked:
        "bg-white border-2 border-purple-300 hover:border-purple-400 hover:bg-purple-50",
      checked:
        "bg-purple-600 border-2 border-purple-600 hover:bg-purple-700 hover:border-purple-700",
      icon: "text-white",
    },
    outline: {
      unchecked:
        "bg-transparent border-2 border-gray-400 hover:border-gray-500 hover:bg-gray-100",
      checked:
        "bg-gray-800 border-2 border-gray-800 hover:bg-gray-900 hover:border-gray-900",
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

  // Wrapper for label (if provided)
  if (label) {
    return (
      <div className="flex items-center gap-2">
        <div className={baseCheckboxClass} title={title}>
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
          {checked && (
            <Check className={cn(config.icon, varConfig.icon, "pointer-events-none")} />
          )}
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
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="absolute w-full h-full opacity-0 cursor-pointer"
        aria-label={ariaLabel}
        title={title}
      />
      {checked && (
        <Check className={cn(config.icon, varConfig.icon, "pointer-events-none")} />
      )}
    </div>
  );
}
