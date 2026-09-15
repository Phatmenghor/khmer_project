"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onFocus, ...props }, ref) => {
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(e);
      // Auto-scroll focused input cleanly into viewport to prevent layout shifts
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex w-full h-[36px] rounded-[12px] border border-border/80 bg-background px-3 text-xs sm:text-[13px] font-medium text-foreground shadow-2xs transition-all duration-200 ease-out",
          "hover:bg-muted/20 hover:border-border",
          "focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0",
          "placeholder:text-muted-foreground/70 placeholder:text-[13px] placeholder:font-normal",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
