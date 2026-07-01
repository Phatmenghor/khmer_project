import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DetailSectionProps {
  title: string;
  children: ReactNode;
}

export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 mb-2">
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
      className={`flex items-start justify-between gap-3 py-1 ${
        !isLast ? "border-b border-border" : ""
      }`}
    >
      <Label className="text-[11px] font-medium text-muted-foreground whitespace-nowrap flex-shrink-0 min-w-[120px]">
        {label}
      </Label>
      <div className="text-[11px] text-right flex-1 break-words">{value}</div>
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="col-span-2 mt-3 mb-1 first:mt-0 border-b border-gray-300 dark:border-neutral-700 pb-1">
      <h3 className="text-xs font-bold text-foreground">
        {children}
      </h3>
    </div>
  );
}

export function InfoRow({
  label,
  value,
  fullWidth,
  className,
}: {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5 min-w-0", fullWidth && "col-span-2", className)}>
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="text-xs text-foreground break-words whitespace-pre-wrap">
        {value !== undefined && value !== null && value !== "" ? value : "-"}
      </span>
    </div>
  );
}
