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

  const sizeConfig = {
    sm: {
      box: "w-[12.8px] h-[12.8px]",
      innerBox: "w-[6.4px] h-[6.4px]",
      icon: "w-[9.6px] h-[9.6px]",
      text: "text-xs",
    },
    md: {
      box: "w-3 h-3",
      innerBox: "w-1 h-1",
      icon: "w-2 h-2",
      text: "text-xs",
    },
    lg: {
      box: "w-[19.2px] h-[19.2px]",
      innerBox: "w-[9.6px] h-[9.6px]",
      icon: "w-3 h-3",
      text: "text-xs",
    },
    xl: {
      box: "w-[25.6px] h-[25.6px]",
      innerBox: "w-[12.8px] h-[12.8px]",
      icon: "w-3 h-3",
      text: "text-xs",
    },
  };


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

      e.currentTarget.blur();
    }
  };

  const baseCheckboxClass = cn(

    "relative inline-flex items-center justify-center rounded",

    "transition-all duration-200 ease-out",

    config.box,

    checked ? varConfig.checked : varConfig.unchecked,

    !disabled && "cursor-pointer",
    disabled && "opacity-50 cursor-not-allowed",

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


  if (label) {
    return (
      <label className="flex items-center gap-1 cursor-pointer group">
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


  return (
    <div className={baseCheckboxClass} title={title}>
      {checkboxContent}
    </div>
  );
}
