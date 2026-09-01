"use client";

import React from "react";
import { CustomCheckbox } from "@/components/shared/common/custom-checkbox";
import { cn } from "@/lib/utils";

interface DayDutyHeaderFieldProps {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  showCheckbox?: boolean;
  className?: string;
}

export function DayDutyHeaderField({
  label,
  enabled,
  onToggle,
  disabled = false,
  showCheckbox = true,
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
        "flex items-center gap-2.5 cursor-pointer select-none py-1 group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {showCheckbox && (
        <div className="pointer-events-none flex items-center justify-center">
          <CustomCheckbox
            checked={enabled}
            disabled={disabled}
          />
        </div>
      )}
      <span
        className={cn(
          "font-black text-xs md:text-sm tracking-wide transition-colors group-hover:text-foreground",
          enabled ? "text-foreground" : "text-muted-foreground/80"
        )}
      >
        {label}
      </span>
    </div>
  );
}
