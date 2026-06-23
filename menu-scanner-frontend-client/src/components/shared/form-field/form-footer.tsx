
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
        "-mx-4 -mb-4 px-4 py-3 md:-mx-6 md:-mb-4 md:px-6 md:py-4",
        "flex flex-row items-center justify-between gap-3 border-t border-border/60 bg-muted/30 flex-shrink-0",
        className
      )}
    >
      <div className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0 flex-1">
        {isSubmitting && (
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
        )}
        {isDirty && !isSubmitting && (
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
        )}
        <span className="truncate">{getStatusMessage()}</span>
      </div>
      <div className="flex gap-2 shrink-0">{children}</div>
    </div>
  );
}
