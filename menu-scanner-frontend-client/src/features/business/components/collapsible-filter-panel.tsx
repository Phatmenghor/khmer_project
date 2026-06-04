"use client";

import React, { useState } from "react";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ChevronDown, Search } from "lucide-react";
import { FilterConfig, FilterPanelConfig } from "./filter-types";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { Badge } from "@/components/ui/badge";

interface CollapsibleFilterPanelProps {
  config: FilterPanelConfig;
  essentialFilterIds?: string[];
}


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
            value={filter.value != null ? String(filter.value) : undefined}
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
              className="h-7 text-xs w-full"
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
              className="h-7 text-xs w-full"
              disabled={filter.disabled}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Card>
        <CardContent className="py-2 sm:py-3 space-y-2">
          {}
          <div className="flex items-center gap-1 mb-0">
            <h1 className="text-xs sm:text-xs font-bold">{config.title}</h1>
          </div>

          {}
          <div className="flex flex-wrap items-end gap-2">
            {}
            <div className="w-[300px] h-7">
              <div className="relative w-full h-full group">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                <Input
                  type="search"
                  placeholder={config.searchPlaceholder}
                  className="pl-7 w-full h-full placeholder:text-gray-500 focus:border-primary focus:ring-primary/30 hover:border-primary transition-all duration-200"
                  value={config.searchValue}
                  onChange={config.onSearchChange}
                />
              </div>
            </div>

            {}
            <div className="flex flex-wrap items-end gap-2 ml-auto overflow-x-auto max-w-[calc(100vw-330px)] pb-1">
              {}
              {essentialFilters.length > 0 && (
                <div className="grid gap-2 flex-shrink-0"
                  style={{
                    gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
                    maxWidth: '300px',
                  }}>
                  {essentialFilters.map((filter) => renderFilter(filter))}
                </div>
              )}

              {}
              {config.buttonText && (
                <Button
                  disabled={config.buttonDisabled}
                  variant="default"
                  onClick={config.onButtonClick}
                  className="gap-1 flex-shrink-0 h-7 px-3"
                >
                  <Plus className="w-3 h-3" />
                  {config.buttonText}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      {advancedFilters.length > 0 && (
        <div className="bg-primary/5 rounded border border-primary/20 p-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full hover:text-primary hover:bg-primary/10 px-1 py-1 rounded transition-all duration-200"
          >
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-primary">Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border border-primary">
                  {activeFiltersCount} active
                </Badge>
              )}
            </div>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                showAdvanced ? "rotate-180" : ""
              }`}
            />
          </button>

          {}
          {showAdvanced && (
            <div className="mt-2 pt-2 border-t border-primary/20">
              <div
                className="grid gap-2 w-full"
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
