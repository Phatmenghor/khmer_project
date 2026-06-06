"use client";

import React, { useState } from "react";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { CustomDateTimePicker } from "@/components/shared/common/custom-date-picker";
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

function isFilterActive(f: FilterConfig): boolean {
  const v = f.value;
  if (v === undefined || v === null) return false;
  if (typeof v === "string" && (v === "" || v === "ALL")) return false;
  return true;
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

  const advancedActiveCount = advancedFilters.filter(isFilterActive).length;
  const anyFilterActive = config.filters.some(isFilterActive);

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
            size="md"
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
            size="md"
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
            size="md"
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
              className="h-[26px] text-xs w-full"
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
              className="h-[26px] text-xs w-full"
              disabled={filter.disabled}
            />
          </div>
        );

      case "date":
        return (
          <div key={filter.id} className="flex flex-col gap-1">
            <label className="text-xs font-medium whitespace-nowrap">
              {filter.label}
            </label>
            <CustomDateTimePicker
              value={filter.value?.toString() || ""}
              onChange={(val) => filter.onChange(val || undefined)}
              placeholder={filter.placeholder || "Select date"}
              mode="date"
              disabled={filter.disabled}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="py-3 space-y-3">
        {/* Title row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold tracking-tight">
                {config.title}
              </h1>
              {typeof config.totalCount === "number" && (
                <Badge variant="secondary" className="text-[11px] font-medium">
                  {config.totalCount.toLocaleString()}
                </Badge>
              )}
            </div>
            {config.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {config.subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {config.extraActions}
            {config.buttonText && (
              <Button
                disabled={config.buttonDisabled}
                variant="default"
                onClick={config.onButtonClick}
                className="gap-1 flex-shrink-0 h-[26px] px-3 text-xs"
                title={config.buttonTooltip}
              >
                <Plus className="w-3 h-3" />
                {config.buttonText}
              </Button>
            )}
          </div>
        </div>

        {/* Search + essential filters row — every control here is h-[26px] */}
        <div className="flex flex-wrap items-end gap-2">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={config.searchPlaceholder}
              className="pl-7 h-[26px] text-xs w-full focus:border-primary focus:ring-primary/30 hover:border-primary transition-colors"
              value={config.searchValue}
              onChange={config.onSearchChange}
            />
          </div>

          {essentialFilters.length > 0 && (
            <div
              className="grid gap-2 flex-1 sm:flex-initial sm:ml-auto min-w-0"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                maxWidth: "360px",
              }}
            >
              {essentialFilters.map((filter) => renderFilter(filter))}
            </div>
          )}
        </div>

        {/* Advanced filters — inline collapsible inside the same card */}
        {advancedFilters.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-foreground transition-colors"
              >
                Advanced Filters
                {advancedActiveCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[11px] bg-primary/10 text-primary border border-primary/30 font-medium"
                  >
                    {advancedActiveCount} active
                  </Badge>
                )}
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    showAdvanced ? "rotate-180" : ""
                  }`}
                />
              </button>
              {anyFilterActive && config.onClearAll && (
                <button
                  type="button"
                  onClick={config.onClearAll}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-dashed">
                <div
                  className="grid gap-2 w-full"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(140px, 1fr))",
                  }}
                >
                  {advancedFilters.map((filter) => renderFilter(filter))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
