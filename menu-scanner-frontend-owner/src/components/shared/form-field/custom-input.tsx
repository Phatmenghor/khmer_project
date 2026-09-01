"use client";

import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface CustomInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode;
  required?: boolean;
  error?: string;
  helperText?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  size?: "sm" | "md" | "lg";
  containerClassName?: string;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      label,
      required,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconClick,
      size = "md",
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const sizeClasses = {
      sm: "h-8 text-[11px] sm:text-xs rounded-[8px]",
      md: "h-[36px] text-xs sm:text-sm rounded-[8px]",
      lg: "h-10 text-sm rounded-[10px]",
    }[size];

    return (
      <div className={cn("flex flex-col gap-1 w-full", containerClassName)}>
        {label && (
          <Label
            htmlFor={inputId}
            className="text-[11px] font-extrabold text-foreground leading-tight flex items-center gap-1 min-h-[16px]"
          >
            <span>{label}</span>
            {required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}
          <Input
            ref={ref}
            id={inputId}
            className={cn(
              "bg-muted/30 border-border/80 focus-visible:bg-background focus-visible:border-primary transition-all",
              leftIcon && "pl-8",
              rightIcon && "pr-8",
              sizeClasses,
              error && "border-destructive focus-visible:border-destructive",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className={cn(
                "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground shrink-0",
                !onRightIconClick && "pointer-events-none"
              )}
            >
              {rightIcon}
            </button>
          )}
        </div>
        {(error || helperText) && (
          <div className="px-0.5">
            {error && <p className="text-[10px] text-destructive font-medium mt-0.5">{error}</p>}
            {!error && helperText && <p className="text-[10px] text-muted-foreground mt-0.5">{helperText}</p>}
          </div>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";
