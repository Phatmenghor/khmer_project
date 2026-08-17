"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomCheckboxProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function CustomCheckbox({
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: CustomCheckboxProps) {
  return (
    <div
      onClick={(e) => {
        if (disabled || !onCheckedChange) return;
        e.stopPropagation();
        onCheckedChange(!checked);
      }}
      className={cn(
        "h-4 w-4 shrink-0 rounded-md border transition-all duration-200 flex items-center justify-center cursor-pointer select-none",
        checked
          ? "bg-primary border-primary text-primary-foreground shadow-2xs"
          : "border-border/80 bg-muted/40 hover:border-primary/40",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {checked && <Check className="h-3 w-3 stroke-[3]" />}
    </div>
  );
}
