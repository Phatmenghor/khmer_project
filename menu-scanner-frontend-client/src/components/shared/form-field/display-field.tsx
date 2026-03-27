"use client";

interface DisplayFieldProps {
  label: string;
  value: string | undefined;
}

export function DisplayField({ label, value }: DisplayFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <p className="text-base text-foreground">{value || "-"}</p>
    </div>
  );
}
