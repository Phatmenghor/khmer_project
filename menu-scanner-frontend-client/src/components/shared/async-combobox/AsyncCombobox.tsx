"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AsyncComboboxProps, ComboboxSize } from "./types";

const SIZE_CLASSES = {
  sm: "h-8 text-xs rounded-[10px] bg-muted/50 border border-border px-3 hover:bg-muted/65 hover:border-border transition-all",
  md: "h-[36px] text-base md:text-sm rounded-[12px] bg-muted/50 border border-border px-3.5 hover:bg-muted/65 hover:border-border focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all duration-200",
  lg: "h-10 text-base md:text-sm rounded-[12px] bg-muted/50 border border-border px-3.5 hover:bg-muted/65 hover:border-border focus:bg-background transition-all",
};

export function AsyncCombobox<T>({
  value,
  onChange,
  controller,
  getId,
  getLabel,
  renderItem,
  isItemSelected,
  onSelectInterceptor,
  label,
  required = false,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  endOfListMessage = "No more results",
  error,
  disabled = false,
  size = "md",
  className,
  prefillSearchOnOpen = false,
  beforeOpen,
}: AsyncComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const {
    data,
    loading,
    lastPage,
    searchTerm,
    setSearchTerm,
    sentinelRef,
  } = controller;

  const selectedLabel = value ? getLabel(value) : placeholder;

  const handleOpenChange = (next: boolean) => {
    if (next && beforeOpen && !beforeOpen()) {
      return;
    }
    if (prefillSearchOnOpen) {
      if (next && value) setSearchTerm(getLabel(value));
      else if (!next) setSearchTerm("");
    }
    setOpen(next);
  };

  const handleSelect = (item: T) => {
    const intercepted = onSelectInterceptor
      ? onSelectInterceptor(item)
      : item;
    onChange(intercepted);
    setOpen(false);
  };

  const isSelected = (item: T) => {
    if (isItemSelected) {
      return isItemSelected(item, value);
    }
    if (!value || !item) return false;
    return getId(item) === getId(value);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled) return;
    if (onSelectInterceptor) {
      onSelectInterceptor(null as unknown as T);
    } else {
      onChange(null as unknown as T);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      {Boolean(label && label.trim() !== "") && (
        <Label className="text-xs font-semibold text-foreground leading-tight flex items-center min-h-[16px]">
          <span>{label}</span>
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <CustomButton
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-w-[150px] shadow-2xs font-normal transition-all duration-200",
              SIZE_CLASSES[size],
              !value && "text-muted-foreground/75",
              open && "bg-background border-primary text-foreground ring-2 ring-primary/25",
              error && "border-red-500 focus:border-red-500",
              disabled && "opacity-50 cursor-not-allowed bg-muted/20",
              className
            )}
            disabled={disabled}
          >
            <span className="truncate flex-1 text-left">{selectedLabel}</span>
            <div className="flex items-center gap-1 shrink-0 ml-1.5">
              {Boolean(value) &&
                (typeof value === "string"
                  ? String(value).toUpperCase() !== "ALL" && String(value).trim() !== ""
                  : true) &&
                !disabled && (
                  <span
                    role="button"
                    tabIndex={0}
                    title="Clear selection"
                    onClick={handleClear}
                    className="p-0.5 rounded-full hover:bg-destructive/15 hover:text-destructive text-muted-foreground/70 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
            </div>
          </CustomButton>
        </PopoverTrigger>

        <PopoverContent
          className="min-w-[var(--radix-popover-trigger-width)] w-auto max-w-[90vw] sm:max-w-xs md:max-w-sm p-1 rounded-[12px] shadow-lg border-border bg-popover z-50 pointer-events-auto"
          align="start"
          side="bottom"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList className="max-h-44 overflow-y-auto">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => {
                  if (!item) return null;
                  const id = getId(item);
                  const selected = isSelected(item);
                  const labelText = getLabel(item);
                  return (
                    <CommandItem
                      key={id}
                      value={String(id)}
                      onSelect={() => handleSelect(item)}
                      ref={index === data.length - 1 ? sentinelRef : null}
                      title={labelText}
                      className={cn(
                        "h-8 px-2.5 text-xs rounded-[8px] flex items-center justify-between gap-2 cursor-pointer transition-all my-0.5 select-none",
                        selected
                          ? "bg-primary/15 text-primary font-semibold border border-primary/20 shadow-2xs"
                          : "hover:bg-primary/10 hover:text-primary text-foreground"
                      )}
                    >
                      <span className="whitespace-nowrap flex-1 text-left">
                        {renderItem ? renderItem(item) : labelText}
                      </span>
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-opacity",
                          selected ? "opacity-100 text-primary" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              {loading && (
                <div className="text-center py-1">
                  <Loader2 className="animate-spin text-gray-500 h-3 w-3 mx-auto" />
                </div>
              )}

              {!loading && lastPage && data.length > 0 && (
                <div className="text-center py-1 text-xs text-gray-400">
                  {endOfListMessage}
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className={`text-xs text-red-500 ${error ? "min-h-[16px]" : ""}`}>{error || ""}</p>
    </div>
  );
}
