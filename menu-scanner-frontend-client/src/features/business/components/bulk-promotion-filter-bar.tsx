"use client";

import React from "react";
import { Search, X, Trash2 } from "lucide-react";
import { CustomCheckbox } from "@/components/shared/common/custom-checkbox";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { CustomInput } from "@/components/shared/form-field/custom-input";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";

const PROMOTION_FILTER_OPTIONS = [
  { value: "ALL", label: "All Products" },
  { value: "HAS_PROMOTION", label: "Has Promotion" },
  { value: "NO_PROMOTION", label: "No Promotion" },
];

interface BulkPromotionFilterBarProps {
  allSelected: boolean;
  someSelected: boolean;
  selectedProductCount: number;
  totalProductsOnPage: number;
  handleSelectAll: (checked: boolean) => void;
  searchQuery: string;
  handleSearchChange: (value: string) => void;
  handleClearSearch: () => void;
  selectedIdsLength: number;
  handleClearAllSelections: () => void;
  selectedCategories: CategoriesResponseModel | null;
  handleCategoriesChange: (cat: CategoriesResponseModel | null) => void;
  selectedBrand: BrandResponseModel | null;
  handleBrandChange: (brand: BrandResponseModel | null) => void;
  hasPromotionFilter: string;
  handlePromotionFilterChange: (val: string) => void;
  isLoading: boolean;
}

export function BulkPromotionFilterBar({
  allSelected,
  someSelected,
  selectedProductCount,
  totalProductsOnPage,
  handleSelectAll,
  searchQuery,
  handleSearchChange,
  handleClearSearch,
  selectedIdsLength,
  handleClearAllSelections,
  selectedCategories,
  handleCategoriesChange,
  selectedBrand,
  handleBrandChange,
  hasPromotionFilter,
  handlePromotionFilterChange,
  isLoading,
}: BulkPromotionFilterBarProps) {
  return (
    <div className="rounded border border-border/60 bg-gradient-to-r from-muted/40 to-muted/20 hover:from-muted/50 hover:to-muted/30 transition-all duration-200 overflow-hidden">
      {/* Top filter section */}
      <div className="px-3 py-2 border-b border-border/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          
          {/* Select all & Status */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <CustomCheckbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              disabled={isLoading}
              size="lg"
              variant="default"
              ariaLabel="Select all products on this page"
              className="flex-shrink-0"
            />

            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-semibold text-foreground">
                {allSelected
                  ? "All products selected"
                  : someSelected
                    ? `${selectedProductCount} products selected`
                    : "Select all products"}
              </span>
              <span className="text-xs text-muted-foreground">
                {totalProductsOnPage} products on this page
              </span>
            </div>
          </div>

          {/* Search and clear button */}
          <div className="flex items-center gap-1 flex-wrap w-full sm:w-auto">
            <div className="flex-1 sm:flex-none sm:w-auto sm:min-w-[300px] sm:max-w-[370px]">
              <CustomInput
                type="text"
                placeholder="Search product..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="h-3.5 w-3.5" />}
                rightIcon={searchQuery ? <X className="h-3.5 w-3.5" /> : undefined}
                onRightIconClick={handleClearSearch}
                size="sm"
                className="bg-background"
              />
            </div>

            {selectedIdsLength > 0 && (
              <CustomButton variant="unstyled" size="unstyled"
                type="button"
                onClick={handleClearAllSelections}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-[8px] text-xs font-medium text-destructive border border-destructive/40 bg-destructive/5 hover:border-destructive/70 hover:bg-destructive/15 hover:text-destructive transition-colors duration-150 flex-shrink-0"
                title="Clear all selections (stored in browser)"
              >
                <Trash2 className="h-2.5 w-2.5" />
                <span className="hidden sm:inline">Clear</span>
              </CustomButton>
            )}
          </div>
        </div>
      </div>

      {/* Categories & Brand & Status filter options */}
      <div className="px-3 py-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
        <div className="min-w-0">
          <ComboboxSelectCategories
            dataSelect={selectedCategories}
            onChangeSelected={handleCategoriesChange}
            placeholder="All Categories"
            showAllOption={true}
          />
        </div>

        <div className="min-w-0">
          <ComboboxSelectBrand
            dataSelect={selectedBrand}
            onChangeSelected={handleBrandChange}
            placeholder="All Brand"
            showAllOption={true}
          />
        </div>

        <div className="min-w-0">
          <CustomSelect
            options={PROMOTION_FILTER_OPTIONS}
            value={hasPromotionFilter}
            placeholder="All Products"
            onValueChange={handlePromotionFilterChange}
            className="w-full"
            label="Promotion Status"
            size="md"
          />
        </div>
      </div>
    </div>
  );
}
