"use client";

import React, { useState } from "react";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { ComboboxBusiness, BusinessOption } from "@/components/shared/combobox/combobox-business";
import { CustomDateTimePicker } from "@/components/shared/common/custom-date-picker";
import { Input } from "@/components/ui/input";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ChevronDown, Search, X } from "lucide-react";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { Badge } from "@/components/ui/badge";

// Filter Types
export type FilterType = 'select' | 'combobox-brand' | 'combobox-categories' | 'combobox-business' | 'input-number' | 'input-text' | 'date';

export interface FilterOption {
  value: string;
  label: string;
}

export interface BaseFilterConfig {
  id: string;
  type: FilterType;
  label: string;
  placeholder?: string;
  value: string | number | boolean | null | undefined;
  onChange: (value: string | number | boolean | null | undefined) => void;
  disabled?: boolean;
}

export interface SelectFilterConfig extends BaseFilterConfig {
  type: 'select';
  options: FilterOption[];
}

export interface ComboboxBrandFilterConfig extends Omit<BaseFilterConfig, 'value' | 'onChange'> {
  type: 'combobox-brand';
  value: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  showAllOption?: boolean;
}

export interface ComboboxCategoriesFilterConfig extends Omit<BaseFilterConfig, 'value' | 'onChange'> {
  type: 'combobox-categories';
  value: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  showAllOption?: boolean;
}

export interface ComboboxBusinessFilterConfig extends Omit<BaseFilterConfig, 'value' | 'onChange'> {
  type: 'combobox-business';
  value: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  showAllOption?: boolean;
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

export type FilterConfig =
  | SelectFilterConfig
  | ComboboxBrandFilterConfig
  | ComboboxCategoriesFilterConfig
  | ComboboxBusinessFilterConfig
  | InputNumberFilterConfig
  | InputTextFilterConfig
  | DateFilterConfig;

export interface FilterPanelConfig {
  title: string;
  /** Optional total-count chip rendered next to the title (e.g., 248 products). */
  totalCount?: number;
  /** Optional sentence rendered below the title. */
  subtitle?: string;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filters: FilterConfig[];
  /** Primary action button (right of the title row). */
  buttonText?: string;
  buttonDisabled?: boolean;
  buttonTooltip?: string;
  onButtonClick?: () => void;
  /** Extra action buttons rendered before the primary button. */
  extraActions?: React.ReactNode;
  /** Called when the user clicks "Clear all" — invoked only when at least one filter is active. */
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

  const essentialFilters = filtersList.filter((f) =>
    essentialFilterIds.includes(f.id),
  );

  const advancedFilters = filtersList.filter(
    (f) => !essentialFilterIds.includes(f.id),
  );

  const advancedActiveCount = advancedFilters.filter(isFilterActive).length;
  const anyFilterActive = filtersList.some(isFilterActive);

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

      case "combobox-business":
        return (
          <ComboboxBusiness
            key={filter.id}
            value={filter.value as BusinessOption | null}
            onChange={filter.onChange}
            placeholder={filter.placeholder || "All Businesses"}
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
              type="text"
              inputMode="numeric"
              placeholder={filter.placeholder || "0"}
              value={filter.value != null ? String(filter.value) : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  filter.onChange(undefined);
                } else if (/^\d+$/.test(value)) {
                  filter.onChange(parseInt(value, 10));
                }
              }}
              className="h-[36px] text-xs w-full rounded-[10px] bg-background border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
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
              className="h-[28px] text-xs w-full"
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
              <CustomButton
                disabled={config.buttonDisabled}
                variant="default"
                onClick={config.onButtonClick}
                className="gap-1.5 flex-shrink-0 h-[36px] rounded-[12px] px-3.5 text-xs font-semibold"
                title={config.buttonTooltip}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                {config.buttonText}
              </CustomButton>
            )}
          </div>
        </div>

        {/* Search + essential filters row */}
        <div className="flex flex-wrap items-end gap-2">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/80 pointer-events-none" />
            <Input
              type="text"
              placeholder={config.searchPlaceholder}
              className="pl-9 pr-8 h-[36px] text-xs rounded-[12px] bg-muted/30 border border-border/80 w-full focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/25 hover:bg-muted/50 hover:border-border transition-all shadow-2xs"
              value={config.searchValue}
              onChange={config.onSearchChange}
            />
            {config.searchValue && (
              <CustomButton variant="unstyled" size="unstyled"
                type="button"
                onClick={() =>
                  config.onSearchChange({
                    target: { value: "" },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground p-0.5 rounded-full hover:bg-destructive/15 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </CustomButton>
            )}
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
              <CustomButton variant="unstyled" size="unstyled"
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
              </CustomButton>
              {anyFilterActive && config.onClearAll && (
                <CustomButton variant="unstyled" size="unstyled"
                  type="button"
                  onClick={config.onClearAll}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Clear all
                </CustomButton>
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
