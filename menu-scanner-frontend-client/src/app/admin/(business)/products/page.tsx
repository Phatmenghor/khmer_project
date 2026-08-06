"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, useState, Suspense} from "react";

import { useDebounce } from "@/utils/debounce/debounce";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { downloadProductTemplate } from "@/utils/excel/product-excel.utils";
import { DownloadTemplateButton, ImportSpreadsheetButton } from "@/components/shared/button/custom-button";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { ConfirmationModal } from "@/components/shared/modal/confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, ProductStatus, Status } from "@/constants/status/status";
import { usePagination } from "@/hooks/use-pagination";
import { useProductState } from "@/features/business/store/state/product-state";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import {
  deleteProductService,
  updateProductService,
  fetchAllProductAdminService,
  resetProductPromotionService,
} from "@/features/business/store/thunks/product-thunks";
import {
  selectProductStatus,
  setPageNo,
  setSearchFilter,
  resetState,
  updateProductOptimistic,
  resetProductPromotionOptimistic,
} from "@/features/business/store/slice/product-slice";
import { productTableColumns } from "@/features/business/table/product-table";
import ProductModal from "@/features/business/components/product-modal";
import { ProductDetailModal } from "@/features/business/components/product-detail-modal";
import { useProductTableFilters } from "@/features/business/hooks/use-product-table-filters";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
import { CollapsibleFilterPanel } from "@/components/shared/common/collapsible-filter-panel";
import { useAdminTableUrlState } from "@/hooks/use-admin-table-url-state";

function ProductPageInner() {
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

  const handleCreateProduct = () => {
    openCreate();
  };

  const {
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
  } = useProductTableFilters({
    title: "Products",
    subtitle: "Manage your catalog, brands, categories, and pricing",
    totalCount: pagination.totalElements,
    buttonText: "New Product",
    onButtonClick: handleCreateProduct,
    extraActions: (
      <div className="flex items-center gap-1">
        <DownloadTemplateButton onDownload={downloadProductTemplate} />
        <ImportSpreadsheetButton onClick={() => router.push(ROUTES.ADMIN.PRODUCTS_IMPORT)} title="Import products from Excel" />
      </div>
    ),
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    productId: "",
  });

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

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, 400);

  const {
    isHydrated,
    viewId,
    editId,
    deleteId,
    createMode,
    openView,
    openEdit,
    openDelete,
    openCreate,
    closeModal: closeRouteModal,
    updateUrlWithPage,
    handlePageChange,
  } = useAdminTableUrlState({
    baseRoute: ROUTES.ADMIN.PRODUCTS,
    filters: {
      search: filters.search,
      status: filters.status && filters.status !== ProductStatus.ALL ? filters.status : "",
      categoryId: selectedCategories?.id || "",
      brandId: selectedBrand?.id || "",
      sizeFilter: sizeFilter !== "ALL" ? sizeFilter : "",
      sortBy: sortBy || "",
      sortDirection: sortDirection || "",
      pageNo: filters.pageNo,
      pageSize: globalPageSize !== AppDefault.PAGE_SIZE ? globalPageSize : "",
    },
    onInit: (params) => {
      if (params.search) dispatch(setSearchFilter(params.search));
      if (params.status) dispatch(selectProductStatus(params.status as ProductStatus));
      if (params.pageNo) dispatch(setPageNo(Number(params.pageNo)));
      if (params.pageSize) dispatch(setGlobalPageSize(Number(params.pageSize)));
      if (params.sizeFilter) setSizeFilter(params.sizeFilter);
      if (params.sortBy) setSortBy(params.sortBy);
      if (params.sortDirection) setSortDirection(params.sortDirection);
      if (params.categoryId) setSelectedCategories({ id: params.categoryId, name: "" } as any);
      if (params.brandId) setSelectedBrand({ id: params.brandId, name: "" } as any);
    },
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    if (!isHydrated) return;

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
    isHydrated,
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

  const handleEditProduct = (product: ProductDetailResponseModel) => {
    if (product?.id) openEdit(product.id);
  };

  const handleProductViewDetail = (product: ProductDetailResponseModel) => {
    if (product?.id) openView(product.id);
  };

  const handleDeleteProduct = (product: ProductDetailResponseModel) => {
    if (product?.id) {
      setDeleteState({ isOpen: true, product });
      openDelete(product.id);
    }
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
      productTableColumns({
        data: productData,
        handlers: tableHandlers,
      }),
    [productState, tableHandlers],
  );

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

  const handleConfirmResetPromotion = async () => {
    if (!resetPromotionState.product?.id) return;

    dispatch(resetProductPromotionOptimistic(resetPromotionState.product.id));

    closeResetPromotionModal();

    dispatch(resetProductPromotionService(resetPromotionState.product.id))
      .then(() => {
        showToast.success(
          `Promotion reset for product "${resetPromotionState.product?.name ?? ""}"`,
        );
      })
      .catch((error: unknown) => {
        showToast.error((error as { message?: string })?.message || Messages.promotions.resetFailed);
      });
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

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-2">
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["size", "status"]}
        />

        {}
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

      {}
      <ProductModal
        isOpen={createMode || !!editId || modalState.isOpen}
        onClose={() => {
          closeModal();
          closeRouteModal();
        }}
        productId={editId || modalState.productId}
        mode={editId ? ModalMode.UPDATE_MODE : modalState.mode}
      />

      <ProductDetailModal
        productId={viewId || detailModalState.productId}
        isOpen={!!viewId || detailModalState.isOpen}
        onClose={() => {
          closeDetailModal();
          closeRouteModal();
        }}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId || deleteState.isOpen}
        onClose={() => {
          closeDeleteModal();
          closeRouteModal();
        }}
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
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense>
      <ProductPageInner />
    </Suspense>
  );
}
