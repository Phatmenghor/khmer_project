"use client";

import { useState, useRef, useCallback } from "react";
import { Check, ChevronRight, Loader2, ChevronsUpDown, X } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

// ─── Brand Filter Component ───
interface POSFilterBrandProps {
  selectedBrand: BrandResponseModel | null;
  brands: BrandResponseModel[];
  brandsLoading: boolean;
  brandOpen: boolean;
  onBrandChange: (brand: BrandResponseModel | null) => void;
  onOpenChange: (open: boolean) => void;
}

export function POSFilterBrand({
  selectedBrand,
  brands,
  brandsLoading,
  brandOpen,
  onBrandChange,
  onOpenChange,
}: POSFilterBrandProps) {
  return (
    <Popover open={brandOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={brandOpen}
          className="max-md:w-[100px] md:w-[130px] justify-between h-9 text-sm max-md:text-xs"
        >
          {selectedBrand?.name || "Brands"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[130px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onBrandChange(null);
                  onOpenChange(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedBrand === null ? "opacity-100" : "opacity-0"
                  )}
                />
                All Brands
              </CommandItem>
              {brandsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                brands.map((brand) => (
                  <CommandItem
                    key={brand.id}
                    value={brand.id}
                    onSelect={() => {
                      onBrandChange(brand);
                      onOpenChange(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedBrand?.id === brand.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {brand.name}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Promotion Filter Component ───
interface POSFilterPromotionProps {
  promotionFilter: boolean | undefined;
  promotionOpen: boolean;
  onPromotionChange: (filter: boolean | undefined) => void;
  onOpenChange: (open: boolean) => void;
}

export function POSFilterPromotion({
  promotionFilter,
  promotionOpen,
  onPromotionChange,
  onOpenChange,
}: POSFilterPromotionProps) {
  return (
    <Popover open={promotionOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={promotionOpen}
          className="max-md:w-[100px] md:w-[130px] justify-between h-9 text-sm max-md:text-xs"
        >
          {promotionFilter === undefined ? "All Products" : "Promotion"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[130px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onPromotionChange(undefined);
                  onOpenChange(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    promotionFilter === undefined ? "opacity-100" : "opacity-0"
                  )}
                />
                All Products
              </CommandItem>
              <CommandItem
                value="promotion"
                onSelect={() => {
                  onPromotionChange(true);
                  onOpenChange(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    promotionFilter === true ? "opacity-100" : "opacity-0"
                  )}
                />
                Promotion
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Category Horizontal Scroll Component ───
interface POSCategoryScrollProps {
  categories: CategoriesResponseModel[];
  selectedCategory: CategoriesResponseModel | null;
  categoriesLoading: boolean;
  onCategoryChange: (category: CategoriesResponseModel | null) => void;
}

export function POSCategoryScroll({
  categories,
  selectedCategory,
  categoriesLoading,
  onCategoryChange,
}: POSCategoryScrollProps) {
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = useCallback((direction: "left" | "right") => {
    if (!categoryScrollRef.current) return;
    const scrollContainer = categoryScrollRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (!scrollContainer) return;

    const scrollAmount = 200;
    const currentScroll = scrollContainer.scrollLeft;
    const newScroll =
      direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount;

    scrollContainer.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="shrink-0 border-b bg-muted/10 flex items-center gap-2 px-2 h-10">
      {/* Left Scroll Button */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0 hover:bg-primary/10"
        onClick={() => scrollCategories("left")}
        title="Scroll left"
      >
        <ChevronRight className="h-5 w-5 transform rotate-180" />
      </Button>

      {/* Categories ScrollArea */}
      <ScrollArea className="flex-1 h-10 overflow-hidden" ref={categoryScrollRef}>
        <div className="flex gap-3 px-2 h-10 items-center">
          {/* All Categories Button */}
          <button
            onClick={() => onCategoryChange(null)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shadow-sm hover:shadow-md cursor-pointer h-10 flex items-center",
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-white border border-border text-foreground hover:bg-muted"
            )}
          >
            All
          </button>

          {/* Category Items */}
          {categoriesLoading ? (
            <div className="flex items-center gap-2 px-3 h-10">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category)}
                className={cn(
                  "shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shadow-sm hover:shadow-md cursor-pointer h-10 flex items-center",
                  selectedCategory?.id === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border border-border text-foreground hover:bg-muted"
                )}
                title={category.name}
              >
                {category.name}
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Right Scroll Button */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0 hover:bg-primary/10"
        onClick={() => scrollCategories("right")}
        title="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

// ─── Clear Filters Button Component ───
interface POSClearFiltersButtonProps {
  isFiltered: boolean;
  onClear: () => void;
}

export function POSClearFiltersButton({ isFiltered, onClear }: POSClearFiltersButtonProps) {
  if (!isFiltered) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={onClear}
      title="Clear all filters"
    >
      <X className="w-4 h-4" />
    </Button>
  );
}
