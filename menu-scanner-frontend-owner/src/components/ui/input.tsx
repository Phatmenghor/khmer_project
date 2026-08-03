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
          "flex w-full rounded-[12px] border border-border/80 bg-muted/30 px-3.5 text-sm shadow-2xs transition-all duration-200 ease-out",
          "h-[36px] text-base md:text-sm", /* text-base enforces 16px to prevent iOS mobile auto-zoom */
          "hover:bg-muted/50 hover:border-border",
          "focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/25 focus:ring-offset-0",
          "placeholder:text-muted-foreground/60 placeholder:text-base md:placeholder:text-sm font-normal",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/20",
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
