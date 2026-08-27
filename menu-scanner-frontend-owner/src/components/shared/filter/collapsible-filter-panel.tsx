"use client";

import React, { useState } from "react";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxBusiness, BusinessOption } from "@/components/shared/combobox/combobox-business";
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
    essentialFilterIds.includes(f.id)
  );
  const advancedFilters = config.filters.filter(
    (f) => !essentialFilterIds.includes(f.id)
  );

  const advancedActiveCount = advancedFilters.filter(isFilterActive).length;
  const anyFilterActive = config.filters.some(isFilterActive);

  const renderFilter = (filter: FilterConfig): React.ReactNode => {
    switch (filter.type) {
      case "select":
        return (
          <CustomSelect
            key={filter.id}
            options={(filter.options || []).map((opt) => ({
              label: opt.label,
              value: opt.value ?? "",
            }))}
            value={filter.value != null ? String(filter.value) : undefined}
            placeholder={filter.placeholder || "Select..."}
            onValueChange={filter.onChange}
            label={filter.label}
            disabled={filter.disabled}
            size="md"
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
            size="md"
          />
        );

      case "date-picker":
        return (
          <div key={filter.id} className="flex flex-col gap-1">
            <label className="text-xs font-medium whitespace-nowrap">
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
                className="gap-1.5 flex-shrink-0 h-[36px] rounded-[12px] px-3.5 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                {config.buttonText}
              </Button>
            )}
          </div>
        </div>

        {/* Search + essential filters row */}
        <div className="flex flex-wrap items-end gap-2">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/80 pointer-events-none" />
            <Input
              type="search"
              placeholder={config.searchPlaceholder}
              className="pl-9 pr-8 h-[36px] text-xs rounded-[12px] bg-muted/30 border border-border/80 w-full focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/25 hover:bg-muted/50 hover:border-border transition-all shadow-2xs"
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

        {/* Advanced filters — collapsible inside the same card */}
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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
