import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";

interface StockItemsFilterPanelProps {

  sortByValue: string;
  sortByOptions: Array<{ value: string; label: string }>;
  onSortByChange: (value: string) => void;

  sortDirectionValue: string;
  sortDirectionOptions: Array<{ value: string; label: string }>;
  onSortDirectionChange: (value: string) => void;


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


  lowStockThresholdValue: string;
  onLowStockThresholdChange: (value: string) => void;


  sortByOptions: Array<{ value: string; label: string }>;
}


export const StockItemsFilterPanel: React.FC<StockItemsFilterPanelProps> = ({

  sortByValue,
  sortByOptions,
  onSortByChange,
  sortDirectionValue,
  sortDirectionOptions,
  onSortDirectionChange,


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


  lowStockThresholdValue,
  onLowStockThresholdChange,
}) => {

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
      {}
      <div className="flex flex-wrap gap-3 items-stretch">
        {}
        <CustomSelect
          options={sortByOptions}
          value={sortByValue}
          placeholder="Sort by"
          onValueChange={onSortByChange}
        />

        {}
        <CustomSelect
          options={sortDirectionOptions}
          value={sortDirectionValue}
          placeholder="Order"
          onValueChange={onSortDirectionChange}
        />

        {}
        <ComboboxSelectBrand
          dataSelect={selectedBrand}
          onChangeSelected={onBrandChange}
          placeholder="All Brand"
          showAllOption={true}
        />

        {}
        <ComboboxSelectCategories
          dataSelect={selectedCategories}
          onChangeSelected={onCategoriesChange}
          placeholder="All Categories"
          showAllOption={true}
        />

        {}
        <CustomSelect
          options={stockStatusOptions}
          value={stockStatusValue}
          placeholder="Stock"
          onValueChange={onStockStatusChange}
        />

        {}
        <CustomSelect
          options={productStatusOptions}
          value={productStatusValue}
          placeholder="Status"
          onValueChange={onProductStatusChange}
        />

        {}
        <CustomSelect
          options={hasSizesOptions}
          value={hasSizesValue}
          placeholder="Type"
          onValueChange={onHasSizesChange}
        />

        {}
        <Input
          type="number"
          inputMode="numeric"
          placeholder="Low Stock Threshold"
          value={lowStockThresholdValue}
          onChange={(e) => {
            const value = e.target.value;

            if (value === "" || /^\d+$/.test(value)) {
              onLowStockThresholdChange(value);
            }
          }}
          className="h-10 text-xs min-w-[140px]"
          min="0"
        />
      </div>

      {}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="text-xs">
              {filter.label}: <span className="font-medium ml-1">{filter.value}</span>
            </Badge>
          ))}
        </div>
      )}

      {}
    </>
  );
};
