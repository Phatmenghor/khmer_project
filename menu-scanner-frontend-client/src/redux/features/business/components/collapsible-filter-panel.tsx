"use client";

import React, { useState } from "react";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { FilterConfig, FilterPanelConfig } from "./filter-types";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { Badge } from "@/components/ui/badge";

interface CollapsibleFilterPanelProps {
  config: FilterPanelConfig;
  essentialFilterIds?: string[]; // Filters to show by default
}

/**
 * CollapsibleFilterPanel - Better UI for many filters
 * Shows essential filters by default, collapses optional filters
 *
 * Features:
 * - Cleaner UI with less clutter
 * - Toggle to show/hide advanced filters
 * - Shows count of active filters
 * - Mobile-friendly
 *
 * Usage:
 * ```tsx
 * <CollapsibleFilterPanel
 *   config={filterConfig}
 *   essentialFilterIds={['sortBy', 'sortDirection', 'search']}
 * />
 * ```
 */
export const CollapsibleFilterPanel: React.FC<CollapsibleFilterPanelProps> = ({
  config,
  essentialFilterIds = [],
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const essentialFilters = config.filters.filter((f) =>
    essentialFilterIds.includes(f.id),
  );

  const advancedFilters = config.filters.filter(
    (f) => !essentialFilterIds.includes(f.id),
  );

  const activeFiltersCount = config.filters.filter((f) => {
    if (f.value === undefined || f.value === null) return false;
    if (typeof f.value === "string" && f.value === "ALL") return false;
    if (typeof f.value === "string" && f.value === "") return false;
    return true;
  }).length;

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
              className="gap-2 hidden md:flex"
            >
              <Plus className="w-4 h-4" />
              {config.buttonText}
            </Button>
          ) : undefined
        }
      >
        {/* Essential Filters - Responsive: 2 cols on mobile, auto on desktop */}
        <div className="grid gap-3 w-full"
          style={{
            gridTemplateColumns: 'repeat(2, 1fr)',
          }}>
          {essentialFilters.map((filter) => renderFilter(filter))}
        </div>
      </CardHeaderSection>

      {/* Advanced Filters Section */}
      {advancedFilters.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700/15 p-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full hover:text-pink-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} active
                </Badge>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showAdvanced ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Advanced Filters Content - Responsive grid layout */}
          {showAdvanced && (
            <div className="mt-3 pt-3 border-t border-gray-700/15">
              <div
                className="grid gap-3 w-full"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                }}>
                {advancedFilters.map((filter) => renderFilter(filter))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
