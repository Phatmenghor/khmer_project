import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface DetailSectionProps {
  title: string;
  children: ReactNode;
}

export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1 h-4 bg-primary rounded-full"></div>
        <h3 className="text-xs font-semibold">{title}</h3>
      </div>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: ReactNode;
  isLast?: boolean;
}

export function DetailRow({ label, value, isLast = false }: DetailRowProps) {
  return (
    <div
      className={`flex items-start justify-between gap-3 py-1.5 ${
        !isLast ? "border-b border-border/40" : ""
      }`}
    >
      <Label className="text-xs font-medium text-muted-foreground whitespace-nowrap flex-shrink-0 min-w-[120px]">
        {label}
      </Label>
      <div className="text-xs text-right flex-1 break-words">{value}</div>
    </div>
  );
}
