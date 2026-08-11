"use client";

import React from "react";
import { Search, X, ChevronsUpDown, Check, DollarSign } from "lucide-react";
import { CustomInput } from "@/components/shared/form-field/custom-input";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import {
  setSearchTerm,
  setSelectedCategory,
  setSelectedBrand,
  setPromotionFilter,
  setBrandOpen,
  setCategoryOpen,
  setPromotionOpen,
  setMinPrice,
  setMaxPrice,
} from "@/features/business/store/slice/pos-page-slice";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import {
  POS_PROMOTION_FILTER_OPTIONS,
  getPOSPromotionFilterValue,
  getPromotionFilterFromKey,
} from "@/constants/status/status";

interface POSHeaderFiltersProps {
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchTerm: string;
  selectedBrand: BrandResponseModel | null;
  selectedCategory: CategoriesResponseModel | null;
  promotionOpen: boolean;
  promotionFilter?: boolean;
  minPrice?: string;
  maxPrice?: string;
}

export function POSHeaderFilters({
  searchInputRef,
  searchTerm,
  selectedBrand,
  selectedCategory,
  promotionOpen,
  promotionFilter,
  minPrice = "",
  maxPrice = "",
}: POSHeaderFiltersProps) {
  const dispatch = useAppDispatch();

  const isFilterActive = Boolean(
    searchTerm || selectedCategory || selectedBrand || promotionFilter !== undefined || minPrice || maxPrice
  );

  return (
    <div className="flex flex-col gap-2 p-2.5 sm:px-4 sm:py-2.5 border-b border-border/80 bg-card/95 backdrop-blur-md shrink-0 shadow-2xs">
      {/* Dynamic Row 1: Search, Category Combobox, Brand Combobox */}
      <div className="flex flex-wrap items-center gap-2.5 w-full">
        {/* Search CustomInput - Explicit h-[36px] */}
        <div className="flex-1 min-w-[180px] sm:min-w-[240px]">
          <CustomInput
            ref={searchInputRef}
            type="search"
            placeholder="Search products by name, SKU..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={searchTerm ? <X className="h-3.5 w-3.5" /> : undefined}
            onRightIconClick={() => dispatch(setSearchTerm(""))}
            size="md"
            className="h-[36px] rounded-[12px]"
          />
        </div>

        {/* Category Combobox - Explicit h-[36px] */}
        <div className="w-[130px] sm:w-[170px] h-[36px]">
          <ComboboxSelectCategories
            dataSelect={selectedCategory}
            onChangeSelected={(item) => dispatch(setSelectedCategory(item))}
            placeholder="All Categories"
            label=""
            size="md"
            showAllOption={true}
          />
        </div>

        {/* Brand Combobox - Explicit h-[36px] */}
        <div className="w-[120px] sm:w-[160px] h-[36px]">
          <ComboboxSelectBrand
            dataSelect={selectedBrand}
            onChangeSelected={(item) => dispatch(setSelectedBrand(item))}
            placeholder="All Brands"
            label=""
            size="md"
            showAllOption={true}
          />
        </div>
      </div>

      {/* Dynamic Row 2: Promotion Filter, Price Range Inputs & Clear Button */}
      <div className="flex flex-wrap items-center gap-2.5 w-full">
        {/* Promotion Filter CustomSelect - Explicit h-[36px] */}
        <div className="w-[120px] sm:w-[155px] h-[36px]">
          <CustomSelect
            size="md"
            placeholder="All Items"
            options={POS_PROMOTION_FILTER_OPTIONS}
            value={getPOSPromotionFilterValue(promotionFilter)}
            onValueChange={(val) => dispatch(setPromotionFilter(getPromotionFilterFromKey(val)))}
          />
        </div>

        {/* Price Range CustomInput Group - Explicit h-[36px] */}
        <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 rounded-[12px] border border-border/70 h-[36px]">
          <span className="text-xs text-muted-foreground font-extrabold flex items-center gap-0.5 whitespace-nowrap">
            <DollarSign className="w-3.5 h-3.5 text-primary shrink-0" />
            Price
          </span>
          <CustomInput
            type="text"
            inputMode="decimal"
            placeholder="Min $"
            value={minPrice}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                dispatch(setMinPrice(val));
              }
            }}
            size="sm"
            className="h-[26px] w-[70px] sm:w-[80px] text-[11px] sm:text-xs px-2 bg-background border-border/60 rounded-[8px] font-semibold"
          />
          <span className="text-muted-foreground text-xs font-extrabold">-</span>
          <CustomInput
            type="text"
            inputMode="decimal"
            placeholder="Max $"
            value={maxPrice}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                dispatch(setMaxPrice(val));
              }
            }}
            size="sm"
            className="h-[26px] w-[70px] sm:w-[80px] text-[11px] sm:text-xs px-2 bg-background border-border/60 rounded-[8px] font-semibold"
          />
        </div>

        {/* Clear All Filters */}
        {isFilterActive && (
          <CustomButton
            variant="ghost"
            size="sm"
            className="h-[36px] px-3 text-[11px] sm:text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-[8px] gap-1.5 ml-auto sm:ml-0"
            onClick={() => {
              dispatch(setSearchTerm(""));
              dispatch(setSelectedCategory(null));
              dispatch(setSelectedBrand(null));
              dispatch(setPromotionFilter(undefined));
              dispatch(setMinPrice(""));
              dispatch(setMaxPrice(""));
            }}
            title="Clear all filters"
          >
            <X className="w-4 h-4" />
            Clear
          </CustomButton>
        )}
      </div>
    </div>
  );
}
