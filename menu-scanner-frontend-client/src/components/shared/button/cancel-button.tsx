"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "outline" | "ghost" | "default";
  size?: "default" | "sm" | "lg" | "icon";
  text?: string;
}

export function CancelButton({
  onClick,
  disabled = false,
  className,
  variant = "outline",
  size = "default",
  text = "Cancel",
}: CancelButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size={size}
      className={cn("transition-all", className)}
    >
      {text}
    </Button>
  );
}
