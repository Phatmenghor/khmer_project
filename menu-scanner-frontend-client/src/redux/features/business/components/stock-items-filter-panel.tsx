import React from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { Button } from "@/components/ui/button";
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

  // Action button
  onAddClick?: () => void;
}

/**
 * Modern responsive filter panel for Stock Items
 * Search on left, filters on right with dynamic wrapping
 * Responsive layout that adapts to all screen sizes
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

  // Action button
  onAddClick,
}) => {
  return (
    <div className="space-y-4">
      {/* Search and Filters Container */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Search Input - Left Side */}
        <div className="flex-shrink-0 lg:flex-1 lg:max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search product name..."
              value={searchValue}
              onChange={onSearchChange}
              className="pl-9 h-10"
            />
          </div>
        </div>

        {/* Filters Container - Right Side with Dynamic Flow */}
        <div className="flex flex-wrap gap-3 lg:flex-1 justify-end items-end">
          {/* Sort Field */}
          <div className="w-full sm:w-auto">
            <CustomSelect
              options={sortByOptions}
              value={sortByValue}
              placeholder="Sort by"
              onValueChange={onSortByChange}
              label="Sort"
              size="sm"
            />
          </div>

          {/* Sort Direction */}
          <div className="w-full sm:w-auto">
            <CustomSelect
              options={sortDirectionOptions}
              value={sortDirectionValue}
              placeholder="Direction"
              onValueChange={onSortDirectionChange}
              label="Order"
              size="sm"
            />
          </div>

          {/* Brand Filter */}
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <ComboboxSelectBrand
              dataSelect={selectedBrand}
              onChangeSelected={onBrandChange}
              placeholder="All Brand"
              showAllOption={true}
              size="sm"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <ComboboxSelectCategories
              dataSelect={selectedCategories}
              onChangeSelected={onCategoriesChange}
              placeholder="All Categories"
              showAllOption={true}
              size="sm"
            />
          </div>

          {/* Stock Status */}
          <div className="w-full sm:w-auto">
            <CustomSelect
              options={stockStatusOptions}
              value={stockStatusValue}
              placeholder="Stock Status"
              onValueChange={onStockStatusChange}
              label="Stock"
              size="sm"
            />
          </div>

          {/* Product Status */}
          <div className="w-full sm:w-auto">
            <CustomSelect
              options={productStatusOptions}
              value={productStatusValue}
              placeholder="Product Status"
              onValueChange={onProductStatusChange}
              label="Status"
              size="sm"
            />
          </div>

          {/* Product Type */}
          <div className="w-full sm:w-auto">
            <CustomSelect
              options={hasSizesOptions}
              value={hasSizesValue}
              placeholder="All Products"
              onValueChange={onHasSizesChange}
              label="Type"
              size="sm"
            />
          </div>

          {/* Low Stock Threshold */}
          <div className="w-full sm:w-auto sm:max-w-[140px]">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Low Stock
            </label>
            <Input
              type="number"
              placeholder="Threshold"
              value={lowStockThresholdValue}
              onChange={(e) => onLowStockThresholdChange(e.target.value)}
              className="h-10 text-xs"
              min="0"
            />
          </div>

          {/* Add Button */}
          {onAddClick && (
            <Button
              onClick={onAddClick}
              variant="default"
              size="sm"
              className="w-full sm:w-auto gap-2 h-10"
              disabled={true}
              title="Select an item and click Edit Stock to manage inventory"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Info Badge */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground px-1">
        {[
          { label: "Sort", value: sortByValue, default: "totalStock" },
          { label: "Direction", value: sortDirectionValue, default: "DESC" },
          { label: "Brand", value: selectedBrand?.name, default: null },
          { label: "Category", value: selectedCategories?.name, default: null },
          { label: "Stock", value: stockStatusValue, default: "ALL" },
          { label: "Status", value: productStatusValue, default: "ALL" },
          { label: "Type", value: hasSizesValue, default: "ALL" },
          { label: "Low Stock", value: lowStockThresholdValue, default: "" },
        ]
          .filter(
            (item) =>
              item.value && item.value !== item.default && item.value !== ""
          )
          .map((item, idx) => (
            <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
              {item.label}: <span className="font-medium">{item.value}</span>
            </span>
          ))}
      </div>
    </div>
  );
};
