"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Option {
  value: string;
  label: string;
}

interface MobileSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function MobileSelect({
  options,
  value,
  onChange,
  placeholder = "Choose option...",
  label = "Select option",
  disabled = false,
}: MobileSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton variant="unstyled" size="unstyled"
          type="button"
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border border-input bg-transparent px-3.5 text-left text-sm transition-all shadow-sm",
            "h-11 touch-target", /* Fixed 44px touch height */
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span className={cn(!selectedLabel && "text-muted-foreground")}>
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </CustomButton>
      </DialogTrigger>
      
      <DialogContent className="p-0 gap-0">
        <VisuallyHidden>
          <DialogTitle>{label}</DialogTitle>
        </VisuallyHidden>
        
        {/* Sheet Header */}
        <div className="px-4 py-3 border-b shrink-0 bg-muted/20">
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>

        {/* Scrollable list items */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] no-scrollbar py-1">
          {options.map((opt) => (
            <CustomButton variant="unstyled" size="unstyled"
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 h-11 text-sm text-foreground active:bg-muted/70 transition-all border-b border-border/10 last:border-0"
            >
              <span className={cn(value === opt.value && "text-primary font-medium")}>
                {opt.label}
              </span>
              {value === opt.value && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </CustomButton>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
