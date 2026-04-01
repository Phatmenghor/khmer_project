import React, { useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { Badge } from "@/components/ui/badge";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

interface StockItemsFilterPanelProps {
  // Search
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Sort
  sortByValue: string;
  sortByOptions: Array<{ value: string; label: string }>;
  onSortByChange: (value: string) => void;

  sortDirectionValue: string;
  sortDirectionOptions: Array<{ value: string; label: string }>;
  onSortDirectionChange: (value: string) => void;

  // Filters
  selectedBrand: BrandResponseModel | null;
  onBrandChange: (brand: BrandResponseModel | null) => void;

  selectedCategories: CategoriesResponseModel | null;
  onCategoriesChange: (categories: CategoriesResponseModel | null) => void;

  stockStatusValue: string;
  stockStatusOptions: Array<{ value: string; label: string }>;
  onStockStatusChange: (value: string) => void;

  productStatusValue: string;
  productStatusOptions: Array<{ value: string; label: string }>;
  onProductStatusChange: (value: string) => void;

  hasSizesValue: string;
  hasSizesOptions: Array<{ value: string; label: string }>;
  onHasSizesChange: (value: string) => void;

  // Low stock threshold
  lowStockThresholdValue: string;
  onLowStockThresholdChange: (value: string) => void;
}

/**
 * Stock Items Filter Panel - Classic card style
 * Filters on top row, search on bottom left, filter badges below when active
 * All filters maintain same height
 */
export const StockItemsFilterPanel: React.FC<StockItemsFilterPanelProps> = ({
  // Search
  searchValue,
  onSearchChange,

  // Sort
  sortByValue,
  sortByOptions,
  onSortByChange,
  sortDirectionValue,
  sortDirectionOptions,
  onSortDirectionChange,

  // Filters
  selectedBrand,
  onBrandChange,
  selectedCategories,
  onCategoriesChange,
  stockStatusValue,
  stockStatusOptions,
  onStockStatusChange,
  productStatusValue,
  productStatusOptions,
  onProductStatusChange,
  hasSizesValue,
  hasSizesOptions,
  onHasSizesChange,

  // Low stock threshold
  lowStockThresholdValue,
  onLowStockThresholdChange,
}) => {
  // Calculate active filters for badge display
  const activeFilters = useMemo(() => {
    const filters = [];

    if (sortByValue && sortByValue !== "totalStock") {
      const sortLabel = sortByOptions.find((o) => o.value === sortByValue)?.label;
      filters.push({ key: "sort", label: "Sort", value: sortLabel || sortByValue });
    }

    if (sortDirectionValue && sortDirectionValue !== "DESC") {
      filters.push({ key: "direction", label: "Direction", value: sortDirectionValue });
    }

    if (selectedBrand) {
      filters.push({ key: "brand", label: "Brand", value: selectedBrand.name });
    }

    if (selectedCategories) {
      filters.push({ key: "category", label: "Category", value: selectedCategories.name });
    }

    if (stockStatusValue && stockStatusValue !== "ALL") {
      filters.push({ key: "stock", label: "Stock", value: stockStatusValue });
    }

    if (productStatusValue && productStatusValue !== "ALL") {
      filters.push({ key: "status", label: "Status", value: productStatusValue });
    }

    if (hasSizesValue && hasSizesValue !== "ALL") {
      const typeLabel = hasSizesValue === "WITH_SIZES" ? "With Sizes" : "Without Sizes";
      filters.push({ key: "type", label: "Type", value: typeLabel });
    }

    if (lowStockThresholdValue) {
      filters.push({
        key: "lowstock",
        label: "Low Stock",
        value: `< ${lowStockThresholdValue}`,
      });
    }

    return filters;
  }, [
    sortByValue,
    sortDirectionValue,
    selectedBrand,
    selectedCategories,
    stockStatusValue,
    productStatusValue,
    hasSizesValue,
    lowStockThresholdValue,
    sortByOptions,
  ]);

  return (
    <div className="bg-white border border-border rounded-lg p-5 space-y-4">
      {/* Header */}
      <div className="mb-1">
        <h2 className="text-sm font-semibold text-foreground">Stock Items (Products & Sizes)</h2>
      </div>

      {/* Filters Row 1 - All filters with same height (h-10) */}
      <div className="flex flex-wrap gap-3 items-stretch">
        {/* Sort Field */}
        <div className="flex-1 min-w-[160px]">
          <CustomSelect
            options={sortByOptions}
            value={sortByValue}
            placeholder="Sort by"
            onValueChange={onSortByChange}
            size="sm"
          />
        </div>

        {/* Sort Direction */}
        <div className="flex-1 min-w-[140px]">
          <CustomSelect
            options={sortDirectionOptions}
            value={sortDirectionValue}
            placeholder="Order"
            onValueChange={onSortDirectionChange}
            size="sm"
          />
        </div>

        {/* Brand Filter */}
        <div className="flex-1 min-w-[140px]">
          <ComboboxSelectBrand
            dataSelect={selectedBrand}
            onChangeSelected={onBrandChange}
            placeholder="All Brand"
            showAllOption={true}
            size="sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-[140px]">
          <ComboboxSelectCategories
            dataSelect={selectedCategories}
            onChangeSelected={onCategoriesChange}
            placeholder="All Categories"
            showAllOption={true}
            size="sm"
          />
        </div>

        {/* Stock Status */}
        <div className="flex-1 min-w-[130px]">
          <CustomSelect
            options={stockStatusOptions}
            value={stockStatusValue}
            placeholder="Stock"
            onValueChange={onStockStatusChange}
            size="sm"
          />
        </div>

        {/* Product Status */}
        <div className="flex-1 min-w-[130px]">
          <CustomSelect
            options={productStatusOptions}
            value={productStatusValue}
            placeholder="Status"
            onValueChange={onProductStatusChange}
            size="sm"
          />
        </div>

        {/* Product Type */}
        <div className="flex-1 min-w-[130px]">
          <CustomSelect
            options={hasSizesOptions}
            value={hasSizesValue}
            placeholder="Type"
            onValueChange={onHasSizesChange}
            size="sm"
          />
        </div>

        {/* Low Stock Threshold - Search-style input */}
        <div className="flex-1 min-w-[140px]">
          <div className="relative h-10">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Low Stock"
              value={lowStockThresholdValue}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow positive integers
                if (value === "" || /^\d+$/.test(value)) {
                  onLowStockThresholdChange(value);
                }
              }}
              className="h-10 text-xs pr-8"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Row 2 - Search on left */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search product name..."
              value={searchValue}
              onChange={onSearchChange}
              className="pl-9 h-10 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Badges - Only show if there are active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="text-xs">
              {filter.label}: <span className="font-medium ml-1">{filter.value}</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

