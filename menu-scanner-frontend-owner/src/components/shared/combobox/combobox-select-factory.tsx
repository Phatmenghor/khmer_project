"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

export interface ComboboxOption {
  value: string | number;
  label: string;
}

export interface ComboboxSelectFactoryProps {
  value?: string | number | null;
  onChange?: (value: string | number | null) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
}

/**
 * Generic factory component for combobox selection
 * Replaces all individual combobox components with a single reusable component
 *
 * Usage:
 * <ComboboxSelectFactory
 *   options={brands}
 *   value={selectedBrand}
 *   onChange={setSelectedBrand}
 *   placeholder="Select a brand"
 * />
 */
export function ComboboxSelectFactory({
  value,
  onChange,
  options,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  disabled = false,
  className,
  isLoading = false,
}: ComboboxSelectFactoryProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!value) return placeholder;
    const selected = options.find((opt) => opt.value === value);
    return selected?.label || placeholder;
  }, [value, options, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <CustomButton
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-[36px] px-3 text-xs font-medium justify-between rounded-[12px] bg-background border border-border/80 shadow-2xs transition-all duration-200",
            "hover:bg-muted/40 hover:border-border",
            open && "bg-primary/10 border-primary text-primary",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled || isLoading}
        >
          <span className={cn("truncate text-xs text-left flex-1", !value && "text-muted-foreground")}>
            {isLoading ? "Loading..." : selectedLabel}
          </span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </CustomButton>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    value={String(option.value)}
                    onSelect={() => {
                      onChange?.(value === option.value ? null : option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full h-[34px] flex items-center justify-between gap-2 text-left transition-all my-0.5 select-none text-xs rounded-[8px] px-2.5 py-1.5 cursor-pointer",
                      isSelected
                        ? "bg-primary/15 text-primary font-semibold border border-primary/20 shadow-2xs"
                        : "hover:bg-primary/10 hover:text-primary text-foreground"
                    )}
                  >
                    <span className="truncate flex-1 text-left">{option.label}</span>
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-opacity",
                        isSelected ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Factory function to create typed combobox components
 *
 * Usage:
 * export const BrandSelect = createComboboxSelect<Brand>({
 *   getId: (brand) => brand.id,
 *   getLabel: (brand) => brand.name,
 * });
 *
 * Then in components:
 * <BrandSelect brands={brands} value={selectedBrand} onChange={setSelectedBrand} />
 */
export function createComboboxSelect<T>({
  getId,
  getLabel,
  getOptions,
}: {
  getId: (item: T) => string | number;
  getLabel: (item: T) => string;
  getOptions?: (items: T[]) => ComboboxOption[];
}) {
  return function ComboboxSelectComponent({
    items,
    value,
    onChange,
    placeholder,
    disabled,
    className,
    isLoading,
  }: {
    items: T[];
    value?: string | number | null;
    onChange?: (value: string | number | null) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    isLoading?: boolean;
  }) {
    const options: ComboboxOption[] = getOptions
      ? getOptions(items)
      : items.map((item) => ({
          value: getId(item),
          label: getLabel(item),
        }));

    return (
      <ComboboxSelectFactory
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        isLoading={isLoading}
      />
    );
  };
}
