"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, ProductStatus } from "@/constants/status/status";
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
import { ProductDetailModal } from "@/redux/features/business/components/product-detail-modal";
import { StockManagementModal } from "@/redux/features/business/components/product-stock-management-modal";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { PRODUCT_STATUS_FILTER } from "@/constants/status/filter-status";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";

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
  { value: "totalStock", label: "Total Stock (Default)" },
  { value: "productName", label: "Product Name" },
  { value: "categoryName", label: "Category" },
  { value: "brandName", label: "Brand" },
  { value: "sku", label: "SKU" },
  { value: "barcode", label: "Barcode" },
  { value: "sizeName", label: "Size" },
  { value: "status", label: "Product Status" },
  { value: "stockStatus", label: "Stock Status" },
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
];

const SORT_DIRECTION_OPTIONS = [
  { value: "DESC", label: "High to Low (DESC)" },
  { value: "ASC", label: "Low to High (ASC)" },
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

  // Global page size from global settings
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.MANAGE_STOCK.PRODUCTS_STOCK,
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
      lowStockThreshold: filters.lowStockThreshold,
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
    filters.lowStockThreshold,
    filters.hasSizes,
    globalPageSize,
  ]);

  // Event handlers
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
      productId: "",
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

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          title="Stock Items (Products & Sizes)"
          searchValue={filters.search}
          searchPlaceholder="Search product name..."
          buttonTooltip="Select an item and click Edit Stock to manage inventory"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          hideButton={true}
        >
          {/* Sorting Options */}
          <CustomSelect
            options={SORT_BY_OPTIONS}
            value={filters.sortBy}
            placeholder="Sort by"
            onValueChange={handleSortByChange}
            label="Sort Field"
          />

          <CustomSelect
            options={SORT_DIRECTION_OPTIONS}
            value={filters.sortDirection}
            placeholder="Sort direction"
            onValueChange={handleSortDirectionChange}
            label="Sort Direction"
          />

          {/* Filtering Options */}
          <ComboboxSelectBrand
            dataSelect={selectedBrand}
            onChangeSelected={handleBrandChange}
            placeholder="All Brand"
            showAllOption={true}
          />

          <ComboboxSelectCategories
            dataSelect={selectedCategories}
            onChangeSelected={handleCategoriesChange}
            placeholder="All Categories"
            showAllOption={true}
          />

          <CustomSelect
            options={STOCK_STATUS_FILTER}
            value={stockStatusFilterUI}
            placeholder="All Stock Status"
            onValueChange={handleStockStatusChange}
            label="Stock Status"
          />

          <CustomSelect
            options={PRODUCT_STATUS_FILTER}
            value={filters.status || "ALL"}
            placeholder="All Status"
            onValueChange={handleProductStatusChange}
            label="Product Status"
          />

          <CustomSelect
            options={HAS_SIZES_FILTER}
            value={hasSizesFilterUI}
            placeholder="All Products"
            onValueChange={handleHasSizesChange}
            label="Product Type"
          />

          {/* Low Stock Threshold Filter */}
          <input
            type="number"
            placeholder="Low stock threshold"
            value={filters.lowStockThreshold || ""}
            onChange={(e) => handleLowStockThresholdChange(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-xs"
          />
        </CardHeaderSection>

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
      <ProductDetailModal
        productId={detailModalState.productId}
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
