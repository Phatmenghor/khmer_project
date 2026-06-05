"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const SIZE_CLASSES: Record<ComboboxSize, string> = {
  sm: "h-5 text-xs",
  md: "h-6 text-xs",
  lg: "h-7 text-xs",
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

  const isSelected = (item: T) =>
    isItemSelected
      ? isItemSelected(item, value)
      : value !== null && getId(item) === getId(value);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <Label className="text-xs font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-w-[150px] px-2 py-1 transition-all duration-200 border-input",
              SIZE_CLASSES[size],
              !value && "text-muted-foreground",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/30",
              open && "bg-primary/20 border-primary text-primary",
              error && "border-red-500",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            disabled={disabled}
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 shadow-lg border-border"
          align="start"
          side="bottom"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
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
                  const id = getId(item);
                  return (
                    <CommandItem
                      key={id}
                      value={String(id)}
                      onSelect={() => handleSelect(item)}
                      ref={index === data.length - 1 ? sentinelRef : null}
                      className={SIZE_CLASSES[size]}
                    >
                      <Check
                        className={cn(
                          "mr-1 h-3 w-3",
                          isSelected(item) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {renderItem ? renderItem(item) : getLabel(item)}
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
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
