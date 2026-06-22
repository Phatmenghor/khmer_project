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
          "flex w-full rounded-xl border border-input bg-transparent px-3 text-sm shadow-sm transition-all duration-200",
          "h-[32px] md:h-[32px] text-base md:text-sm", /* text-base enforces 16px to prevent iOS auto-zoom */
          "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
          "placeholder:text-muted-foreground/60",
          "disabled:cursor-not-allowed disabled:opacity-50",
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
