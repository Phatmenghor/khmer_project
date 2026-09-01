"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CustomSwitchProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function CustomSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  size = "md",
}: CustomSwitchProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={handleClick}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out select-none border border-border/40",
        size === "sm" ? "h-5 w-9" : "h-6 w-11",
        checked ? "bg-primary border-primary" : "bg-muted/80 hover:bg-muted",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block rounded-full bg-card shadow-xs transition-transform duration-200 ease-in-out border border-border/20",
          size === "sm"
            ? cn("h-4 w-4", checked ? "translate-x-4" : "translate-x-0")
            : cn("h-5 w-5", checked ? "translate-x-5" : "translate-x-0")
        )}
      />
    </div>
  );
}
