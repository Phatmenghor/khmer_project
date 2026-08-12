"use client";

import React from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationPrimaryToggleProps {
  isPrimary: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function LocationPrimaryToggle({
  isPrimary,
  onToggle,
  disabled,
}: LocationPrimaryToggleProps) {
  return (
    <CustomButton
      variant="unstyled"
      size="unstyled"
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all focus:outline-none cursor-pointer shadow-2xs",
        isPrimary
          ? "border-amber-400 bg-amber-500/10 dark:bg-amber-950/30"
          : "border-border/80 hover:border-primary/40 hover:bg-muted/30"
      )}
    >
      <div
        className={cn(
          "p-1.5 rounded-lg shrink-0",
          isPrimary ? "bg-amber-100 dark:bg-amber-900/50" : "bg-muted"
        )}
      >
        <Star
          className={cn(
            "h-4 w-4",
            isPrimary ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-xs font-extrabold",
            isPrimary ? "text-amber-700 dark:text-amber-400" : "text-foreground"
          )}
        >
          {isPrimary ? "Default Primary Address" : "Set as Default Location"}
        </p>
        <p className="text-[11px] font-medium text-muted-foreground">
          Automatically select this location during checkout
        </p>
      </div>
      {isPrimary && <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />}
    </CustomButton>
  );
}
