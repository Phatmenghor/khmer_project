"use client";

import React, { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface CustomTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  required?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
  showCount?: boolean;
  helperText?: React.ReactNode;
}

export const CustomTextarea = forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  (
    {
      label,
      required,
      error,
      leftIcon,
      containerClassName,
      className,
      id,
      showCount = false,
      helperText,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const inputId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const currentLength = typeof value === "string" ? value.length : (typeof props.defaultValue === "string" ? props.defaultValue.length : 0);

    return (
      <div className={cn("flex flex-col gap-1 w-full", containerClassName)}>
        {label && (
          <Label
            htmlFor={inputId}
            className="text-[11px] font-extrabold text-foreground leading-tight flex items-center gap-1 min-h-[16px]"
          >
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{label}</span>
            {required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
        )}
        <Textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={cn(
            "bg-muted/30 border-border/80 focus-visible:bg-background focus-visible:border-primary text-xs resize-none rounded-[8px] transition-all",
            error && "border-destructive focus-visible:border-destructive",
            className
          )}
          {...props}
        />
        {(error || helperText || (showCount && maxLength)) && (
          <div className="flex justify-between items-center px-1 text-[10px] sm:text-[11px]">
            <div className="flex-1">
              {error && <p className="text-destructive font-medium">{error}</p>}
              {!error && helperText && <p className="text-muted-foreground">{helperText}</p>}
            </div>
            {showCount && maxLength && (
              <div className="flex items-center gap-1.5 ml-auto pl-2 shrink-0">
                <span className="text-muted-foreground">
                  {currentLength}/{maxLength}
                </span>
                {currentLength > maxLength * 0.8 && (
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    ⚠️ Approaching limit
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

CustomTextarea.displayName = "CustomTextarea";
