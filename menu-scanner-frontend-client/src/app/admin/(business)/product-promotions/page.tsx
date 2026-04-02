"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CollapsibleFilterPanel } from "@/redux/features/business/components/collapsible-filter-panel";
import { FilterPanelConfig } from "@/redux/features/business/components/filter-types";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { ConfirmationModal } from "@/components/shared/modal/confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, ProductStatus, Status } from "@/constants/status/status";
import { usePagination } from "@/redux/store/use-pagination";
import { useProductState } from "@/redux/features/business/store/state/product-state";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import {
  deleteProductService,
  fetchAllProductAdminService,
  resetProductPromotionService,
  resetAllPromotionsService,
  resetBulkPromotionsService,
} from "@/redux/features/business/store/thunks/product-thunks";
import {
  selectProductStatus,
  setPageNo,
  setSearchFilter,
  resetState,
  resetProductPromotionOptimistic,
  resetAllPromotionsOptimistic,
  resetTablePromotionsOptimistic,
} from "@/redux/features/business/store/slice/product-slice";
import { useRouter } from "next/navigation";
import ProductModal from "@/redux/features/business/components/product-modal";
import { ProductDetailModal } from "@/redux/features/business/components/product-detail-modal";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { PRODUCT_STATUS_FILTER, PRODUCT_SIZE_FILTER } from "@/constants/status/filter-status";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";
import { productPromotionTableColumns } from "@/redux/features/business/table/product-promotion-table";

// Sort field options for promotions page
const SORT_BY_OPTIONS = [
  { value: "createdAt", label: "Created Date" },
  { value: "displayPrice", label: "Display Price" },
  { value: "barcode", label: "Barcode" },
  { value: "sku", label: "SKU" },
  { value: "totalStock", label: "Total Stock" },
  { value: "favoriteCount", label: "Favorite Count" },
  { value: "viewCount", label: "View Count" },
];

const SORT_DIRECTION_OPTIONS = [
  { value: "DESC", label: "High to Low (DESC)" },
  { value: "ASC", label: "Low to High (ASC)" },
];

export default function ProductPromotionPage() {
  const router = useRouter();

  // Clean up state when leaving admin area (performance optimization)
  useAdminCleanup(resetState);

  // Redux state
  const {
    productState,
    productData,
    productContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useProductState();

  // Reset filters when entering this page (separate from other admin pages)
  useEffect(() => {
    dispatch(setPageNo(1));
    dispatch(setSearchFilter(""));
    dispatch(selectProductStatus(ProductStatus.ALL));
  }, []);

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    productId: "",
  });

  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(
    null,
  );
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("DESC");
  const [selectedCategories, setSelectedCategories] =
    useState<CategoriesResponseModel | null>(null);

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    productId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    product: null as ProductDetailResponseModel | null,
  });

  const [resetPromotionState, setResetPromotionState] = useState({
    isOpen: false,
    product: null as ProductDetailResponseModel | null,
  });

  // ===== RESET ALL PROMOTIONS =====
  const [resetAllState, setResetAllState] = useState({
    isOpen: false,
  });

  // ===== RESET TABLE PROMOTIONS (SELECTED) =====
  const [resetTableState, setResetTableState] = useState({
    isOpen: false,
    selectedProductIds: [] as string[],
  });

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.PRODUCTS_PROMOTION,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    // Determine hasSize filter value
    let hasSize: boolean | undefined;
    if (sizeFilter === "true") {
      hasSize = true;
    } else if (sizeFilter === "false") {
      hasSize = false;
    }
    // if ALL, hasSize remains undefined (no filter)

    dispatch(
      fetchAllProductAdminService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        hasPromotion: true,
        statuses:
          filters.status && filters.status !== ProductStatus.ALL ? [filters.status] : undefined,
        brandId: selectedBrand?.id,
        categoryId: selectedCategories?.id,
        hasSize,
        sortBy,
        sortDirection,
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
    sizeFilter,
    sortBy,
    sortDirection,
  ]);

  // Event handlers
  const handleCreatePromotion = () => {
    router.push(ROUTES.ADMIN.BULK_PROMOTION_CREATION);
  };

  const handleEditProduct = (product: ProductDetailResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      productId: product?.id || "",
    });
  };

  const handleProductViewDetail = (product: ProductDetailResponseModel) => {
    setDetailModalState({
      isOpen: true,
      productId: product.id || "",
    });
  };

  const handleDeleteProduct = (product: ProductDetailResponseModel) => {
    setDeleteState({
      isOpen: true,
      product: product,
    });
  };

  const handleResetPromotion = (product: ProductDetailResponseModel) => {
    setResetPromotionState({
      isOpen: true,
      product: product,
    });
  };

  const handleResetAllPromotions = () => {
    setResetAllState({ isOpen: true });
  };

  const closeResetAllModal = () => {
    setResetAllState({ isOpen: false });
  };

  const handleConfirmResetAllPromotions = async () => {
    dispatch(resetAllPromotionsOptimistic());
    closeResetAllModal();
    try {
      await dispatch(resetAllPromotionsService()).unwrap();
      showToast.success("All promotions reset successfully");
    } catch (error: any) {
      showToast.error(error?.message || error || "Failed to reset all promotions");
    }
  };

  const handleResetTablePromotions = () => {
    const selectedIds = productContent?.filter((p) => p.isSelected).map((p) => p.id) || [];
    if (selectedIds.length === 0) {
      showToast.error("Please select at least one product to reset");
      return;
    }
    setResetTableState({
      isOpen: true,
      selectedProductIds: selectedIds,
    });
  };

  const closeResetTableModal = () => {
    setResetTableState({ isOpen: false, selectedProductIds: [] });
  };

  const handleConfirmResetTablePromotions = async () => {
    const ids = resetTableState.selectedProductIds;
    dispatch(resetTablePromotionsOptimistic(ids));
    closeResetTableModal();
    try {
      await dispatch(resetBulkPromotionsService(ids as any)).unwrap();
      showToast.success(`Reset promotions for ${ids.length} products`);
    } catch (error: any) {
      showToast.error(error?.message || error || "Failed to reset promotions");
    }
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditProduct,
      handleProductViewDetail,
      handleDeleteProduct,
      handleResetPromotion,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      productPromotionTableColumns({
        data: productData,
        handlers: tableHandlers,
      }),
    [productState, tableHandlers],
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
      await dispatch(deleteProductService(deleteState.product.id)).unwrap();

      showToast.success(
        `Product "${deleteState.product.name ?? ""}" deleted successfully`,
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (productContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete product");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      productId: "",
    });
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

  const closeResetPromotionModal = () => {
    setResetPromotionState({
      isOpen: false,
      product: null,
    });
  };

  const handleConfirmResetPromotion = async () => {
    if (!resetPromotionState.product?.id) return;

    // Optimistic update - update state immediately
    dispatch(resetProductPromotionOptimistic(resetPromotionState.product.id));

    closeResetPromotionModal();

    // Call API in background without blocking UI
    try {
      await dispatch(resetProductPromotionService(resetPromotionState.product.id)).unwrap();
      showToast.success(
        `Promotion reset for product "${resetPromotionState.product?.name ?? ""}"`,
      );
    } catch (error: any) {
      showToast.error(error?.message || error || "Failed to reset promotion");
    }
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

  const handleSizeFilterChange = (value: string) => {
    setSizeFilter(value);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
  };

  const handleSortDirectionChange = (value: string) => {
    setSortDirection(value);
  };

  // Create filter configuration for CollapsibleFilterPanel
  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Product Promotions",
    searchValue: filters.search,
    searchPlaceholder: "Search product...",
    onSearchChange: handleSearchChange,
    buttonText: "Create Promotion",
    buttonDisabled: false,
    onButtonClick: handleCreatePromotion,
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
        id: "sortBy",
        type: "select",
        label: "Sort By",
        placeholder: "Created Date",
        value: sortBy,
        onChange: handleSortByChange,
        options: SORT_BY_OPTIONS,
      },
      {
        id: "sortDirection",
        type: "select",
        label: "Order",
        placeholder: "DESC",
        value: sortDirection,
        onChange: handleSortDirectionChange,
        options: SORT_DIRECTION_OPTIONS,
      },
    ],
  }), [filters.search, filters.status, selectedBrand, selectedCategories, sizeFilter, sortBy, sortDirection]);

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          title="Product Promotions"
          searchValue={filters.search}
          searchPlaceholder="Search product..."
          buttonTooltip="Create bulk promotion for multiple products"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="Create Promotion"
          onSearchChange={handleSearchChange}
          openModal={handleCreatePromotion}
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
            placeholder="All Categires"
            showAllOption={true}
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

          <CustomSelect
            options={PRODUCT_SIZE_FILTER}
            value={sizeFilter}
            placeholder="All Products"
            onValueChange={handleSizeFilterChange}
            label="Product Size"
          />
        </CardHeaderSection>

        {/* Data Table with Your Custom Pagination */}
        <DataTableWithPagination
          data={productContent}
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

      {/* Modals Add/Edit */}
      <ProductModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        productId={modalState.productId}
        mode={modalState.mode}
      />

      {/* Modals Product Detail */}
      <ProductDetailModal
        productId={detailModalState.productId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Delete Product */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete this product ${
          deleteState.product?.name || ""
        }?`}
        itemName={deleteState.product?.name || ""}
        isSubmitting={operations.isDeleting}
      />

      {/* Modals Reset Promotion */}
      <ConfirmationModal
        isOpen={resetPromotionState.isOpen}
        onClose={closeResetPromotionModal}
        onConfirm={handleConfirmResetPromotion}
        title="Reset Promotion"
        description="Clear all promotional discounts and restore product to regular pricing"
        itemName={resetPromotionState.product?.name || ""}
        actionLabel="Reset Promotion"
        actionVariant="secondary"
        headerBgColor="bg-yellow-50"
        buttonColor="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
        isDangerous={false}
      />

      {/* Reset All Promotions Modal */}
      <ConfirmationModal
        isOpen={resetAllState.isOpen}
        onClose={closeResetAllModal}
        onConfirm={handleConfirmResetAllPromotions}
        title="Reset All Promotions"
        description="Clear all promotional discounts for ALL products in this business and restore to regular pricing"
        itemName="all products"
        actionLabel="Reset All"
        actionVariant="secondary"
        headerBgColor="bg-red-50"
        buttonColor="bg-red-500 hover:bg-red-600 text-white font-semibold"
        isDangerous={true}
      />

      {/* Reset Table Promotions Modal */}
      <ConfirmationModal
        isOpen={resetTableState.isOpen}
        onClose={closeResetTableModal}
        onConfirm={handleConfirmResetTablePromotions}
        title="Reset Promotions"
        description={`Clear promotional discounts for ${resetTableState.selectedProductIds.length} selected products`}
        itemName={`${resetTableState.selectedProductIds.length} products`}
        actionLabel="Reset Selected"
        actionVariant="secondary"
        headerBgColor="bg-yellow-50"
        buttonColor="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
        isDangerous={false}
      />
    </div>
  );
}
