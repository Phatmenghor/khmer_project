"use client";

import React from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";

interface LocationLabelPresetsProps {
  currentValue?: string;
  onSelect: (label: string) => void;
  disabled?: boolean;
}

const PRESETS = ["Home", "Work", "Shop", "Apartment", "Other"];

export function LocationLabelPresets({
  currentValue,
  onSelect,
  disabled,
}: LocationLabelPresetsProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap mb-2">
      <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mr-1">
        Presets:
      </span>
      {PRESETS.map((preset) => {
        const isSelected = currentValue?.toLowerCase() === preset.toLowerCase();
        return (
          <CustomButton
            key={preset}
            type="button"
            variant="unstyled"
            size="unstyled"
            disabled={disabled}
            onClick={() => onSelect(preset)}
            className={cn(
              "px-3 py-1 text-xs rounded-full border transition-all cursor-pointer font-bold",
              isSelected
                ? "bg-primary/10 border-primary/50 text-primary shadow-2xs"
                : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {preset}
          </CustomButton>
        );
      })}
    </div>
  );
}
