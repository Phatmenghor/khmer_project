"use client";

import { ReactNode } from "react";

interface DisplayFieldProps {
  label: string;
  value: string | ReactNode | undefined;
  fullWidth?: boolean;
  colSpan?: number;
  mono?: boolean;
}

export function DisplayField({ label, value, fullWidth, colSpan, mono }: DisplayFieldProps) {
  const colClass = fullWidth ? "col-span-full" : colSpan ? `col-span-${colSpan}` : "";
  const monoClass = mono ? "font-mono" : "";
  return (
    <div className={`space-y-1 ${colClass}`}>
      <div className="text-xs font-medium text-foreground">{label}</div>
      <div className={`text-xs text-foreground ${monoClass}`}>
        {typeof value === "string" ? value || "-" : value || "-"}
      </div>
    </div>
  );
}
