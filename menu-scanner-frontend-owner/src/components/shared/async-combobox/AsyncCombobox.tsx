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
import { FORM_FIELD_LABEL_CLASS } from "@/components/shared/form-field/form-field-styles";
import type { AsyncComboboxProps, ComboboxSize } from "./types";

const SIZE_CLASSES = {
  sm: "h-8 text-xs rounded-[10px] bg-background border border-border/80 px-2.5 hover:bg-muted/40 transition-all",
  md: "h-[36px] text-xs sm:text-[13px] font-medium rounded-[12px] bg-background border border-border/80 px-3 hover:bg-muted/40 hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-2xs",
  lg: "h-10 text-sm rounded-[14px] bg-background border border-border/80 px-3.5 hover:bg-muted/40 transition-all",
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
        <Label className={cn(FORM_FIELD_LABEL_CLASS, "flex items-center gap-1 min-h-[16px]")}>
          <span>{label}</span>
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex w-full items-center justify-between gap-1 transition-all duration-200 shadow-2xs text-left cursor-pointer select-none",
              "bg-background border border-border/80 text-foreground text-xs sm:text-[13px] font-medium rounded-[12px] h-[36px] px-3",
              "hover:bg-muted/20 hover:border-border",
              "focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20",
              open && "border-primary ring-2 ring-primary/20",
              SIZE_CLASSES[size],
              !value && "text-muted-foreground",
              error && "border-destructive focus:border-destructive",
              disabled && "opacity-50 cursor-not-allowed bg-muted/30 pointer-events-none",
              className
            )}
            disabled={disabled}
          >
            <span
              className={cn(
                "truncate min-w-0 flex-1 text-left text-xs sm:text-[13px]",
                !value ? "text-muted-foreground/70 text-[13px] font-normal" : "text-foreground font-medium"
              )}
            >
              {selectedLabel}
            </span>
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
                    className="p-0.5 rounded-full hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
          </button>
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
              isLoading={loading}
              onClear={() => setSearchTerm("")}
              className="text-base md:text-sm font-normal text-foreground placeholder:text-muted-foreground"
            />
            <CommandList className="max-h-44 overflow-y-auto">
              <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => {
                  if (!item) return null;
                  const id = getId(item);
                  const selected = isSelected(item);
                  const labelText = getLabel(item);
                  const itemValue = `${labelText} ${(item as any)?.userIdentifier || ""} ${(item as any)?.email || ""} ${(item as any)?.phoneNumber || ""} ${(item as any)?.fullName || ""} ${id}`;
                  return (
                    <CommandItem
                      key={id}
                      value={itemValue}
                      onSelect={() => handleSelect(item)}
                      ref={index === data.length - 1 ? sentinelRef : null}
                      title={labelText}
                      className={cn(
                        "h-[34px] px-2.5 text-xs sm:text-[13px] rounded-[8px] flex items-center justify-between gap-2 cursor-pointer transition-all my-0.5 select-none",
                        selected
                          ? "bg-primary/15 text-primary font-semibold border border-primary/20 shadow-2xs"
                          : "hover:bg-primary/10 hover:text-primary text-foreground"
                      )}
                    >
                      <span className="truncate flex-1 text-left text-xs sm:text-[13px] font-medium">
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
                  <Loader2 className="animate-spin text-muted-foreground h-3 w-3 mx-auto" />
                </div>
              )}

              {!loading && lastPage && data.length > 0 && (
                <div className="text-center py-1 text-xs text-muted-foreground/60">
                  {endOfListMessage}
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className={`text-xs text-destructive ${error ? "min-h-[16px]" : ""}`}>{error || ""}</p>
    </div>
  );
}
