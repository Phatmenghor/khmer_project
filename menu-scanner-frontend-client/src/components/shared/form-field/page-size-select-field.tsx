"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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

/**
 * PageSizeSelectField Component
 * Custom Popover-based page size selector following SelectField pattern
 * Avoids scroll bugs with native Select component
 */
export function PageSizeSelectField({
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className = "",
  label = "Rows per page:",
}: PageSizeSelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span className="text-xs sm:text-sm text-muted-foreground font-semibold whitespace-nowrap">
          {label}
        </span>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "justify-between gap-2 min-w-[80px] h-10 px-3 transition-colors",
              "hover:bg-accent/50 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label={`Select rows per page, currently showing ${pageSize} rows`}
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <span className="font-medium text-sm">{pageSize}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 opacity-50 shrink-0 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[100px] p-0"
          align="start"
          side="bottom"
        >
          <div className="space-y-1 p-1" role="listbox">
            {pageSizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                role="option"
                aria-selected={pageSize === size}
                onClick={() => {
                  onPageSizeChange(size);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded transition-colors",
                  "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  pageSize === size
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-foreground"
                )}
                aria-label={`Show ${size} rows per page`}
              >
                <Check
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    pageSize === size ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden="true"
                />
                <span>{size}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
