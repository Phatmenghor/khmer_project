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


export function PageSizeSelectField({
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className = "",
  label = "Rows per page:",
}: PageSizeSelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {label && (
        <span className="text-xs sm:text-xs text-muted-foreground font-semibold whitespace-nowrap">
          {label}
        </span>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "justify-between gap-1.5 min-w-[80px] h-7 px-2 transition-colors",
              "hover:bg-accent/50 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label={`Select rows per page, currently showing ${pageSize} rows`}
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <span className="font-medium text-xs">{pageSize}</span>
            <ChevronDown
              className={cn(
                "h-3 w-3 opacity-50 shrink-0 transition-transform duration-200",
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
                  "w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-left rounded transition-colors",
                  "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  pageSize === size
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-foreground"
                )}
                aria-label={`Show ${size} rows per page`}
              >
                <Check
                  className={cn(
                    "h-3 w-3 flex-shrink-0",
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
