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
 * CustomCheckbox - Modern, accessible checkbox with smooth animations
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
  // Size configuration (20% smaller)
  const sizeConfig = {
    sm: {
      box: "w-[12.8px] h-[12.8px]",
      innerBox: "w-[6.4px] h-[6.4px]",
      icon: "w-[9.6px] h-[9.6px]",
      text: "text-xs",
    },
    md: {
      box: "w-4 h-4",
      innerBox: "w-2 h-2",
      icon: "w-3 h-3",
      text: "text-sm",
    },
    lg: {
      box: "w-[19.2px] h-[19.2px]",
      innerBox: "w-[9.6px] h-[9.6px]",
      icon: "w-4 h-4",
      text: "text-base",
    },
    xl: {
      box: "w-[25.6px] h-[25.6px]",
      innerBox: "w-[12.8px] h-[12.8px]",
      icon: "w-5 h-5",
      text: "text-lg",
    },
  };

  // Modern variant configuration with smooth transitions
  const variantConfig = {
    default: {
      unchecked:
        "bg-white border-[0.5px] border-gray-300 shadow-sm hover:border-gray-400 hover:shadow-md hover:bg-gray-50/50 active:scale-95",
      checked:
        "bg-primary border-[0.5px] border-primary shadow-md hover:shadow-lg hover:bg-primary/95 active:scale-95",
      icon: "text-white",
    },
    accent: {
      unchecked:
        "bg-white border-[0.5px] border-gray-300 shadow-sm hover:border-gray-400 hover:shadow-md hover:bg-gray-50/50 active:scale-95",
      checked:
        "bg-primary border-[0.5px] border-primary shadow-md hover:shadow-lg hover:bg-primary/95 active:scale-95",
      icon: "text-white",
    },
    outline: {
      unchecked:
        "bg-transparent border-[0.5px] border-gray-300 shadow-sm hover:border-gray-400 hover:shadow-md active:scale-95",
      checked:
        "bg-primary border-[0.5px] border-primary shadow-md hover:shadow-lg hover:bg-primary/95 active:scale-95",
      icon: "text-white",
    },
  };

  const config = sizeConfig[size];
  const varConfig = variantConfig[variant];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange && !disabled) {
      onCheckedChange(e.target.checked);
      // Blur input to allow scroll immediately after click
      e.currentTarget.blur();
    }
  };

  const baseCheckboxClass = cn(
    // Base styles
    "relative inline-flex items-center justify-center rounded-md",
    // Smooth transitions and animations
    "transition-all duration-200 ease-out",
    // Size
    config.box,
    // State colors
    checked ? varConfig.checked : varConfig.unchecked,
    // Cursor and disabled state
    !disabled && "cursor-pointer",
    disabled && "opacity-50 cursor-not-allowed",
    // Focus ring for accessibility
    "focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-1",
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
        <Check
          className={cn(
            config.icon,
            varConfig.icon,
            "pointer-events-none",
            "animate-checkbox-check"
          )}
        />
      ) : (
        <div
          className={cn(
            config.innerBox,
            "bg-input rounded-sm transition-all duration-200 pointer-events-none"
          )}
        />
      )}
    </>
  );

  // Wrapper for label (if provided)
  if (label) {
    return (
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className={baseCheckboxClass} title={title}>
          {checkboxContent}
        </div>
        {label && (
          <span
            className={cn(
              config.text,
              "font-medium text-foreground select-none",
              "group-hover:text-primary transition-colors duration-200",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  }

  // Checkbox only (no label)
  return (
    <div className={baseCheckboxClass} title={title}>
      {checkboxContent}
    </div>
  );
}
