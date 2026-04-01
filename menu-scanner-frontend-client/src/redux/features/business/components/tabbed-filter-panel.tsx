"use client";

import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";

export interface FilterGroup {
  id: string;
  label: string;
  filterIds: string[];
}

interface TabbedFilterPanelProps {
  config: FilterPanelConfig;
  filterGroups: FilterGroup[]; // Organize filters into tabs
}

/**
 * TabbedFilterPanel - Organize filters by categories in tabs
 *
 * Features:
 * - Group related filters together
 * - Switch between filter categories
 * - Shows active filter count per tab
 * - Clean, organized interface
 *
 * Example groups:
 * - Sort & Order
 * - Product Filters (Brand, Category, Type)
 * - Status Filters (Stock Status, Product Status)
 * - Advanced (Low Stock Threshold)
 *
 * Usage:
 * ```tsx
 * <TabbedFilterPanel
 *   config={filterConfig}
 *   filterGroups={[
 *     { id: 'sort', label: 'Sort', filterIds: ['sortBy', 'sortDirection'] },
 *     { id: 'product', label: 'Product', filterIds: ['brand', 'category', 'productType'] },
 *     { id: 'status', label: 'Status', filterIds: ['stockStatus', 'productStatus'] },
 *     { id: 'advanced', label: 'Advanced', filterIds: ['lowStockThreshold'] },
 *   ]}
 * />
 * ```
 */
export const TabbedFilterPanel: React.FC<TabbedFilterPanelProps> = ({
  config,
  filterGroups,
}) => {
  const [activeTab, setActiveTab] = useState(filterGroups[0]?.id || "");

  const activeGroup = filterGroups.find((g) => g.id === activeTab);
  const activeGroupFilters = config.filters.filter((f) =>
    activeGroup?.filterIds.includes(f.id)
  );

  const renderFilter = (filter: FilterConfig): React.ReactNode => {
    switch (filter.type) {
      case "select":
        return (
          <CustomSelect
            key={filter.id}
            options={filter.options || []}
            value={filter.value}
            placeholder={filter.placeholder || "Select..."}
            onValueChange={filter.onChange}
            label={filter.label}
            disabled={filter.disabled}
            size="lg"
          />
        );

      case "combobox-brand":
        return (
          <ComboboxSelectBrand
            key={filter.id}
            dataSelect={filter.value as BrandResponseModel | null}
            onChangeSelected={filter.onChange}
            placeholder={filter.placeholder || "All Brand"}
            showAllOption={(filter as any).showAllOption !== false}
            label={filter.label}
            disabled={filter.disabled}
            size="lg"
          />
        );

      case "combobox-categories":
        return (
          <ComboboxSelectCategories
            key={filter.id}
            dataSelect={filter.value as CategoriesResponseModel | null}
            onChangeSelected={filter.onChange}
            placeholder={filter.placeholder || "All Categories"}
            showAllOption={(filter as any).showAllOption !== false}
            label={filter.label}
            disabled={filter.disabled}
            size="lg"
          />
        );

      case "input-number":
        return (
          <div key={filter.id} className="flex flex-col gap-1">
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

      case "input-text":
        return (
          <div key={filter.id} className="flex flex-col gap-1">
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

  const getTabActiveCount = (group: FilterGroup) => {
    return config.filters
      .filter((f) => group.filterIds.includes(f.id))
      .filter((f) => {
        if (f.value === undefined || f.value === null) return false;
        if (typeof f.value === "string" && f.value === "ALL") return false;
        if (typeof f.value === "string" && f.value === "") return false;
        return true;
      }).length;
  };

  return (
    <div className="space-y-3">
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
      />

      {/* Filter Tabs */}
      <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-800 overflow-x-auto">
          {filterGroups.map((group) => {
            const activeCount = getTabActiveCount(group);
            return (
              <button
                key={group.id}
                onClick={() => setActiveTab(group.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === group.id
                    ? "border-pink-500 text-pink-400"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{group.label}</span>
                  {activeCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeCount}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content - Responsive grid layout */}
        <div className="p-4 grid gap-3 w-full"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          }}>
          {activeGroupFilters.map((filter) => renderFilter(filter))}
        </div>
      </div>
    </div>
  );
};
