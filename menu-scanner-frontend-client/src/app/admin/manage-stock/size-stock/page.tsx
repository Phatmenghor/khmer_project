"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, ProductStatus, Status } from "@/constants/status/status";
import { usePagination } from "@/redux/store/use-pagination";
import { useStockState } from "@/redux/features/business/store/state/stock-state";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { fetchAllProductStockAdminService } from "@/redux/features/business/store/thunks/stock-thunks";
import {
  selectProductStatus,
  setPageNo,
  setSearchFilter,
  resetState,
  updateStockStatusOptimistic,
  revertStockStatusOptimistic,
} from "@/redux/features/business/store/slice/stock-slice";
import { sizeStockTableColumns } from "@/redux/features/business/table/product-size-stock-table";
import { ProductDetailModal } from "@/redux/features/business/components/product-detail-modal";
import { SizeStockManagementModal } from "@/redux/features/business/components/size-stock-management-modal";
import { updateStockStatusService } from "@/redux/features/business/store/thunks/stock-thunks";
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

export default function SizeStockPage() {
  // Clean up state when leaving admin area (performance optimization)
  useAdminCleanup(resetState);

  // Redux state
  const {
    stockState,
    stockData,
    stockContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useStockState();

  // Local UI state for modals only
  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    productId: "",
  });

  const [stockManagementState, setStockManagementState] = useState({
    isOpen: false,
    product: null as ProductDetailResponseModel | null,
  });

  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(
    null,
  );
  const [selectedCategories, setSelectedCategories] =
    useState<CategoriesResponseModel | null>(null);
  const [stockStatusFilter, setStockStatusFilter] = useState("ALL");

  // Debounce refs for stock status toggle
  const stockStatusDebounceRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  // Stock management state (to detect when stock is created)
  const stockManagementSuccessMessage = useAppSelector(
    (state: any) => state.stockManagement?.successMessage
  );

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.MANAGE_STOCK.SIZE_STOCK,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    // Build stockStatuses array (following API pattern)
    let stockStatuses: string[] | undefined;
    if (stockStatusFilter === "ENABLED" || stockStatusFilter === "DISABLED") {
      stockStatuses = [stockStatusFilter];
    }
    // if ALL, stockStatuses remains undefined (no filter)

    // Build statuses array (following API pattern)
    let statuses: string[] | undefined;
    if (filters.status !== ProductStatus.ALL && filters.status) {
      statuses = [filters.status];
    }

    dispatch(
      fetchAllProductStockAdminService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        statuses,
        brandId: selectedBrand?.id,
        categoryId: selectedCategories?.id,
        stockStatuses,
        hasSize: true, // Filter to only products with sizes
      }),
    );
  }, [
    dispatch,
    debouncedSearch,
    filters.pageNo,
    filters.status,
    globalPageSize,
    selectedBrand,
    selectedCategories,
    stockStatusFilter,
  ]);

  // Refetch products when stock is created to update totalStock
  useEffect(() => {
    if (stockManagementSuccessMessage) {
      // Refetch the products list to get updated totalStock
      let stockStatuses: string[] | undefined;
      if (stockStatusFilter === "ENABLED" || stockStatusFilter === "DISABLED") {
        stockStatuses = [stockStatusFilter];
      }

      let statuses: string[] | undefined;
      if (filters.status !== ProductStatus.ALL && filters.status) {
        statuses = [filters.status];
      }

      dispatch(
        fetchAllProductStockAdminService({
          search: debouncedSearch,
          pageNo: filters.pageNo,
          pageSize: globalPageSize,
          statuses,
          brandId: selectedBrand?.id,
          categoryId: selectedCategories?.id,
          stockStatuses,
          hasSize: true, // Filter to only products with sizes
        }),
      );
    }
  }, [stockManagementSuccessMessage]);

  // Event handlers
  const handleCreateStock = (product: ProductDetailResponseModel) => {
    setStockManagementState({
      isOpen: true,
      product,
    });
  };

  const handleProductViewDetail = (product: ProductDetailResponseModel) => {
    setDetailModalState({
      isOpen: true,
      productId: product.id || "",
    });
  };

  const handleToggleStockStatus = useCallback(
    (product: ProductDetailResponseModel) => {
      if (!product.id) return;

      // Clear any existing debounce timer for this product
      if (stockStatusDebounceRefs.current[product.id]) {
        clearTimeout(stockStatusDebounceRefs.current[product.id]);
      }

      const newStatus = product.stockStatus === "ENABLED" ? "DISABLED" : "ENABLED";
      const previousStatus = product.stockStatus as "ENABLED" | "DISABLED";

      // Optimistic update - update UI immediately for fast feedback
      dispatch(
        updateStockStatusOptimistic({
          productId: product.id,
          newStatus: newStatus as "ENABLED" | "DISABLED",
        })
      );

      // Debounce API call by 300ms to prevent rapid clicks
      stockStatusDebounceRefs.current[product.id] = setTimeout(() => {
        dispatch(
          updateStockStatusService({
            productId: product.id,
            newStatus: newStatus as "ENABLED" | "DISABLED",
          })
        )
          .unwrap()
          .then(() => {
            showToast.success(
              `Stock status updated to ${newStatus === "ENABLED" ? "Enabled" : "Disabled"}`
            );
          })
          .catch((error: any) => {
            // Revert optimistic update if API fails
            dispatch(
              revertStockStatusOptimistic({
                productId: product.id,
                previousStatus: previousStatus,
              })
            );
            showToast.error(
              error?.message ||
                "Failed to update stock status. Changes reverted."
            );
          });
      }, 300);
    },
    [dispatch]
  );

  const tableHandlers = useMemo(
    () => ({
      handleViewProduct: handleProductViewDetail,
      handleCreateStock: handleCreateStock,
      handleToggleStockStatus,
    }),
    [handleCreateStock, handleToggleStockStatus],
  );

  const columns = useMemo(
    () =>
      sizeStockTableColumns({
        data: stockData,
        handlers: tableHandlers,
      }),
    [stockState, tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
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
      product: null,
    });
  };

  const handleProductStatusChange = (status: ProductStatus) => {
    dispatch(selectProductStatus(status));
  };

  const handleBrandChange = (brand: BrandResponseModel | null) => {
    setSelectedBrand(brand);
  };

  const handleCategoriesChange = (
    categories: CategoriesResponseModel | null,
  ) => {
    setSelectedCategories(categories);
  };

  const handleStockStatusChange = (value: string) => {
    setStockStatusFilter(value);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          title="Size Stock Information"
          searchValue={filters.search}
          searchPlaceholder="Search product..."
          buttonTooltip="Select a product and click Create Stock in the table"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
        >
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
            value={stockStatusFilter}
            placeholder="All Stock Status"
            onValueChange={handleStockStatusChange}
            label="Stock Status"
          />

          <CustomSelect
            options={PRODUCT_STATUS_FILTER}
            value={filters.status}
            placeholder="All Status"
            onValueChange={(value) =>
              handleProductStatusChange(value as ProductStatus)
            }
            label="Product Status"
          />
        </CardHeaderSection>

        {/* Data Table with Your Custom Pagination */}
        <DataTableWithPagination
          data={stockContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No product with sizes found"
          getRowKey={(product) => product.id}
          currentPage={filters.pageNo}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      {/* Modals Product Detail */}
      <ProductDetailModal
        productId={detailModalState.productId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Size Stock Management Modal */}
      <SizeStockManagementModal
        isOpen={stockManagementState.isOpen}
        onClose={closeStockManagementModal}
        product={stockManagementState.product}
      />
    </div>
  );
}
