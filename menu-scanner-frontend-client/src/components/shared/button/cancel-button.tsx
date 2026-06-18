"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

export function CancelButton({
  onClick,
  disabled = false,
  text = "Cancel",
  className,
  variant = "outline",
  size = "default",
  showIcon = false,
}: CancelButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn("transition-all", className)}
    >
      {showIcon && <X className="mr-1.5 h-4 w-4 shrink-0" />}
      {text}
    </Button>
  );
}
