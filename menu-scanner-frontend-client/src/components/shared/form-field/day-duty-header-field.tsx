"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface DayDutyHeaderFieldProps {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export function DayDutyHeaderField({
  label,
  enabled,
  onToggle,
  disabled = false,
  className,
}: DayDutyHeaderFieldProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onToggle();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2.5 min-w-[130px] cursor-pointer select-none py-1 group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="pointer-events-none flex items-center justify-center">
        <Checkbox
          checked={enabled}
          tabIndex={-1}
          disabled={disabled}
          className="rounded-md"
        />
      </div>
      <span
        className={cn(
          "font-extrabold text-xs transition-colors group-hover:text-primary",
          enabled ? "text-foreground" : "text-muted-foreground/80"
        )}
      >
        {label}
      </span>
    </div>
  );
}
