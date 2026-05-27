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
              "justify-between gap-2 min-w-[80px] h-9 px-3 transition-all duration-200",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              open && "bg-primary/20 border-primary text-primary"
            )}
            aria-expanded={open}
          >
            <span className="font-medium text-sm">{pageSize}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 opacity-50 shrink-0 transition-transform duration-200",
                open && "rotate-180 opacity-100"
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[100px] p-0" align="start" side="bottom">
          <div className="space-y-1 p-1">
            {pageSizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  onPageSizeChange(size);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded transition-colors cursor-pointer",
                  "hover:bg-accent hover:text-accent-foreground",
                  pageSize === size
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-foreground"
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    pageSize === size ? "opacity-100" : "opacity-0"
                  )}
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
