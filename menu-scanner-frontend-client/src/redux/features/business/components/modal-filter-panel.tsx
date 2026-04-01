"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, X, SlidersHorizontal } from "lucide-react";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { FilterConfig, FilterPanelConfig } from "./filter-types";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { Badge } from "@/components/ui/badge";

/**
 * ModalFilterPanel - Show filters in a modal/drawer
 *
 * Features:
 * - Clean header with search and button
 * - All filters in collapsible modal
 * - Shows active filter count
 * - Responsive design
 * - Good for mobile
 *
 * Usage:
 * ```tsx
 * <ModalFilterPanel config={filterConfig} />
 * ```
 */
export const ModalFilterPanel: React.FC<{ config: FilterPanelConfig }> = ({
  config,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
          <div key={filter.id} className="mb-4">
            <CustomSelect
              options={filter.options || []}
              value={filter.value}
              placeholder={filter.placeholder || "Select..."}
              onValueChange={filter.onChange}
              label={filter.label}
              disabled={filter.disabled}
              size="lg"
            />
          </div>
        );

      case "combobox-brand":
        return (
          <div key={filter.id} className="mb-4">
            <ComboboxSelectBrand
              dataSelect={filter.value as BrandResponseModel | null}
              onChangeSelected={filter.onChange}
              placeholder={filter.placeholder || "All Brand"}
              showAllOption={(filter as any).showAllOption !== false}
              label={filter.label}
              disabled={filter.disabled}
              size="lg"
            />
          </div>
        );

      case "combobox-categories":
        return (
          <div key={filter.id} className="mb-4">
            <ComboboxSelectCategories
              dataSelect={filter.value as CategoriesResponseModel | null}
              onChangeSelected={filter.onChange}
              placeholder={filter.placeholder || "All Categories"}
              showAllOption={(filter as any).showAllOption !== false}
              label={filter.label}
              disabled={filter.disabled}
              size="lg"
            />
          </div>
        );

      case "input-number":
        return (
          <div key={filter.id} className="mb-4 flex flex-col gap-2">
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
              className="h-10 text-xs"
              disabled={filter.disabled}
            />
          </div>
        );

      case "input-text":
        return (
          <div key={filter.id} className="mb-4 flex flex-col gap-2">
            <label className="text-xs font-medium whitespace-nowrap">
              {filter.label}
            </label>
            <Input
              type="text"
              placeholder={filter.placeholder || "Enter text..."}
              value={filter.value?.toString() || ""}
              onChange={(e) => filter.onChange(e.target.value)}
              className="h-10 text-xs"
              disabled={filter.disabled}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Header */}
      <Card>
        <CardContent className="py-3 sm:py-5">
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-base sm:text-lg font-bold">{config.title}</h1>
          </div>

          {/* Search Bar + Filters Button */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                type="search"
                placeholder={config.searchPlaceholder}
                className="pl-10 w-full placeholder:text-gray-500 focus:border-pink-500 focus:ring-pink-500/20 hover:border-gray-600 transition-all duration-200"
                value={config.searchValue}
                onChange={config.onSearchChange}
              />
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-700 bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </button>

            {/* Add Button - Hidden on mobile, visible on medium screens and up */}
            {config.buttonText && (
              <Button
                disabled={config.buttonDisabled}
                size="sm"
                variant="default"
                onClick={config.onButtonClick}
                className="gap-2 flex-shrink-0 hidden md:flex"
              >
                <Plus className="w-4 h-4" />
                {config.buttonText}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter Modal/Panel */}
      {isOpen && (
        <div className="mt-3 bg-gray-900/50 rounded-lg border border-gray-800 p-6 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Advanced Filters
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filters - Grid layout for consistent spacing */}
          <div className="grid gap-4 w-full">
            {config.filters.map((filter) => renderFilter(filter))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-800 flex gap-2">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
