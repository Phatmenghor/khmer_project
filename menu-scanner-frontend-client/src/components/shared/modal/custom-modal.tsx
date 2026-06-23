"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  full: "sm:max-w-[95vw]",
};

export type ModalSize = keyof typeof SIZE_CLASSES;

export interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  className?: string;
  hideCloseButton?: boolean;
  disableScrollWrapper?: boolean;
}

export function CustomModal({
  isOpen,
  onClose,
  children,
  size = "default",
  className,
  hideCloseButton = false,
  disableScrollWrapper = false,
}: CustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn("w-full max-h-[92vh] p-0 flex flex-col", SIZE_CLASSES[size], className)}
        closeButtonClassName={hideCloseButton ? "hidden" : ""}
        disableScrollWrapper={disableScrollWrapper}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
