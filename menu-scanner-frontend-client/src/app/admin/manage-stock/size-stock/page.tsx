"use client";

import { useEffect, useMemo, useState, useRef, useCallback, Suspense} from "react";

import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CollapsibleFilterPanel } from "@/features/business/components/collapsible-filter-panel";
import { FilterPanelConfig } from "@/features/business/components/filter-types";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, ProductStatus, Status } from "@/constants/status/status";
import { usePagination } from "@/hooks/use-pagination";
import { useStockState } from "@/features/business/store/state/stock-state";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import { fetchAllProductStockAdminService } from "@/features/business/store/thunks/stock-thunks";
import {
  selectProductStatus,
  setPageNo,
  setSearchFilter,
  resetState,
  updateStockStatusOptimistic,
  revertStockStatusOptimistic,
} from "@/features/business/store/slice/stock-slice";
import { sizeStockTableColumns } from "@/features/business/table/product-size-stock-table";
import { ProductDetailModal } from "@/features/business/components/product-detail-modal";
import { SizeStockManagementModal } from "@/features/business/components/size-stock-management-modal";
import { updateStockStatusService } from "@/features/business/store/thunks/stock-thunks";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { PRODUCT_STATUS_FILTER } from "@/constants/status/filter-status";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";

const STOCK_STATUS_FILTER = [
  { value: "ALL", label: "All Stock Status" },
  { value: "ENABLED", label: "Stock Enabled" },
  { value: "DISABLED", label: "Stock Disabled" },
];

function SizeStockPageInner() {

  useAdminCleanup(resetState);

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

  const stockStatusDebounceRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const stockManagementSuccessMessage = useAppSelector(
    (state) => (state.stockManagement as { successMessage: string | null }).successMessage ?? undefined
  );

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.MANAGE_STOCK.SIZE_STOCK,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {

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
        hasSize: true,
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

  useEffect(() => {
    if (stockManagementSuccessMessage) {

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
          hasSize: true,
        }),
      );
    }
  }, [stockManagementSuccessMessage]);

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

      if (stockStatusDebounceRefs.current[product.id]) {
        clearTimeout(stockStatusDebounceRefs.current[product.id]);
      }

      const newStatus = product.stockStatus === "ENABLED" ? "DISABLED" : "ENABLED";
      const previousStatus = product.stockStatus as "ENABLED" | "DISABLED";

      dispatch(
        updateStockStatusOptimistic({
          productId: product.id,
          newStatus: newStatus as "ENABLED" | "DISABLED",
        })
      );

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
          .catch((error: unknown) => {

            dispatch(
              revertStockStatusOptimistic({
                productId: product.id,
                previousStatus: previousStatus,
              })
            );
            showToast.error(
              (error as { message?: string })?.message ||
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

  const handleStockStatusChange = (value: string | number | boolean | null | undefined) => {
    setStockStatusFilter(String(value ?? ""));
  };

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Size Stock Information",
    searchValue: filters.search,
    searchPlaceholder: "Search product...",
    onSearchChange: handleSearchChange,
    buttonText: undefined,
    buttonDisabled: false,
    onButtonClick: () => {},
    filters: [
      {
        id: "productStatus",
        type: "select" as const,
        label: "Product Status",
        placeholder: "All Status",
        value: filters.status,
        onChange: (value: string | number | boolean | null | undefined) => handleProductStatusChange(value as ProductStatus),
        options: PRODUCT_STATUS_FILTER,
      },
      {
        id: "stockStatus",
        type: "select" as const,
        label: "Stock Status",
        placeholder: "All Stock Status",
        value: stockStatusFilter,
        onChange: handleStockStatusChange,
        options: STOCK_STATUS_FILTER,
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
    ],
  }), [filters.search, filters.status, stockStatusFilter, selectedBrand, selectedCategories]);

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["productStatus", "stockStatus"]}
        />

        {}
        <div className="overflow-x-auto max-w-full rounded border">
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
      </div>

      {}
      <ProductDetailModal
        productId={detailModalState.productId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {}
      <SizeStockManagementModal
        isOpen={stockManagementState.isOpen}
        onClose={closeStockManagementModal}
        product={stockManagementState.product}
      />
    </div>
  );
}

export default function SizeStockPage() {
  return (
    <Suspense>
      <SizeStockPageInner />
    </Suspense>
  );
}
