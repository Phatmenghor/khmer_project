"use client";

import { X } from "lucide-react";

interface ModalCloseButtonProps {
  onClick: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "white" | "black";
  className?: string;
}

export function ModalCloseButton({
  onClick,
  size = "md",
  color = "black",
  className = "",
}: ModalCloseButtonProps) {
  const sizeMap = {
    sm: "h-6 w-6 p-1",
    md: "h-8 w-8 p-1.5",
    lg: "h-10 w-10 p-2",
    xl: "h-12 w-12 p-2.5",
  };

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
    <button
      onClick={onClick}
      className={`absolute right-2 top-4 flex items-center justify-center rounded-md transition-colors hover:bg-black/10 ${sizeMap[size]} ${className}`}
      type="button"
      aria-label="Close"
    >
      <X
        className={`${iconSizeMap[size]}`}
        style={{ color: colorMap[color] }}
      />
    </button>
  );
}
