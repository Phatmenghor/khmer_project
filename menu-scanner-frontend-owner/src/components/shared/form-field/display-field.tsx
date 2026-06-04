"use client";

import { ReactNode } from "react";

interface DisplayFieldProps {
  label: string;
  value: string | ReactNode | undefined;
}

export function DisplayField({ label, value }: DisplayFieldProps) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-foreground">{label}</div>
      <div className="text-xs text-foreground">
        {typeof value === "string" ? value || "-" : value || "-"}
      </div>
    </div>
  );
}
