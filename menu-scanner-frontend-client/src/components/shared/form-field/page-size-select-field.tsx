"use client";

import React, { useState } from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageSizeSelectFieldProps {
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  className?: string;
  label?: string;
}


export function PageSizeSelectField({
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className = "",
  label = "Rows per page:",
}: PageSizeSelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <span className="text-xs text-muted-foreground font-bold whitespace-nowrap">
          {label}
        </span>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <CustomButton
            variant="unstyled"
            size="unstyled"
            className={cn(
              "h-8 px-2.5 rounded-[8px] border border-border/80 bg-background flex items-center justify-between gap-1.5 text-xs font-extrabold transition-all duration-200 min-w-[76px]",
              "hover:border-primary/50 hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-2xs"
            )}
            aria-label={`Select rows per page, currently showing ${pageSize} rows`}
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <span>{pageSize}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                open && "rotate-180 text-primary"
              )}
            />
          </CustomButton>
        </PopoverTrigger>
        <PopoverContent
          className="w-[110px] p-1 rounded-[10px] border border-border shadow-md"
          align="start"
          side="top"
        >
          <div className="space-y-0.5" role="listbox">
            {pageSizeOptions.map((size) => (
              <CustomButton
                variant="unstyled"
                size="unstyled"
                key={size}
                type="button"
                role="option"
                aria-selected={pageSize === size}
                onClick={() => {
                  onPageSizeChange(size);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold rounded-[6px] transition-all cursor-pointer",
                  pageSize === size
                    ? "bg-primary/10 text-primary font-black"
                    : "text-foreground hover:bg-muted"
                )}
                aria-label={`Show ${size} rows per page`}
              >
                <span>{size} rows</span>
                {pageSize === size && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              </CustomButton>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
