"use client";

import { useMemo, useState } from "react";
import { FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import {
  PRODUCT_STATUS_FILTER,
  PRODUCT_SIZE_FILTER,
  SORT_BY_OPTIONS,
  SORT_DIRECTION_OPTIONS,
} from "@/constants/status/filter-status";
import { ProductStatus } from "@/constants/status/status";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { useProductState } from "@/features/business/store/state/product-state";
import {
  selectProductStatus,
  setSearchFilter,
} from "@/features/business/store/slice/product-slice";

export interface UseProductTableFiltersOptions {
  title: string;
  subtitle: string;
  totalCount: number;
  searchPlaceholder?: string;
  buttonText?: string;
  buttonDisabled?: boolean;
  onButtonClick?: () => void;
  extraActions?: React.ReactNode;
  showPromotionDates?: boolean;
}

export function useProductTableFilters({
  title,
  subtitle,
  totalCount,
  searchPlaceholder = "Search product...",
  buttonText,
  buttonDisabled = false,
  onButtonClick,
  extraActions,
  showPromotionDates = false,
}: UseProductTableFiltersOptions) {
  const { filters, dispatch } = useProductState();

  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<CategoriesResponseModel | null>(null);
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const [promotionFromDate, setPromotionFromDate] = useState("");
  const [promotionToDate, setPromotionToDate] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleProductStatusChange = (status: ProductStatus) => {
    dispatch(selectProductStatus(status));
  };

  const handleSizeFilterChange = (value: string | number | boolean | null | undefined) => {
    setSizeFilter(String(value ?? ""));
  };

  const handleBrandChange = (brand: BrandResponseModel | null) => {
    setSelectedBrand(brand);
  };

  const handleCategoriesChange = (categories: CategoriesResponseModel | null) => {
    setSelectedCategories(categories);
  };

  const handleSortByChange = (value: string | number | boolean | null | undefined) => {
    setSortBy(String(value ?? ""));
  };

  const handleSortDirectionChange = (value: string | number | boolean | null | undefined) => {
    setSortDirection(String(value ?? ""));
  };

  const handleClearAllFilters = () => {
    dispatch(setSearchFilter(""));
    dispatch(selectProductStatus(ProductStatus.ALL));
    setSelectedBrand(null);
    setSelectedCategories(null);
    setSizeFilter("ALL");
    setSortBy("");
    setSortDirection("");
    setPromotionFromDate("");
    setPromotionToDate("");
  };

  const filterConfig = useMemo(
    (): FilterPanelConfig => ({
      title,
      subtitle,
      totalCount,
      searchValue: filters.search,
      searchPlaceholder,
      onSearchChange: handleSearchChange,
      buttonText,
      buttonDisabled,
      onButtonClick,
      extraActions,
      onClearAll: handleClearAllFilters,
      filters: [
        {
          id: "status",
          type: "select",
          label: "Product Status",
          placeholder: "All Status",
          value: filters.status,
          onChange: (value) => handleProductStatusChange(value as ProductStatus),
          options: PRODUCT_STATUS_FILTER,
        },
        {
          id: "size",
          type: "select",
          label: "Product Size",
          placeholder: "All Products",
          value: sizeFilter,
          onChange: handleSizeFilterChange,
          options: PRODUCT_SIZE_FILTER,
        },
        {
          id: "brand",
          type: "combobox-brand",
          label: "Brand",
          placeholder: "All Brand",
          value: selectedBrand,
          onChange: handleBrandChange,
          showAllOption: true,
        },
        {
          id: "category",
          type: "combobox-categories",
          label: "Category",
          placeholder: "All Categories",
          value: selectedCategories,
          onChange: handleCategoriesChange,
          showAllOption: true,
        },
        ...(showPromotionDates
          ? [
              {
                id: "promotionFromDate",
                type: "date" as const,
                label: "Promo From",
                placeholder: "Select start date",
                value: promotionFromDate,
                onChange: (value: any) => setPromotionFromDate(value ? String(value) : ""),
              },
              {
                id: "promotionToDate",
                type: "date" as const,
                label: "Promo To",
                placeholder: "Select end date",
                value: promotionToDate,
                onChange: (value: any) => setPromotionToDate(value ? String(value) : ""),
              },
            ]
          : []),
        {
          id: "sortBy",
          type: "select",
          label: "Sort By",
          placeholder: "Default (Created Date)",
          value: sortBy,
          onChange: handleSortByChange,
          options: SORT_BY_OPTIONS,
        },
        {
          id: "sortDirection",
          type: "select",
          label: "Order",
          placeholder: "Default (High to Low)",
          value: sortDirection,
          onChange: handleSortDirectionChange,
          options: SORT_DIRECTION_OPTIONS,
        },
      ],
    }),
    [
      title,
      subtitle,
      totalCount,
      searchPlaceholder,
      buttonText,
      buttonDisabled,
      onButtonClick,
      extraActions,
      filters.search,
      filters.status,
      sizeFilter,
      selectedBrand,
      selectedCategories,
      sortBy,
      sortDirection,
      promotionFromDate,
      promotionToDate,
      showPromotionDates,
    ]
  );

  return {
    filterConfig,
    sizeFilter,
    setSizeFilter,
    selectedBrand,
    setSelectedBrand,
    selectedCategories,
    setSelectedCategories,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    promotionFromDate,
    setPromotionFromDate,
    promotionToDate,
    setPromotionToDate,
    handleClearAllFilters,
  };
}
