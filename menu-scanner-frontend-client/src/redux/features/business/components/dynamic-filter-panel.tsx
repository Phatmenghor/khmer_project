"use client";

import React from "react";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FilterConfig, FilterPanelConfig } from "./filter-types";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

interface DynamicFilterPanelProps {
  config: FilterPanelConfig;
}

/**
 * DynamicFilterPanel - Reusable filter panel component
 * Renders filters dynamically based on configuration
 * Works across all admin pages (Products, Stock Items, etc.)
 *
 * Usage:
 * ```tsx
 * const filterConfig: FilterPanelConfig = {
 *   title: "Products",
 *   searchValue: filters.search,
 *   searchPlaceholder: "Search...",
 *   onSearchChange: handleSearchChange,
 *   filters: [
 *     {
 *       id: 'sortBy',
 *       type: 'select',
 *       label: 'Sort By',
 *       options: sortOptions,
 *       value: filters.sortBy,
 *       onChange: handleSortChange,
 *     },
 *     // more filters...
 *   ],
 *   buttonText: 'Add',
 *   buttonDisabled: true,
 * };
 *
 * return <DynamicFilterPanel config={filterConfig} />;
 * ```
 */
export const DynamicFilterPanel: React.FC<DynamicFilterPanelProps> = ({
  config,
}) => {
  const renderFilter = (filter: FilterConfig): React.ReactNode => {
    switch (filter.type) {
      case 'select':
        return (
          <CustomSelect
            key={filter.id}
            options={filter.options || []}
            value={filter.value}
            placeholder={filter.placeholder || "Select..."}
            onValueChange={filter.onChange}
            label={filter.label}
            disabled={filter.disabled}
          />
        );

      case 'combobox-brand':
        return (
          <ComboboxSelectBrand
            key={filter.id}
            dataSelect={filter.value as BrandResponseModel | null}
            onChangeSelected={filter.onChange}
            placeholder={filter.placeholder || "All Brand"}
            showAllOption={
              (filter as any).showAllOption !== false
            }
            label={filter.label}
            disabled={filter.disabled}
          />
        );

      case 'combobox-categories':
        return (
          <ComboboxSelectCategories
            key={filter.id}
            dataSelect={filter.value as CategoriesResponseModel | null}
            onChangeSelected={filter.onChange}
            placeholder={filter.placeholder || "All Categories"}
            showAllOption={
              (filter as any).showAllOption !== false
            }
            label={filter.label}
            disabled={filter.disabled}
          />
        );

      case 'input-number':
        return (
          <div
            key={filter.id}
            className="flex flex-col gap-1 flex-1 min-w-[140px] max-w-[200px]"
          >
            <label className="text-xs font-medium whitespace-nowrap">
              {filter.label}
            </label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder={filter.placeholder || "0"}
              value={filter.value?.toString() || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  filter.onChange(value ? parseInt(value) : undefined);
                }
              }}
              min={(filter as any).min || "0"}
              max={(filter as any).max}
              className="h-10 text-xs w-full"
              disabled={filter.disabled}
            />
          </div>
        );

      case 'input-text':
        return (
          <div
            key={filter.id}
            className="flex flex-col gap-1 flex-1 min-w-[140px] max-w-[200px]"
          >
            <label className="text-xs font-medium whitespace-nowrap">
              {filter.label}
            </label>
            <Input
              type="text"
              placeholder={filter.placeholder || "Enter text..."}
              value={filter.value?.toString() || ""}
              onChange={(e) => filter.onChange(e.target.value)}
              className="h-10 text-xs w-full"
              disabled={filter.disabled}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <CardHeaderSection
      title={config.title}
      searchValue={config.searchValue}
      searchPlaceholder={config.searchPlaceholder}
      onSearchChange={config.onSearchChange}
      buttonText={config.buttonText}
      buttonIcon={<Plus className="w-3 h-3" />}
      buttonTooltip={config.buttonTooltip}
      customAddNewButton={
        config.buttonText ? (
          <Button
            disabled={config.buttonDisabled}
            size="sm"
            variant="default"
            onClick={config.onButtonClick}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {config.buttonText}
          </Button>
        ) : undefined
      }
    >
      {/* Responsive flex wrap layout for all filters */}
      <div
        className="flex flex-wrap gap-3 items-stretch w-full
        [&>*]:max-w-[200px] [&>*]:flex-1 [&>*]:min-w-[140px]
        [&>div]:flex [&>div]:flex-col [&>div]:gap-1
        [&_button[role=combobox]]:w-full
        [&_.w-full]:!w-full"
      >
        {config.filters.map((filter) => renderFilter(filter))}
      </div>
    </CardHeaderSection>
  );
};
