"use client";

import { useState, ReactNode } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComboboxSize, UseInfiniteComboboxResult } from "./types";

const SIZE_CLASSES = {
  sm: "h-8 text-xs rounded-[10px] bg-muted/50 border border-border px-3 hover:bg-muted/65 transition-all",
  md: "h-[36px] text-base md:text-sm rounded-[12px] bg-muted/50 border border-border px-3.5 hover:bg-muted/65 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all duration-200",
  lg: "h-10 text-base md:text-sm rounded-[12px] bg-muted/50 border border-border px-3.5 hover:bg-muted/65 transition-all",
};

export interface AsyncMultiSelectComboboxProps<T> {
  selectedValues?: T[];
  onChange: (items: T[]) => void;
  controller: UseInfiniteComboboxResult<T>;
  getId: (item: T) => string | number;
  getLabel: (item: T) => string;
  renderItem?: (item: T) => ReactNode;
  renderBadge?: (item: T, onRemove: () => void) => ReactNode;

  label?: string;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
  endOfListMessage?: string;
  error?: string;
  disabled?: boolean;
  size?: ComboboxSize;
  className?: string;
  selectAllLabel?: string;
  showSelectAll?: boolean;
  subLabel?: string;
}

export function AsyncMultiSelectCombobox<T>({
  selectedValues = [],
  onChange,
  controller,
  getId,
  getLabel,
  renderItem,
  renderBadge,
  label,
  required = false,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  error,
  disabled = false,
  size = "md",
  className,
  selectAllLabel = "Select All Items",
  showSelectAll = true,
  subLabel,
}: AsyncMultiSelectComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const { data, loading, lastPage, searchTerm, setSearchTerm, sentinelRef } = controller;

  const isSelected = (item: T) => {
    const id = getId(item);
    return selectedValues.some((v) => getId(v) === id);
  };

  const handleToggleItem = (item: T) => {
    const id = getId(item);
    const exists = isSelected(item);
    if (exists) {
      onChange(selectedValues.filter((v) => getId(v) !== id));
    } else {
      onChange([...selectedValues, item]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedValues.length === data.length) {
      onChange([]);
    } else {
      onChange([...data]);
    }
  };

  const handleRemoveItem = (item: T, e: React.MouseEvent) => {
    e.stopPropagation();
    const id = getId(item);
    onChange(selectedValues.filter((v) => getId(v) !== id));
  };

  const isAllSelected = data.length > 0 && selectedValues.length === data.length;

  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      {Boolean(label && label.trim() !== "") && (
        <Label className="text-xs font-semibold text-foreground leading-tight flex items-center justify-between min-h-[16px]">
          <span>
            {label} {required && <span className="text-destructive ml-0.5">*</span>}
          </span>
          {subLabel && (
            <span className="text-[11px] text-muted-foreground font-normal">
              {subLabel}
            </span>
          )}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <CustomButton
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-w-0 shadow-2xs font-normal transition-all duration-200 text-left cursor-pointer",
              SIZE_CLASSES[size],
              selectedValues.length === 0 && "text-muted-foreground",
              open && "bg-background border-primary text-foreground ring-2 ring-primary/25",
              error && "border-destructive focus:border-destructive",
              disabled && "opacity-50 cursor-not-allowed bg-muted/20",
              className
            )}
            disabled={disabled}
          >
            <span
              className={cn(
                "text-base md:text-sm truncate min-w-0 flex-1 font-normal",
                selectedValues.length === 0 ? "text-muted-foreground" : "text-foreground font-medium"
              )}
            >
              {selectedValues.length === 0
                ? placeholder
                : `${selectedValues.length} item(s) selected`}
            </span>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0 ml-1.5" />
          </CustomButton>
        </PopoverTrigger>

        <PopoverContent
          className="min-w-[var(--radix-popover-trigger-width)] w-auto max-w-[90vw] sm:max-w-xs md:max-w-sm p-1.5 rounded-[12px] shadow-lg border-border bg-popover z-50 pointer-events-auto"
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
              isLoading={loading}
              onClear={() => setSearchTerm("")}
              className="text-base md:text-sm font-normal text-foreground placeholder:text-muted-foreground"
            />
            <CommandList className="max-h-52 overflow-y-auto">
              <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                {loading ? "Loading..." : emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {/* Select All Option */}
                {showSelectAll && data.length > 0 && (
                  <CommandItem
                    onSelect={handleToggleSelectAll}
                    className={cn(
                      "h-9 px-3 text-xs rounded-[8px] flex items-center gap-2.5 cursor-pointer border-b border-border/40 my-0.5 select-none transition-colors",
                      isAllSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent text-foreground font-medium"
                    )}
                  >
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleToggleSelectAll}
                      className="rounded-md"
                    />
                    <span className="text-xs font-extrabold text-foreground">
                      {selectAllLabel} ({data.length})
                    </span>
                  </CommandItem>
                )}

                {/* Individual Items */}
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
                      onSelect={() => handleToggleItem(item)}
                      ref={index === data.length - 1 ? sentinelRef : null}
                      className={cn(
                        "h-9 px-3 text-xs rounded-[8px] flex items-center justify-between gap-2 cursor-pointer transition-all my-0.5 select-none",
                        selected
                          ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => handleToggleItem(item)}
                          className="rounded-md"
                        />
                        <span className="truncate flex-1 text-left text-xs font-medium text-foreground">
                          {renderItem ? renderItem(item) : labelText}
                        </span>
                      </div>
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

              {/* Sentinel for Infinite Scroll Pagination */}
              <div ref={sentinelRef} className="py-2 text-center text-xs text-muted-foreground">
                {loading && (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span>Loading more...</span>
                  </div>
                )}
                {lastPage && data.length > 0 && !loading && (
                  <span className="text-[10px] text-muted-foreground/60">No more items</span>
                )}
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Items Listed Under Component in Multi-Row Flex Wrap Container */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 px-0.5 w-full">
          {selectedValues.map((item) => {
            const id = getId(item);
            const labelText = getLabel(item);
            if (renderBadge) {
              return renderBadge(item, () => onChange(selectedValues.filter((v) => getId(v) !== id)));
            }
            return (
              <Badge
                key={id}
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold"
              >
                {labelText}
                <X
                  className="h-3 w-3 hover:text-destructive cursor-pointer ml-0.5"
                  onClick={(e) => handleRemoveItem(item, e)}
                />
              </Badge>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-destructive font-medium mt-1">{error}</p>}
    </div>
  );
}
