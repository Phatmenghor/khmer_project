"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, useState, Suspense} from "react";

import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { ConfirmationModal } from "@/components/shared/modal/confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, ProductStatus, Status } from "@/constants/status/status";
import { usePagination } from "@/hooks/use-pagination";
import { useProductState } from "@/features/business/store/state/product-state";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import {
  deleteProductService,
  fetchAllProductAdminService,
  resetProductPromotionService,
  resetAllPromotionsService,
  resetBulkPromotionsService,
  updateProductService,
} from "@/features/business/store/thunks/product-thunks";
import {
  selectProductStatus,
  setPageNo,
  setSearchFilter,
  resetState,
  resetProductPromotionOptimistic,
  resetAllPromotionsOptimistic,
  resetTablePromotionsOptimistic,
  updateProductOptimistic,
} from "@/features/business/store/slice/product-slice";
import { useRouter } from "next/navigation";
import ProductModal from "@/features/business/components/product-modal";
import { ProductDetailModal } from "@/features/business/components/product-detail-modal";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { PRODUCT_STATUS_FILTER, PRODUCT_SIZE_FILTER } from "@/constants/status/filter-status";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
import { productPromotionTableColumns } from "@/features/business/table/product-promotion-table";

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

function ProductPromotionPageInner() {
  const router = useRouter();

  useAdminCleanup(resetState);

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

  useEffect(() => {
    dispatch(setPageNo(1));
    dispatch(setSearchFilter(""));
    dispatch(selectProductStatus(ProductStatus.ALL));
  }, []);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    productId: "",
  });

  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(
    null,
  );
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("");
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

  const [resetAllState, setResetAllState] = useState({
    isOpen: false,
  });

  const [resetTableState, setResetTableState] = useState({
    isOpen: false,
    selectedProductIds: [] as string[],
  });

  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.PRODUCTS_PROMOTION,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {

    let hasSize: boolean | undefined;
    if (sizeFilter === "true") {
      hasSize = true;
    } else if (sizeFilter === "false") {
      hasSize = false;
    }

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
        sortBy: sortBy || "createdAt",
        sortDirection: sortDirection || "DESC",
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

  const handleStatusChange = (productId: string, status: string) => {

    dispatch(
      updateProductOptimistic({
        id: productId,
        status,
      })
    );

    dispatch(
      updateProductService({
        productId,
        productData: { status },
      })
    ).then(() => {
      showToast.success(`Product status updated to ${status}`);
    }).catch((error: unknown) => {
      showToast.error((error as { message?: string })?.message || Messages.product.statusUpdateFailed);
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
      showToast.success(Messages.promotions.allReset);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.promotions.allResetFailed);
    }
  };

  const handleResetTablePromotions = () => {
    const selectedIds = productContent?.filter((p) => p.isSelected).map((p) => p.id) || [];
    if (selectedIds.length === 0) {
      showToast.error(Messages.product.selectAtLeastOneToReset);
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
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || "Failed to reset promotions");
    }
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditProduct,
      handleProductViewDetail,
      handleDeleteProduct,
      handleResetPromotion,
      handleStatusChange,
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

      if (productContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.product.deleteFailed);
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

    dispatch(resetProductPromotionOptimistic(resetPromotionState.product.id));

    closeResetPromotionModal();

    try {
      await dispatch(resetProductPromotionService(resetPromotionState.product.id)).unwrap();
      showToast.success(
        `Promotion reset for product "${resetPromotionState.product?.name ?? ""}"`,
      );
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.promotions.resetFailed);
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

  const handleSizeFilterChange = (value: string | number | boolean | null | undefined) => {
    setSizeFilter(String(value ?? ""));
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
  };

  const selectedRowCount = useMemo(
    () => productContent?.filter((p) => p.isSelected).length ?? 0,
    [productContent],
  );

  const extraActions = null;

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Product Promotions",
    subtitle: "Products with active promotional discounts",
    totalCount: pagination.totalElements,
    searchValue: filters.search,
    searchPlaceholder: "Search product...",
    onSearchChange: handleSearchChange,
    buttonText: "Create Promotion",
    buttonDisabled: false,
    onButtonClick: handleCreatePromotion,
    onClearAll: handleClearAllFilters,
    extraActions,
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
  }), [filters, selectedBrand, selectedCategories, sizeFilter, sortBy, sortDirection, pagination.totalElements, selectedRowCount, operations.isDeleting]);

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["size", "status"]}
        />

        {}
        <div className="overflow-x-auto max-w-full rounded border">
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
      </div>

      {}
      <ProductModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        productId={modalState.productId}
        mode={modalState.mode}
      />

      {}
      <ProductDetailModal
        productId={detailModalState.productId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {}
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

      {}
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

      {}
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

      {}
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

export default function ProductPromotionPage() {
  return (
    <Suspense>
      <ProductPromotionPageInner />
    </Suspense>
  );
}
