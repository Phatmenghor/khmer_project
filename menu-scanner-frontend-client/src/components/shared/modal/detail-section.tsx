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
      className={`flex items-start justify-between gap-3 py-1.5 ${
        !isLast ? "border-b border-border/40" : ""
      }`}
    >
      <Label className="text-[11px] font-medium text-muted-foreground whitespace-nowrap flex-shrink-0 min-w-[120px]">
        {label}
      </Label>
      <div className="text-[11px] text-right flex-1 break-words">{value}</div>
    </div>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("col-span-2 mt-4 mb-2 first:mt-0 pb-2 border-b border-border/80 flex items-center justify-between w-full", className)}>
      <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-500 to-amber-600 shrink-0 inline-block shadow-2xs" />
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
