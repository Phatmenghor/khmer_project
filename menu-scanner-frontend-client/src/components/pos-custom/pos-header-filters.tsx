"use client";

import React from "react";
import { Search, X, ChevronsUpDown, Check, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import {
  setSearchTerm,
  setSelectedCategory,
  setSelectedBrand,
  setPromotionFilter,
  setBrandOpen,
  setCategoryOpen,
  setPromotionOpen,
  setMinPrice,
  setMaxPrice,
} from "@/features/business/store/slice/pos-page-slice";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";

interface POSHeaderFiltersProps {
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchTerm: string;
  selectedBrand: BrandResponseModel | null;
  selectedCategory: CategoriesResponseModel | null;
  categories: CategoriesResponseModel[];
  brands: BrandResponseModel[];
  brandOpen: boolean;
  categoryOpen: boolean;
  promotionOpen: boolean;
  promotionFilter?: boolean;
  minPrice?: string;
  maxPrice?: string;
}

export function POSHeaderFilters({
  searchInputRef,
  searchTerm,
  selectedBrand,
  selectedCategory,
  categories,
  brands,
  brandOpen,
  categoryOpen,
  promotionOpen,
  promotionFilter,
  minPrice = "",
  maxPrice = "",
}: POSHeaderFiltersProps) {
  const dispatch = useAppDispatch();

  const isFilterActive = Boolean(
    searchTerm || selectedCategory || selectedBrand || promotionFilter !== undefined || minPrice || maxPrice
  );

  return (
    <div className="flex flex-col gap-2 p-2.5 sm:px-4 sm:py-2.5 border-b border-border/80 bg-card/95 backdrop-blur-md shrink-0 shadow-2xs">
      {/* Dynamic Row 1: Search, Category Combobox, Brand Combobox */}
      <div className="flex flex-wrap items-center gap-2.5 w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px] sm:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Search products by name, SKU..."
            className="pl-9 pr-8 h-[36px] text-xs sm:text-sm font-normal bg-muted/30 border-border/70 focus-visible:bg-background transition-all rounded-[8px]"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => dispatch(setSearchTerm(""))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Combobox */}
        <Popover open={categoryOpen} onOpenChange={(open) => dispatch(setCategoryOpen(open))}>
          <PopoverTrigger asChild>
            <CustomButton
              variant="outline"
              role="combobox"
              aria-expanded={categoryOpen}
              className={cn(
                "w-[130px] sm:w-[170px] justify-between h-[36px] text-xs sm:text-sm font-semibold rounded-[8px] border-border/70 bg-background",
                selectedCategory && "border-primary/60 bg-primary/10 text-primary font-bold"
              )}
            >
              <span className="truncate">{selectedCategory?.name || "All Categories"}</span>
              <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
            </CustomButton>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-1 border border-border/80 bg-popover shadow-md rounded-[10px]" align="start">
            <Command>
              <CommandInput placeholder="Search categories..." className="h-9 text-xs sm:text-sm font-medium" />
              <CommandEmpty className="text-xs sm:text-sm py-2 text-center text-muted-foreground font-medium">No category found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    value=""
                    onSelect={() => {
                      dispatch(setSelectedCategory(null));
                      dispatch(setCategoryOpen(false));
                    }}
                    className="cursor-pointer text-xs sm:text-sm font-medium"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-primary",
                        selectedCategory === null ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Categories
                  </CommandItem>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => {
                        dispatch(setSelectedCategory(category as any));
                        dispatch(setCategoryOpen(false));
                      }}
                      className="cursor-pointer text-xs sm:text-sm font-medium"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-primary",
                          selectedCategory?.id === category.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{category.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Brand Combobox */}
        <Popover open={brandOpen} onOpenChange={(open) => dispatch(setBrandOpen(open))}>
          <PopoverTrigger asChild>
            <CustomButton
              variant="outline"
              role="combobox"
              aria-expanded={brandOpen}
              className={cn(
                "w-[120px] sm:w-[160px] justify-between h-[36px] text-xs sm:text-sm font-semibold rounded-[8px] border-border/70 bg-background",
                selectedBrand && "border-primary/60 bg-primary/10 text-primary font-bold"
              )}
            >
              <span className="truncate">{selectedBrand?.name || "All Brands"}</span>
              <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
            </CustomButton>
          </PopoverTrigger>
          <PopoverContent className="w-[190px] p-1 border border-border/80 bg-popover shadow-md rounded-[10px]" align="start">
            <Command>
              <CommandInput placeholder="Search brands..." className="h-9 text-xs sm:text-sm font-medium" />
              <CommandEmpty className="text-xs sm:text-sm py-2 text-center text-muted-foreground font-medium">No brand found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    value=""
                    onSelect={() => {
                      dispatch(setSelectedBrand(null));
                      dispatch(setBrandOpen(false));
                    }}
                    className="cursor-pointer text-xs sm:text-sm font-medium"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-primary",
                        selectedBrand === null ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Brands
                  </CommandItem>
                  {brands.map((brand) => (
                    <CommandItem
                      key={brand.id}
                      value={brand.name}
                      onSelect={() => {
                        dispatch(setSelectedBrand(brand as any));
                        dispatch(setBrandOpen(false));
                      }}
                      className="cursor-pointer text-xs sm:text-sm font-medium"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-primary",
                          selectedBrand?.id === brand.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{brand.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Dynamic Row 2: Promotion Filter, Price Range Inputs & Clear Button */}
      <div className="flex flex-wrap items-center gap-2.5 w-full">
        {/* Promotion Filter Combobox */}
        <Popover open={promotionOpen} onOpenChange={(open) => dispatch(setPromotionOpen(open))}>
          <PopoverTrigger asChild>
            <CustomButton
              variant="outline"
              role="combobox"
              aria-expanded={promotionOpen}
              className={cn(
                "w-[120px] sm:w-[155px] justify-between h-[36px] text-xs sm:text-sm font-semibold rounded-[8px] border-border/70 bg-background",
                promotionFilter === true && "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold",
                promotionFilter === false && "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
              )}
            >
              <span className="truncate">
                {promotionFilter === undefined
                  ? "All Items"
                  : promotionFilter === true
                  ? "🔥 On Sale"
                  : "Standard Items"}
              </span>
              <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
            </CustomButton>
          </PopoverTrigger>
          <PopoverContent className="w-[170px] p-1 border border-border/80 bg-popover shadow-md rounded-[10px]" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      dispatch(setPromotionFilter(undefined));
                      dispatch(setPromotionOpen(false));
                    }}
                    className="cursor-pointer text-xs sm:text-sm py-1.5 font-medium"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-primary",
                        promotionFilter === undefined ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Items
                  </CommandItem>

                  <CommandItem
                    value="promotion"
                    onSelect={() => {
                      dispatch(setPromotionFilter(true));
                      dispatch(setPromotionOpen(false));
                    }}
                    className="cursor-pointer text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 py-1.5"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-amber-500",
                        promotionFilter === true ? "opacity-100" : "opacity-0"
                      )}
                    />
                    🔥 On Sale
                  </CommandItem>

                  <CommandItem
                    value="no-promotion"
                    onSelect={() => {
                      dispatch(setPromotionFilter(false));
                      dispatch(setPromotionOpen(false));
                    }}
                    className="cursor-pointer text-xs sm:text-sm py-1.5 font-medium"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-primary",
                        promotionFilter === false ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Standard Items
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Price Range Input Group - Uniform h-[36px] height */}
        <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 rounded-[8px] border border-border/70 h-[36px]">
          <span className="text-xs text-muted-foreground font-extrabold flex items-center gap-0.5 whitespace-nowrap">
            <DollarSign className="w-3.5 h-3.5 text-primary shrink-0" />
            Price
          </span>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Min $"
            value={minPrice}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, "");
              dispatch(setMinPrice(val));
            }}
            className="h-[26px] w-[70px] sm:w-[80px] text-xs sm:text-sm px-2 bg-background border-border/60 rounded-[6px] font-semibold"
          />
          <span className="text-muted-foreground text-xs font-extrabold">-</span>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Max $"
            value={maxPrice}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, "");
              dispatch(setMaxPrice(val));
            }}
            className="h-[26px] w-[70px] sm:w-[80px] text-xs sm:text-sm px-2 bg-background border-border/60 rounded-[6px] font-semibold"
          />
        </div>

        {/* Clear All Filters */}
        {isFilterActive && (
          <CustomButton
            variant="ghost"
            size="sm"
            className="h-[36px] px-3 text-xs sm:text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-[8px] gap-1.5 ml-auto sm:ml-0"
            onClick={() => {
              dispatch(setSearchTerm(""));
              dispatch(setSelectedCategory(null));
              dispatch(setSelectedBrand(null));
              dispatch(setPromotionFilter(undefined));
              dispatch(setMinPrice(""));
              dispatch(setMaxPrice(""));
            }}
            title="Clear all filters"
          >
            <X className="w-4 h-4" />
            Clear
          </CustomButton>
        )}
      </div>
    </div>
  );
}
