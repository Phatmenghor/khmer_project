"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DisplayFieldProps {
  label: string;
  value: string | ReactNode | undefined;
  /** Force the field to span the full grid width. */
  fullWidth?: boolean;
  /** Render the value as monospaced text (good for IDs/codes). */
  mono?: boolean;
  className?: string;
}

export function DisplayField({
  label,
  value,
  fullWidth,
  mono,
  className,
}: DisplayFieldProps) {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "");

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5",
        fullWidth && "md:col-span-2",
        className,
      )}
    >
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
        {label}
      </span>
      <span
        className={cn(
          "text-xs text-foreground font-medium break-words leading-relaxed",
          mono && "font-mono",
          isEmpty && "text-muted-foreground font-normal",
        )}
      >
        {isEmpty ? "—" : value}
      </span>
    </div>
  );
}
