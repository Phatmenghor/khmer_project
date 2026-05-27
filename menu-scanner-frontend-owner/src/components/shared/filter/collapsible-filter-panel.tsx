"use client";

import React, { useState } from "react";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxBusiness, BusinessOption } from "@/components/shared/combo-box/combobox-business";
import { CustomDateTimePicker } from "@/components/shared/common/custom-date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, Search } from "lucide-react";
import { FilterConfig, FilterPanelConfig } from "./filter-types";

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
    essentialFilterIds.includes(f.id)
  );
  const advancedFilters = config.filters.filter(
    (f) => !essentialFilterIds.includes(f.id)
  );

  const activeFiltersCount = config.filters.filter((f) => {
    if (f.value === undefined || f.value === null) return false;
    if (typeof f.value === "string" && (f.value === "ALL" || f.value === ""))
      return false;
    return true;
  }).length;

  const renderFilter = (filter: FilterConfig): React.ReactNode => {
    switch (filter.type) {
      case "select":
        return (
          <CustomSelect
            key={filter.id}
            options={filter.options}
            value={filter.value != null ? String(filter.value) : undefined}
            placeholder={filter.placeholder || "Select..."}
            onValueChange={filter.onChange}
            label={filter.label}
            disabled={filter.disabled}
            size="lg"
          />
        );

      case "combobox-business":
        return (
          <ComboboxBusiness
            key={filter.id}
            value={filter.value as BusinessOption | null}
            onChange={filter.onChange}
            placeholder={filter.placeholder || "All businesses..."}
            showAllOption={(filter as any).showAllOption !== false}
            label={filter.label}
            disabled={filter.disabled}
            size="lg"
          />
        );

      case "date-picker":
        return (
          <div key={filter.id} className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
              {filter.label}
            </label>
            <CustomDateTimePicker
              value={filter.value}
              onChange={filter.onChange}
              placeholder={filter.placeholder || "Select date..."}
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
    <div className="space-y-3">
      <Card>
        <CardContent className="py-3 sm:py-5 space-y-3">
          <div className="flex items-center gap-2 mb-0">
            <h1 className="text-base sm:text-lg font-bold">{config.title}</h1>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="w-[300px] h-10">
              <div className="relative w-full h-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  type="search"
                  placeholder={config.searchPlaceholder}
                  className="pl-10 w-full h-full placeholder:text-gray-500 focus:border-primary focus:ring-primary/30 hover:border-primary transition-all duration-200"
                  value={config.searchValue}
                  onChange={config.onSearchChange}
                />
              </div>
            </div>

            {/* Essential filters + button — right-aligned */}
            <div className="flex flex-wrap items-end gap-3 ml-auto overflow-x-auto max-w-[calc(100vw-330px)] pb-2">
              {essentialFilters.length > 0 && (
                <div
                  className="grid gap-3 flex-shrink-0"
                  style={{
                    gridTemplateColumns: `repeat(${essentialFilters.length}, minmax(120px, 1fr))`,
                    maxWidth: `${essentialFilters.length * 160}px`,
                  }}
                >
                  {essentialFilters.map((filter) => renderFilter(filter))}
                </div>
              )}

              {config.buttonText && (
                <Button
                  disabled={config.buttonDisabled}
                  variant="default"
                  onClick={config.onButtonClick}
                  className="gap-2 flex-shrink-0 h-10 px-4"
                >
                  <Plus className="w-4 h-4" />
                  {config.buttonText}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced filters */}
      {advancedFilters.length > 0 && (
        <div className="bg-primary/5 rounded-lg border border-primary/20 p-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full hover:text-primary hover:bg-primary/10 px-2 py-1 rounded transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">
                Advanced Filters
              </span>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary border border-primary"
                >
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

          {showAdvanced && (
            <div className="mt-3 pt-3 border-t border-primary/20">
              <div
                className="grid gap-3 w-full"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                }}
              >
                {advancedFilters.map((filter) => renderFilter(filter))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
