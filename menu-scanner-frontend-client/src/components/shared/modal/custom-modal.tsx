"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const SIZE_CLASSES = {
  xs: "sm:max-w-xs",
  sm: "sm:max-w-sm",
  default: "sm:max-w-md",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  "5xl": "sm:max-w-5xl",
  "6xl": "sm:max-w-6xl",
  "7xl": "sm:max-w-7xl",
  full: "sm:max-w-[95vw]",
};

export type ModalSize = keyof typeof SIZE_CLASSES;

export interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: ModalSize;
  className?: string;
  hideCloseButton?: boolean;
  disableScrollWrapper?: boolean;
}

export function CustomModal({
  isOpen,
  onClose,
  children,
  title,
  size = "default",
  className,
  hideCloseButton = false,
  disableScrollWrapper = true,
}: CustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "w-full max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden",
          SIZE_CLASSES[size],
          className
        )}
        closeButtonClassName={hideCloseButton ? "hidden" : ""}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement)?.focus();
        }}
        disableScrollWrapper={disableScrollWrapper}
      >
        {title && <DialogTitle className="sr-only">{title}</DialogTitle>}
        {children}
      </DialogContent>
    </Dialog>
  );
}
