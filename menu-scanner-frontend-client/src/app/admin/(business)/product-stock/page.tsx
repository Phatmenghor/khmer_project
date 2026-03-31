"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, ProductStatus, Status } from "@/constants/status/status";
import { usePagination } from "@/redux/store/use-pagination";
import { useStockState } from "@/redux/features/business/store/state/stock-state";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import {
  fetchAllProductStockAdminService,
} from "@/redux/features/business/store/thunks/stock-thunks";
import {
  selectProductStatus,
  setPageNo,
  setSearchFilter,
  resetState,
} from "@/redux/features/business/store/slice/stock-slice";
import { stockTableColumns } from "@/redux/features/business/table/stock-table";
import { ProductDetailModal } from "@/redux/features/business/components/product-detail-modal";
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

// Filter options for has size
const HAS_SIZE_FILTER = [
  { value: "ALL", label: "All Products" },
  { value: "WITH_SIZES", label: "With Sizes" },
  { value: "WITHOUT_SIZES", label: "Without Sizes" },
];

export default function ProductStockPage() {
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

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    product: null as ProductDetailResponseModel | null,
  });

  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(
    null,
  );
  const [selectedCategories, setSelectedCategories] =
    useState<CategoriesResponseModel | null>(null);
  const [hasSizeFilter, setHasSizeFilter] = useState("ALL");

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.STOCK_MANAGEMENT,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    // Determine hasSize filter value
    let hasSize: boolean | undefined;
    if (hasSizeFilter === "WITH_SIZES") {
      hasSize = true;
    } else if (hasSizeFilter === "WITHOUT_SIZES") {
      hasSize = false;
    }
    // if ALL, hasSize remains undefined (no filter)

    dispatch(
      fetchAllProductStockAdminService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        status:
          filters.status == ProductStatus.ALL ? undefined : filters.status,
        brandId: selectedBrand?.id,
        categoryId: selectedCategories?.id,
        hasSize,
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
    hasSizeFilter,
  ]);

  // Event handlers
  const handleCreateStock = () => {
    showToast.info("Create stock feature coming soon");
  };

  const handleProductViewDetail = (product: ProductDetailResponseModel) => {
    setDetailModalState({
      isOpen: true,
      productId: product.id || "",
    });
  };

  const handleDeleteStock = (product: ProductDetailResponseModel) => {
    setDeleteState({
      isOpen: true,
      product: product,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleViewProduct: handleProductViewDetail,
      handleCreateStock,
      handleDeleteStock,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      stockTableColumns({
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

  const handleDelete = async () => {
    if (!deleteState.product?.id) return;

    try {
      // TODO: Implement stock deletion API call
      showToast.success(
        `Stock for "${deleteState.product.name ?? ""}" deleted successfully`,
      );
      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (stockContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete stock");
    }
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      productId: "",
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
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

  const handleHasSizeChange = (value: string) => {
    setHasSizeFilter(value);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          title="Product Stock Information"
          searchValue={filters.search}
          searchPlaceholder="Search product..."
          buttonTooltip="Create a new stock"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreateStock}
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
            options={HAS_SIZE_FILTER}
            value={hasSizeFilter}
            placeholder="All Products"
            onValueChange={handleHasSizeChange}
            label="Product Type"
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
          emptyMessage="No product found"
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

      {/* Modals Delete Stock */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Stock"
        description={`Are you sure you want to delete stock for this product ${
          deleteState.product?.name || ""
        }?`}
        itemName={deleteState.product?.name || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
