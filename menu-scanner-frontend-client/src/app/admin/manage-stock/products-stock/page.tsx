"use client";

import { useEffect, useMemo, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { ProductStatus } from "@/constants/status/status";
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
import { stockTableColumns } from "@/features/business/table/product-stock-table";
import { sizeStockTableColumns } from "@/features/business/table/product-size-stock-table";
import { ProductDetailModal } from "@/features/business/components/product-detail-modal";
import { StockManagementModal } from "@/features/business/components/product-stock-management-modal";
import { SizeStockManagementModal } from "@/features/business/components/size-stock-management-modal";
import { updateStockStatusService } from "@/features/business/store/thunks/stock-thunks";
import { PRODUCT_STATUS_FILTER } from "@/constants/status/filter-status";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
import { useAdminTableUrlState } from "@/hooks/use-admin-table-url-state";

const STOCK_STATUS_FILTER = [
  { value: "ALL", label: "All Stock Status" },
  { value: "ENABLED", label: "Stock Enabled" },
  { value: "DISABLED", label: "Stock Disabled" },
];

type StockTab = "product" | "size";

function StockPageInner() {
  useAdminCleanup(resetState);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab: StockTab = searchParams.get("tab") === "size" ? "size" : "product";

  const handleTabChange = (tab: StockTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    // Reset page when switching tabs
    params.delete("pageNo");
    router.replace(`${pathname}?${params.toString()}`);
  };

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

  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<CategoriesResponseModel | null>(null);
  const [stockStatusFilter, setStockStatusFilter] = useState("ALL");

  const stockStatusDebounceRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const stockManagementSuccessMessage = useAppSelector(
    (state) => (state.stockManagement as { successMessage: string | null }).successMessage ?? undefined
  );

  const debouncedSearch = useDebounce(filters.search, 400);

  const {
    isHydrated,
    viewId,
    editId,
    openView,
    openEdit,
    closeModal: closeRouteModal,
    handlePageChange,
  } = useAdminTableUrlState({
    baseRoute: ROUTES.MANAGE_STOCK.PRODUCTS_STOCK,
    filters: {
      search: filters.search,
      status: filters.status && filters.status !== ProductStatus.ALL ? filters.status : "",
      categoryId: selectedCategories?.id || "",
      brandId: selectedBrand?.id || "",
      stockStatus: stockStatusFilter !== "ALL" ? stockStatusFilter : "",
      pageNo: filters.pageNo,
      pageSize: globalPageSize !== AppDefault.PAGE_SIZE ? globalPageSize : "",
    },
    onInit: (params) => {
      if (params.search) dispatch(setSearchFilter(params.search));
      if (params.status) dispatch(selectProductStatus(params.status as ProductStatus));
      if (params.pageNo) dispatch(setPageNo(Number(params.pageNo)));
      if (params.pageSize) dispatch(setGlobalPageSize(Number(params.pageSize)));
      if (params.stockStatus) setStockStatusFilter(params.stockStatus);
      if (params.categoryId) setSelectedCategories({ id: params.categoryId, name: "" } as any);
      if (params.brandId) setSelectedBrand({ id: params.brandId, name: "" } as any);
    },
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  // Reset page to 1 when switching tabs
  useEffect(() => {
    dispatch(setPageNo(1));
    dispatch(setSearchFilter(""));
    dispatch(selectProductStatus(ProductStatus.ALL));
    setSelectedBrand(null);
    setSelectedCategories(null);
    setStockStatusFilter("ALL");
  }, [activeTab]);

  const fetchStock = useCallback(() => {
    if (!isHydrated) return;

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
        hasSize: activeTab === "size" ? true : undefined,
      }),
    );
  }, [
    isHydrated,
    dispatch,
    debouncedSearch,
    filters.pageNo,
    filters.status,
    globalPageSize,
    selectedBrand,
    selectedCategories,
    stockStatusFilter,
    activeTab,
  ]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  useEffect(() => {
    if (isHydrated && stockManagementSuccessMessage) {
      fetchStock();
    }
  }, [isHydrated, stockManagementSuccessMessage]);

  const handleCreateStock = (product: ProductDetailResponseModel) => {
    setStockManagementState({ isOpen: true, product });
    openEdit(product.id || "");
  };

  const handleProductViewDetail = (product: ProductDetailResponseModel) => {
    openView(product.id || "");
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
    [handleToggleStockStatus, openView, openEdit]
  );

  const productColumns = useMemo(
    () => stockTableColumns({ data: stockData, handlers: tableHandlers }),
    [stockState, tableHandlers]
  );

  const sizeColumns = useMemo(
    () => sizeStockTableColumns({ data: stockData, handlers: tableHandlers }),
    [stockState, tableHandlers]
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

  const handleProductStatusChange = (status: ProductStatus) => {
    dispatch(selectProductStatus(status));
  };

  const handleBrandChange = (brand: BrandResponseModel | null) => setSelectedBrand(brand);
  const handleCategoriesChange = (categories: CategoriesResponseModel | null) => setSelectedCategories(categories);
  const handleStockStatusChange = (value: string | number | boolean | null | undefined) => {
    setStockStatusFilter(String(value ?? ""));
  };

  const handleClearAllFilters = () => {
    dispatch(setSearchFilter(""));
    dispatch(selectProductStatus(ProductStatus.ALL));
    setSelectedBrand(null);
    setSelectedCategories(null);
    setStockStatusFilter("ALL");
  };

  const stockProduct = useMemo(() => {
    if (stockManagementState.product) return stockManagementState.product;
    if (editId) return stockContent.find((p) => p.id === editId) || null;
    return null;
  }, [stockManagementState.product, editId, stockContent]);

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: activeTab === "product" ? "Product Stock" : "Size Stock",
    searchValue: filters.search,
    searchPlaceholder: "Search product...",
    onSearchChange: handleSearchChange,
    buttonText: undefined,
    buttonDisabled: false,
    onButtonClick: () => {},
    onClearAll: handleClearAllFilters,
    filters: [
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
      {
        id: "productStatus",
        type: "select" as const,
        label: "Product Status",
        placeholder: "All Status",
        value: filters.status,
        onChange: (value: string | number | boolean | null | undefined) =>
          handleProductStatusChange(value as ProductStatus),
        options: PRODUCT_STATUS_FILTER,
      },
    ],
  }), [activeTab, filters.search, filters.status, stockStatusFilter, selectedBrand, selectedCategories]);

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 border-b border-border/50 pb-0">
        <button
          onClick={() => handleTabChange("product")}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
            activeTab === "product"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Product Stock
          {activeTab === "product" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("size")}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
            activeTab === "size"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Size Stock
          {activeTab === "size" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      <div className="space-y-2">
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["productStatus", "stockStatus"]}
        />

        <DataTableWithPagination
          data={stockContent}
          columns={activeTab === "product" ? productColumns : sizeColumns}
          loading={isLoading}
          emptyMessage={activeTab === "product" ? "No product found" : "No product with sizes found"}
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

      <ProductDetailModal
        productId={viewId || detailModalState.productId}
        isOpen={!!viewId || detailModalState.isOpen}
        onClose={() => {
          setDetailModalState({ isOpen: false, productId: "" });
          closeRouteModal();
        }}
      />

      {activeTab === "product" ? (
        <StockManagementModal
          isOpen={!!editId || stockManagementState.isOpen}
          onClose={() => {
            setStockManagementState({ isOpen: false, product: null });
            closeRouteModal();
          }}
          product={stockProduct}
        />
      ) : (
        <SizeStockManagementModal
          isOpen={!!editId || stockManagementState.isOpen}
          onClose={() => {
            setStockManagementState({ isOpen: false, product: null });
            closeRouteModal();
          }}
          product={stockProduct}
        />
      )}
    </div>
  );
}

export default function ProductsStockPage() {
  return (
    <Suspense>
      <StockPageInner />
    </Suspense>
  );
}
