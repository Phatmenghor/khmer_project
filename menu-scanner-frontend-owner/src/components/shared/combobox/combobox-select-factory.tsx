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
            "w-full justify-between bg-white hover:bg-white",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled || isLoading}
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
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
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={String(option.value)}
                  onSelect={() => {
                    onChange?.(value === option.value ? null : option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-1 h-3 w-3",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
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
