"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ModalCloseButtonProps {
  onClick: () => void;
  iconSize?: "sm" | "md" | "lg" | "xl";
  iconColor?: "white" | "black";
  className?: string;
}

export function ModalCloseButton({
  onClick,
  iconSize = "md",
  iconColor = "black",
  className = "",
}: ModalCloseButtonProps) {
  const iconSizeMap = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  };

  const colorMap = {
    white: "#ffffff",
    black: "#000000",
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`absolute right-2 top-4 hover:bg-primary/80 ${className}`}
    >
      <X
        className={`${iconSizeMap[iconSize]}`}
        style={{ color: colorMap[iconColor] }}
      />
    </Button>
  );
}
