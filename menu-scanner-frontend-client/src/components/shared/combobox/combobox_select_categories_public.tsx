"use client";

import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

interface ComboboxSelectCategoriesPublicProps {
  categories: CategoriesResponseModel[];
  selectedCategory: string;
  onChangeSelected: (categoryId: string) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
}

export function ComboboxSelectCategoriesPublic({
  categories,
  selectedCategory,
  onChangeSelected,
  disabled = false,
  label = "Category",
  size = "md",
  placeholder = "All Categories",
}: ComboboxSelectCategoriesPublicProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-9 text-sm",
    lg: "h-10 text-base",
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedCategoryName = categories.find(
    (c) => c.id === selectedCategory,
  )?.name;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-semibold text-foreground">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-w-[150px] px-3 py-2 transition-all duration-200 border-input",
              sizeClasses[size],
              !selectedCategory && "text-muted-foreground",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/30",
              open && "bg-primary/20 border-primary text-primary",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            disabled={disabled}
          >
            <span className="truncate">
              {selectedCategoryName || placeholder}
            </span>
            <ChevronsUpDown
              className={cn(
                "ml-2 h-4 w-4 shrink-0 transition-all duration-200",
                !open && "opacity-50",
                open && "opacity-100 text-primary rotate-180",
              )}
            />
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
              placeholder="Search category..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList className="max-h-60 overflow-y-auto">
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="__all__"
                  onSelect={() => {
                    onChangeSelected("");
                    setOpen(false);
                  }}
                  className={cn(
                    sizeClasses[size],
                    "hover:bg-primary/10 hover:text-primary cursor-pointer",
                    !selectedCategory &&
                      "bg-primary/20 text-primary font-medium",
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !selectedCategory ? "opacity-100" : "opacity-0",
                    )}
                  />
                  All Categories
                </CommandItem>
                {filteredCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      onChangeSelected(
                        category.id === selectedCategory ? "" : category.id,
                      );
                      setOpen(false);
                    }}
                    className={cn(
                      sizeClasses[size],
                      "hover:bg-primary/10 hover:text-primary cursor-pointer",
                      selectedCategory === category.id &&
                        "bg-primary/20 text-primary font-medium",
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCategory === category.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
