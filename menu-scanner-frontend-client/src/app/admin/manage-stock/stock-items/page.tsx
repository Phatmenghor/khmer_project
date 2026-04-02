"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { PRODUCT_STATUS_FILTER } from "@/constants/status/filter-status";
import { usePagination } from "@/redux/store/use-pagination";
import { useStockItemsState } from "@/redux/features/business/store/state/stock-items-state";
import { ProductStockItemDto } from "@/redux/features/business/store/models/response/stock-response";
import { getProductStockItemsService } from "@/redux/features/business/store/thunks/stock-management-thunks";
import {
  setPageNo,
  setPageSize,
  setSortBy,
  setSortDirection,
  setSearchFilter,
  setStatusFilter,
  setStockStatusFilter,
  setLowStockThreshold,
  setHasSizesFilter,
  resetState,
} from "@/redux/features/business/store/slice/stock-items-slice";
import { stockItemsTableColumns } from "@/redux/features/business/table/product-stock-items-table";
import { StockItemDetailModal } from "@/redux/features/business/components/stock-item-detail-modal";
import { StockManagementModal } from "@/redux/features/business/components/product-stock-management-modal";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";
import { CollapsibleFilterPanel } from "@/redux/features/business/components/collapsible-filter-panel";
import { FilterPanelConfig } from "@/redux/features/business/components/filter-types";

// Filter options for stock status
const STOCK_STATUS_FILTER = [
  { value: "ALL", label: "All Stock Status" },
  { value: "ENABLED", label: "Stock Enabled" },
  { value: "DISABLED", label: "Stock Disabled" },
];

// Filter options for product with/without sizes
const HAS_SIZES_FILTER = [
  { value: "ALL", label: "All Products" },
  { value: "WITH_SIZES", label: "Products with Sizes" },
  { value: "WITHOUT_SIZES", label: "Products without Sizes" },
];

// Sort field options for easy selection
const SORT_BY_OPTIONS = [
  { value: "totalStock", label: "Total Stock" },
  { value: "sku", label: "SKU" },
  { value: "barcode", label: "Barcode" },
  { value: "createdAt", label: "Created Date" },
];

const SORT_DIRECTION_OPTIONS = [
  { value: "ASC", label: "Low to High (ASC)" },
  { value: "DESC", label: "High to Low (DESC)" },
];

export default function StockItemsPage() {
  // Clean up state when leaving admin area (performance optimization)
  useAdminCleanup(resetState);

  // Redux state
  const {
    stockItemsState,
    stockItemsData,
    stockItemsContent,
    isLoading,
    filters,
    pagination,
    dispatch,
  } = useStockItemsState();

  // Local UI state for modals only
  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    item: null as ProductStockItemDto | null,
  });

  const [stockManagementState, setStockManagementState] = useState({
    isOpen: false,
    item: null as ProductStockItemDto | null,
  });

  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<CategoriesResponseModel | null>(null);
  const [stockStatusFilterUI, setStockStatusFilterUI] = useState("ALL");
  const [hasSizesFilterUI, setHasSizesFilterUI] = useState("ALL");

  // Global page size from global settings
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);
  const debouncedLowStockThreshold = useDebounce(filters.lowStockThreshold, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.MANAGE_STOCK.STOCK_ITEMS,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  // Fetch stock items when filters change
  useEffect(() => {
    const request = {
      pageNo: filters.pageNo,
      pageSize: globalPageSize,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      search: debouncedSearch,
      status: filters.status as "ACTIVE" | "INACTIVE" | undefined,
      stockStatus: filters.stockStatus as "ENABLED" | "DISABLED" | undefined,
      lowStockThreshold: debouncedLowStockThreshold,
      hasSizes: filters.hasSizes,
    };

    dispatch(getProductStockItemsService(request));
  }, [
    dispatch,
    filters.pageNo,
    filters.sortBy,
    filters.sortDirection,
    debouncedSearch,
    filters.status,
    filters.stockStatus,
    debouncedLowStockThreshold,
    filters.hasSizes,
    globalPageSize,
  ]);

  // Event handlers
  const handleViewItem = (item: ProductStockItemDto) => {
    setDetailModalState({
      isOpen: true,
      item,
    });
  };

  const handleEditStock = (item: ProductStockItemDto) => {
    setStockManagementState({
      isOpen: true,
      item,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleViewItem,
      handleEditStock,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      stockItemsTableColumns({
        data: stockItemsData,
        handlers: tableHandlers,
      }),
    [stockItemsState, tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setPageSize(size));
    dispatch(setGlobalPageSize(size));
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      item: null,
    });
  };

  const closeStockManagementModal = () => {
    setStockManagementState({
      isOpen: false,
      item: null,
    });
  };

  const handleProductStatusChange = (status: string) => {
    dispatch(setStatusFilter(status === "ALL" ? undefined : (status as "ACTIVE" | "INACTIVE")));
  };

  const handleBrandChange = (brand: BrandResponseModel | null) => {
    setSelectedBrand(brand);
  };

  const handleCategoriesChange = (categories: CategoriesResponseModel | null) => {
    setSelectedCategories(categories);
  };

  const handleStockStatusChange = (value: string) => {
    setStockStatusFilterUI(value);
    dispatch(setStockStatusFilter(value === "ALL" ? undefined : (value as "ENABLED" | "DISABLED")));
  };

  const handleHasSizesChange = (value: string) => {
    setHasSizesFilterUI(value);
    if (value === "ALL") {
      dispatch(setHasSizesFilter(undefined));
    } else if (value === "WITH_SIZES") {
      dispatch(setHasSizesFilter(true));
    } else {
      dispatch(setHasSizesFilter(false));
    }
  };

  const handleSortByChange = (value: string) => {
    dispatch(setSortBy(value as any));
  };

  const handleSortDirectionChange = (value: string) => {
    dispatch(setSortDirection(value as "ASC" | "DESC"));
  };

  const handleLowStockThresholdChange = (value: string) => {
    const threshold = value ? parseInt(value) : undefined;
    dispatch(setLowStockThreshold(threshold));
  };

  // Filter Configuration for CollapsibleFilterPanel
  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      title: "Stock Items (Products & Sizes)",
      searchValue: filters.search,
      searchPlaceholder: "Search product name...",
      onSearchChange: handleSearchChange,

      filters: [
        // Essential Filters (shown by default)
        {
          id: "sortBy",
          type: "select" as const,
          label: "Sort By",
          options: SORT_BY_OPTIONS,
          value: filters.sortBy,
          onChange: handleSortByChange,
        },
        {
          id: "sortDirection",
          type: "select" as const,
          label: "Order",
          options: SORT_DIRECTION_OPTIONS,
          value: filters.sortDirection,
          onChange: handleSortDirectionChange,
        },

        // Optional Filters (in collapsible section)
        {
          id: "brand",
          type: "combobox-brand" as const,
          label: "Brand",
          placeholder: "All Brand",
          value: selectedBrand,
          onChange: handleBrandChange,
          showAllOption: true,
        },
        {
          id: "category",
          type: "combobox-categories" as const,
          label: "Category",
          placeholder: "All Categories",
          value: selectedCategories,
          onChange: handleCategoriesChange,
          showAllOption: true,
        },
        {
          id: "stockStatus",
          type: "select" as const,
          label: "Stock Status",
          options: STOCK_STATUS_FILTER,
          value: stockStatusFilterUI,
          onChange: handleStockStatusChange,
        },
        {
          id: "productStatus",
          type: "select" as const,
          label: "Product Status",
          options: PRODUCT_STATUS_FILTER,
          value: filters.status || "ALL",
          onChange: handleProductStatusChange,
        },
        {
          id: "productType",
          type: "select" as const,
          label: "Product Type",
          options: HAS_SIZES_FILTER,
          value: hasSizesFilterUI,
          onChange: handleHasSizesChange,
        },
        {
          id: "lowStockThreshold",
          type: "input-number" as const,
          label: "Low Stock Threshold",
          placeholder: "0",
          value: filters.lowStockThreshold,
          onChange: handleLowStockThresholdChange,
          min: 0,
        },
      ],

      buttonText: undefined,
      buttonDisabled: true,
    }),
    [
      filters.search,
      filters.sortBy,
      filters.sortDirection,
      filters.status,
      filters.lowStockThreshold,
      selectedBrand,
      selectedCategories,
      stockStatusFilterUI,
      hasSizesFilterUI,
    ]
  );

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        {/* Collapsible Filter Panel - Clean UI with essential + optional filters */}
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["sortBy", "sortDirection"]}
        />

        {/* Data Table with Pagination */}
        <DataTableWithPagination
          data={stockItemsContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No stock items found"
          getRowKey={(item) => item.id}
          currentPage={filters.pageNo}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      {/* Modals */}
      <StockItemDetailModal
        item={detailModalState.item || undefined}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      <StockManagementModal
        isOpen={stockManagementState.isOpen}
        onClose={closeStockManagementModal}
        product={
          stockManagementState.item
            ? {
                id: stockManagementState.item.productId,
                name: stockManagementState.item.productName,
                categoryName: stockManagementState.item.categoryName,
                brandName: stockManagementState.item.brandName,
              }
            : null
        }
      />
    </div>
  );
}
