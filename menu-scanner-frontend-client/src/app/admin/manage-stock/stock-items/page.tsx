"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { PRODUCT_STATUS_FILTER } from "@/constants/status/filter-status";
import { usePagination } from "@/hooks/use-pagination";
import { useStockItemsState } from "@/features/business/store/state/stock-items-state";
import { ProductStockItemDto } from "@/features/business/store/models/response/stock-response";
import { getProductStockItemsService } from "@/features/business/store/thunks/stock-management-thunks";
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
} from "@/features/business/store/slice/stock-items-slice";
import { stockItemsTableColumns } from "@/features/business/table/product-stock-items-table";
import { ProductDetailModal } from "@/features/business/components/product-detail-modal";
import { StockItemManagementModal } from "@/features/business/components/stock-item-management-modal";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
import { CollapsibleFilterPanel } from "@/features/business/components/collapsible-filter-panel";
import { FilterPanelConfig } from "@/features/business/components/filter-types";
import { selectLowStockThreshold } from "@/features/business/store/selectors/business-settings-selector";


const STOCK_STATUS_FILTER = [
  { value: "ALL", label: "All Stock Status" },
  { value: "ENABLED", label: "Stock Enabled" },
  { value: "DISABLED", label: "Stock Disabled" },
];


const HAS_SIZES_FILTER = [
  { value: "ALL", label: "All Products" },
  { value: "WITH_SIZES", label: "Products with Sizes" },
  { value: "WITHOUT_SIZES", label: "Products without Sizes" },
];


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

  useAdminCleanup(resetState);


  const {
    stockItemsState,
    stockItemsData,
    stockItemsContent,
    isLoading,
    filters,
    pagination,
    dispatch,
  } = useStockItemsState();


  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    productId: "",
  });

  const [stockManagementState, setStockManagementState] = useState({
    isOpen: false,
    item: null as ProductStockItemDto | null,
  });

  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<CategoriesResponseModel | null>(null);
  const [stockStatusFilterUI, setStockStatusFilterUI] = useState("ALL");
  const [hasSizesFilterUI, setHasSizesFilterUI] = useState("ALL");


  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const businessLowStockThreshold = useAppSelector(selectLowStockThreshold);

  const debouncedSearch = useDebounce(filters.search, 400);
  const debouncedLowStockThreshold = useDebounce(filters.lowStockThreshold, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.MANAGE_STOCK.STOCK_ITEMS,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });


  useEffect(() => {
    const request = {
      pageNo: filters.pageNo,
      pageSize: globalPageSize,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      search: debouncedSearch,
      status: filters.status as "ACTIVE" | "INACTIVE" | undefined,
      stockStatus: filters.stockStatus as "ENABLED" | "DISABLED" | undefined,
      lowStockThreshold: debouncedLowStockThreshold ?? businessLowStockThreshold,
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
    businessLowStockThreshold,
  ]);


  const handleViewItem = (item: ProductStockItemDto) => {
    setDetailModalState({
      isOpen: true,
      productId: item.productId,
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
    [handleViewItem, handleEditStock],
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
      productId: "",
    });
  };

  const closeStockManagementModal = () => {
    setStockManagementState({
      isOpen: false,
      item: null,
    });
  };

  const handleProductStatusChange = (status: string | number | boolean | null | undefined) => {
    dispatch(setStatusFilter(status === "ALL" ? undefined : (status as "ACTIVE" | "INACTIVE")));
  };

  const handleBrandChange = (brand: BrandResponseModel | null) => {
    setSelectedBrand(brand);
  };

  const handleCategoriesChange = (categories: CategoriesResponseModel | null) => {
    setSelectedCategories(categories);
  };

  const handleStockStatusChange = (value: string | number | boolean | null | undefined) => {
    setStockStatusFilterUI(String(value ?? ""));
    dispatch(setStockStatusFilter(value === "ALL" ? undefined : (value as "ENABLED" | "DISABLED")));
  };

  const handleHasSizesChange = (value: string | number | boolean | null | undefined) => {
    setHasSizesFilterUI(String(value ?? ""));
    if (value === "ALL") {
      dispatch(setHasSizesFilter(undefined));
    } else if (value === "WITH_SIZES") {
      dispatch(setHasSizesFilter(true));
    } else {
      dispatch(setHasSizesFilter(false));
    }
  };

  const handleSortByChange = (value: string | number | boolean | null | undefined) => {
    dispatch(setSortBy(value as any));
  };

  const handleSortDirectionChange = (value: string | number | boolean | null | undefined) => {
    dispatch(setSortDirection(value as "ASC" | "DESC"));
  };

  const handleLowStockThresholdChange = (value: string | number | boolean | null | undefined) => {
    const threshold = value ? parseInt(String(value)) : undefined;
    dispatch(setLowStockThreshold(threshold));
  };


  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      title: "Stock Items (Products & Sizes)",
      searchValue: filters.search,
      searchPlaceholder: "Search product name...",
      onSearchChange: handleSearchChange,

      filters: [

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
          label: `Low Stock Threshold (default: ${businessLowStockThreshold})`,
          placeholder: String(businessLowStockThreshold),
          value: filters.lowStockThreshold ?? businessLowStockThreshold,
          onChange: handleLowStockThresholdChange,
          min: 1,
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
      businessLowStockThreshold,
    ]
  );

  return (
    <div className="flex flex-1 flex-col gap-3 px-1.5">
      <div className="space-y-3">
        {}
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["sortBy", "sortDirection"]}
        />

        {}
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

      {}
      <ProductDetailModal
        productId={detailModalState.productId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {}
      <StockItemManagementModal
        isOpen={stockManagementState.isOpen}
        onClose={closeStockManagementModal}
        stockItem={stockManagementState.item || undefined}
      />
    </div>
  );
}
