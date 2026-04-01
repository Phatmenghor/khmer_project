import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { Badge } from "@/components/ui/badge";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

interface StockItemsFilterPanelProps {
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

  // Sort options for badge filtering
  sortByOptions: Array<{ value: string; label: string }>;
}

/**
 * Stock Items Filter Panel - Works with CardHeaderSection
 * Renders filter components (without card wrapper or search)
 * Search is handled by CardHeaderSection
 */
export const StockItemsFilterPanel: React.FC<StockItemsFilterPanelProps> = ({
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
    <>
      {/* Filters Row - All filters with same height */}
      <div className="flex flex-wrap gap-3 items-stretch">
        {/* Sort Field */}
        <CustomSelect
          options={sortByOptions}
          value={sortByValue}
          placeholder="Sort by"
          onValueChange={onSortByChange}
        />

        {/* Sort Direction */}
        <CustomSelect
          options={sortDirectionOptions}
          value={sortDirectionValue}
          placeholder="Order"
          onValueChange={onSortDirectionChange}
        />

        {/* Brand Filter */}
        <ComboboxSelectBrand
          dataSelect={selectedBrand}
          onChangeSelected={onBrandChange}
          placeholder="All Brand"
          showAllOption={true}
        />

        {/* Category Filter */}
        <ComboboxSelectCategories
          dataSelect={selectedCategories}
          onChangeSelected={onCategoriesChange}
          placeholder="All Categories"
          showAllOption={true}
        />

        {/* Stock Status */}
        <CustomSelect
          options={stockStatusOptions}
          value={stockStatusValue}
          placeholder="Stock"
          onValueChange={onStockStatusChange}
        />

        {/* Product Status */}
        <CustomSelect
          options={productStatusOptions}
          value={productStatusValue}
          placeholder="Status"
          onValueChange={onProductStatusChange}
        />

        {/* Product Type */}
        <CustomSelect
          options={hasSizesOptions}
          value={hasSizesValue}
          placeholder="Type"
          onValueChange={onHasSizesChange}
        />

        {/* Low Stock Threshold - Search-style input */}
        <div className="flex-1 min-w-[140px]">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Low Stock Threshold"
            value={lowStockThresholdValue}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow positive integers
              if (value === "" || /^\d+$/.test(value)) {
                onLowStockThresholdChange(value);
              }
            }}
            className="h-10 text-xs"
            min="0"
          />
        </div>
      </div>

      {/* Active Filters Badges - Only show if there are active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="text-xs">
              {filter.label}: <span className="font-medium ml-1">{filter.value}</span>
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};

