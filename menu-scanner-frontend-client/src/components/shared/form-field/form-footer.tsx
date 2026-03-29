// components/shared/form/FormFooter.tsx
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
        "flex flex-col gap-3 px-4 py-4 border-t bg-muted/30 flex-shrink-0",
        "sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className
      )}
    >
      <div className="text-sm text-muted-foreground flex items-center gap-2 order-2 sm:order-1">
        {isSubmitting && (
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        )}
        {isDirty && !isSubmitting && (
          <div className="h-2 w-2 rounded-full bg-orange-500" />
        )}
        <span>{getStatusMessage()}</span>
      </div>
      <div className="flex gap-3 order-1 sm:order-2">{children}</div>
    </div>
  );
}
