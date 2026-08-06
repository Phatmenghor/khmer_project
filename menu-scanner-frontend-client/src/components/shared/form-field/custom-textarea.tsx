"use client";

import React, { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface CustomTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  containerClassName?: string;
}

export const CustomTextarea = forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  (
    {
      label,
      required,
      error,
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("flex flex-col gap-1 w-full", containerClassName)}>
        {label && (
          <Label
            htmlFor={inputId}
            className="text-[11px] font-extrabold text-foreground leading-tight flex items-center min-h-[16px]"
          >
            <span>{label}</span>
            {required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
        )}
        <Textarea
          ref={ref}
          id={inputId}
          className={cn(
            "bg-muted/30 border-border/80 focus-visible:bg-background focus-visible:border-primary text-xs resize-none rounded-[8px] transition-all",
            error && "border-destructive focus-visible:border-destructive",
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] text-destructive font-medium mt-0.5">{error}</p>}
      </div>
    );
  }
);

CustomTextarea.displayName = "CustomTextarea";
