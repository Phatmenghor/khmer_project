"use client";

import React, { useState } from "react";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { CustomDateTimePicker } from "@/components/shared/common/custom-date-picker";
import { Input } from "@/components/ui/input";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ChevronDown, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type FilterType = 'select' | 'input-number' | 'input-text' | 'date' | 'custom' | string;

export interface FilterOption {
  value: string;
  label: string;
}

export interface BaseFilterConfig {
  id: string;
  type: FilterType;
  label: string;
  placeholder?: string;
  value: any;
  onChange: (value: any) => void;
  render?: () => React.ReactNode;
  disabled?: boolean;
}

export interface SelectFilterConfig extends BaseFilterConfig {
  type: 'select';
  options: FilterOption[];
}

export interface InputNumberFilterConfig extends BaseFilterConfig {
  type: 'input-number';
  min?: number;
  max?: number;
}

export interface InputTextFilterConfig extends BaseFilterConfig {
  type: 'input-text';
}

export interface DateFilterConfig extends BaseFilterConfig {
  type: 'date';
}

export interface CustomFilterConfig extends BaseFilterConfig {
  type: string;
}

export type FilterConfig =
  | SelectFilterConfig
  | InputNumberFilterConfig
  | InputTextFilterConfig
  | DateFilterConfig
  | CustomFilterConfig;

export interface FilterPanelConfig {
  title: string;
  totalCount?: number;
  subtitle?: string;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filters: FilterConfig[];
  buttonText?: string;
  buttonDisabled?: boolean;
  buttonTooltip?: string;
  onButtonClick?: () => void;
  extraActions?: React.ReactNode;
  onClearAll?: () => void;
}

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

  const filtersList = config.filters || [];

  // Smart Filter Splitting:
  // - If total filters <= 2: All filters stay in the main bar next to search (no advanced drawer needed).
  // - If total filters > 2: First 2 (or essentialFilterIds) stay in the main bar; the rest go to Advanced Filters.
  let essentialFilters: FilterConfig[];
  let advancedFilters: FilterConfig[];

  if (filtersList.length <= 2) {
    essentialFilters = filtersList;
    advancedFilters = [];
  } else if (essentialFilterIds.length > 0) {
    essentialFilters = filtersList.filter((f) => essentialFilterIds.includes(f.id));
    advancedFilters = filtersList.filter((f) => !essentialFilterIds.includes(f.id));
  } else {
    essentialFilters = filtersList.slice(0, 2);
    advancedFilters = filtersList.slice(2);
  }

  const advancedActiveCount = advancedFilters.filter(isFilterActive).length;
  const anyFilterActive = filtersList.some(isFilterActive);

  const renderFilter = (filter: FilterConfig): React.ReactNode => {
    if (filter.render) {
      return (
        <div key={filter.id} className="w-full sm:w-[150px] md:w-[165px] shrink-0">
          {filter.render()}
        </div>
      );
    }
    switch (filter.type) {
      case "select":
        return (
          <div key={filter.id} className="w-full sm:w-[150px] md:w-[165px] shrink-0">
            <CustomSelect
              options={(filter as SelectFilterConfig).options || []}
              value={filter.value != null ? String(filter.value) : undefined}
              placeholder={filter.placeholder || "Select..."}
              onValueChange={filter.onChange}
              label={filter.label}
              disabled={filter.disabled}
              size="md"
            />
          </div>
        );

      case "input-number":
        return (
          <div key={filter.id} className="flex flex-col gap-1">
            <label className="text-xs font-semibold whitespace-nowrap text-foreground">
              {filter.label}
            </label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={filter.placeholder || "0"}
              value={filter.value != null ? String(filter.value) : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  filter.onChange(undefined);
                } else {
                  const num = Number(value);
                  if (!isNaN(num)) filter.onChange(num);
                }
              }}
              className="h-[36px] text-xs rounded-[12px]"
              disabled={filter.disabled}
            />
          </div>
        );

      case "input-text":
        return (
          <div key={filter.id} className="flex flex-col gap-1">
            <label className="text-xs font-semibold whitespace-nowrap text-foreground">
              {filter.label}
            </label>
            <Input
              type="text"
              placeholder={filter.placeholder || "Enter text..."}
              value={filter.value != null ? String(filter.value) : ""}
              onChange={(e) => filter.onChange(e.target.value)}
              className="h-[36px] text-xs rounded-[12px]"
              disabled={filter.disabled}
            />
          </div>
        );

      case "date":
        return (
          <div key={filter.id} className="w-full sm:w-[150px] md:w-[165px] shrink-0">
            <CustomDateTimePicker
              mode="date"
              label={filter.label}
              placeholder={filter.placeholder || "Select date..."}
              value={filter.value != null ? String(filter.value) : ""}
              onChange={(dateStr) => filter.onChange(dateStr || "")}
              disabled={filter.disabled}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="rounded-[16px] border border-border/80 shadow-2xs hover:shadow-xs transition-all duration-200">
      <CardContent className="p-3.5 sm:p-4 space-y-3">
        {/* Title bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-foreground">
                {config.title}
              </h1>
              {typeof config.totalCount === "number" && (
                <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                  {config.totalCount.toLocaleString()}
                </Badge>
              )}
            </div>
            {config.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {config.subtitle}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {config.extraActions}
            {config.buttonText && (
              <CustomButton
                disabled={config.buttonDisabled}
                variant="default"
                onClick={config.onButtonClick}
                className="gap-1.5 flex-shrink-0 h-[36px] rounded-[12px] px-3.5 text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                title={config.buttonTooltip}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                {config.buttonText}
              </CustomButton>
            )}
          </div>
        </div>

        {/* Search & Filters row */}
        <div className="flex flex-wrap items-end gap-2 pt-0.5">
          {/* Search Input */}
          <div className="w-full sm:w-[260px] md:w-[320px] flex-shrink-0">
            <div className="relative w-full group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" />
              <Input
                type="text"
                placeholder={config.searchPlaceholder}
                className="pl-8 pr-8 h-[36px] text-xs rounded-[12px] placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-border transition-all duration-200 shadow-2xs"
                value={config.searchValue}
                onChange={config.onSearchChange}
              />
              {config.searchValue && (
                <CustomButton
                  variant="unstyled"
                  size="unstyled"
                  type="button"
                  onClick={() =>
                    config.onSearchChange({
                      target: { value: "" },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground p-0.5 rounded-full hover:bg-destructive/15 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </CustomButton>
              )}
            </div>
          </div>

          {/* Essential Filters */}
          {essentialFilters.length > 0 && (
            <div className="flex flex-wrap items-end gap-2 ml-auto">
              {essentialFilters.map((filter) => renderFilter(filter))}
            </div>
          )}
        </div>

        {/* Advanced filters (only rendered if total filters > 2) */}
        {advancedFilters.length > 0 && (
          <div className="pt-2 border-t border-border/40">
            <div className="flex items-center justify-between gap-2">
              <CustomButton
                variant="unstyled"
                size="unstyled"
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
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
              </CustomButton>
              {anyFilterActive && config.onClearAll && (
                <CustomButton
                  variant="unstyled"
                  size="unstyled"
                  type="button"
                  onClick={config.onClearAll}
                  className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  Clear all
                </CustomButton>
              )}
            </div>

            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-dashed border-border/70">
                <div className="flex flex-wrap items-end gap-2.5 sm:gap-3 w-full">
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
