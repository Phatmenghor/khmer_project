"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FormFooterProps {
  isSubmitting: boolean;
  isDirty: boolean;
  isCreate?: boolean;
  createMessage?: string;
  updateMessage?: string;
  noChangesMessage?: string;
  children: React.ReactNode;
  className?: string;
  showStatusText?: boolean;
}

export function FormFooter({
  isSubmitting,
  isDirty,
  isCreate = true,
  createMessage = "Creating...",
  updateMessage = "Updating...",
  noChangesMessage = "No changes made",
  children,
  className,
  showStatusText = true,
}: FormFooterProps) {
  const getStatusMessage = () => {
    if (isSubmitting) {
      return isCreate ? createMessage : updateMessage;
    }
    if (isDirty) {
      return "You have unsaved changes";
    }
    return noChangesMessage;
  };

  return (
    <div
      className={cn(
        "m-0 mx-0 mb-0 md:mx-0 md:mb-0 p-4 md:p-4 border-t border-border/80 bg-muted/20 flex-shrink-0 mt-auto",
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {showStatusText && (
        <div className="text-[11px] text-muted-foreground flex items-center gap-1 order-2 sm:order-1">
          {isSubmitting && (
            <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
          )}
          {isDirty && !isSubmitting && (
            <div className="h-1 w-1 rounded-full bg-orange-500" />
          )}
          <span>{getStatusMessage()}</span>
        </div>
      )}
      <div className={cn("flex gap-2 order-1 sm:order-2", !showStatusText && "ml-auto")}>{children}</div>
    </div>
  );
}
