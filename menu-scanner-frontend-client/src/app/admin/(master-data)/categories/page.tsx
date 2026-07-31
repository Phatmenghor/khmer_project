"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, Suspense, useRef } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { DownloadTemplateButton, ImportSpreadsheetButton } from "@/components/shared/button/custom-button";
import { downloadCategoryTemplate } from "@/utils/excel/category-excel.utils";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, Status } from "@/constants/status/status";
import { usePagination } from "@/hooks/use-pagination";
import { STATUS_FILTER } from "@/constants/status/filter-status";
import { useCategoriesState } from "@/features/master-data/store/state/categories-state";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import {
  setPageNo,
  setSearchFilter,
  setStatusFilter,
  resetState,
} from "@/features/master-data/store/slice/categories-slice";
import {
  deleteCategoriesService,
  toggleCategoriesStatusService,
  fetchAllCategoriesWithProductCountService,
  fetchCategoriesByIdService,
} from "@/features/master-data/store/thunks/categories-thunks";
import {
  selectCategoriesWithProductCountContent,
  selectPaginationWithProductCount,
  selectSelectedCategories,
} from "@/features/master-data/store/selectors/categories-selector";
import { categoriesTableColumns } from "@/features/master-data/table/categories-table";
import CategoriesModal from "@/features/master-data/components/categories-modal";
import { CategoriesDetailModal } from "@/features/master-data/components/categories-detail-modal";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
import { useActionRouting } from "@/hooks/use-action-routing";
import { useAdminFilterUrlSync } from "@/hooks/use-admin-filter-url-sync";

function CategoriesPageInner() {
  useAdminCleanup(resetState);
  const isInitialMount = useRef(true);
  const router = useRouter();

  const {
    categoriesState,
    isLoading,
    filters,
    operations,
    dispatch,
  } = useCategoriesState();

  const {
    viewId,
    editId,
    deleteId,
    createMode,
    openView,
    openEdit,
    openDelete,
    openCreate,
    closeModal,
  } = useActionRouting();

  const categoriesWithProductCount = useAppSelector(selectCategoriesWithProductCountContent);
  const paginationWithProductCount = useAppSelector(selectPaginationWithProductCount);

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, AppDefault.DEFAULT_DEBOUNCE_MS);

  const isHydrated = useAdminFilterUrlSync({
    filters: {
      search: filters.search,
      status: filters.status !== Status.ALL ? filters.status : "",
      pageNo: filters.pageNo,
      pageSize: globalPageSize !== AppDefault.PAGE_SIZE ? globalPageSize : "",
    },
    onInit: (params) => {
      if (params.search) dispatch(setSearchFilter(params.search));
      if (params.status) dispatch(setStatusFilter(params.status as Status));
      if (params.pageNo) dispatch(setPageNo(Number(params.pageNo)));
      if (params.pageSize) dispatch(setGlobalPageSize(Number(params.pageSize)));
    },
  });

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.CATEGORIES,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    if (!isHydrated) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (categoriesWithProductCount && categoriesWithProductCount.length > 0) {
        return;
      }
    }

    dispatch(
      fetchAllCategoriesWithProductCountService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        status: filters.status === Status.ALL ? undefined : filters.status,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, debouncedSearch, filters.status, filters.pageNo, globalPageSize, isHydrated]);

  // ── Deep-link resolver ────────────────────────────────────────────────────
  const selectedCategories = useAppSelector(selectSelectedCategories);

  const resolveCategories = (id: string | null): CategoriesResponseModel | null => {
    if (!id) return null;
    return categoriesWithProductCount.find(c => c.id === id) || (selectedCategories?.id === id ? selectedCategories : null);
  };

  const deleteCategories = resolveCategories(deleteId);
  const hasDeleteCategories = !!deleteCategories;

  useEffect(() => {
    if (deleteId && !hasDeleteCategories) {
      dispatch(fetchCategoriesByIdService(deleteId));
    }
  }, [deleteId, hasDeleteCategories, dispatch]);

  // ── Table action handlers ─────────────────────────────────────────────────
  const handleCreateCategories = () => openCreate();
  const handleEditCategories = (categories: CategoriesResponseModel) => openEdit(categories.id || "");
  const handleCategoriesViewDetail = (categories: CategoriesResponseModel) => openView(categories.id || "");
  const handleDeleteCategories = (categories: CategoriesResponseModel) => openDelete(categories.id || "");

  const handleToggleCategoryStatus = (category: CategoriesResponseModel) => {
    if (!category?.id) return;
    try {
      dispatch(toggleCategoriesStatusService(category));
      showToast.success(Messages.category.statusUpdated);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.category.statusUpdateFailed);
    }
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditCategories,
      handleCategoriesViewDetail,
      handleDeleteCategories,
      handleToggleCategoryStatus,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      categoriesTableColumns({
        data: categoriesState?.dataWithProductCount,
        handlers: tableHandlers,
      }),
    [categoriesState, tableHandlers],
  );

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const handleOpenImport = () => {
    router.push(ROUTES.ADMIN.CATEGORIES_IMPORT);
  };

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Categories Information",
    searchValue: filters.search,
    searchPlaceholder: "Search categories...",
    onSearchChange: (e) => dispatch(setSearchFilter(e.target.value)),
    buttonText: "New",
    buttonTooltip: "Create a new category",
    onButtonClick: handleCreateCategories,
    extraActions: (
      <div className="flex items-center gap-1">
        <DownloadTemplateButton onDownload={downloadCategoryTemplate} />
        <ImportSpreadsheetButton onClick={handleOpenImport} title="Import categories from Excel" />
      </div>
    ),
    filters: [
      {
        id: "status",
        type: "select",
        label: "Categories Status",
        placeholder: "All Status",
        value: filters.status,
        onChange: (value) => dispatch(setStatusFilter(value as Status)),
        options: STATUS_FILTER,
      },
    ],
  }), [filters.search, filters.status]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteCategoriesService(deleteId)).unwrap();
      showToast.success(
        `Categories "${deleteCategories?.name ?? ""}" deleted successfully`,
      );
      closeModal();
      if (categoriesWithProductCount.length === 1 && paginationWithProductCount.currentPage > 1) {
        const newPage = paginationWithProductCount.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.category.deleteFailed);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel config={filterConfig} essentialFilterIds={["status"]} />

        <DataTableWithPagination
          data={categoriesWithProductCount}
          columns={columns}
          loading={isLoading}
          emptyMessage="No Categories found"
          getRowKey={(categories) => categories.id}
          currentPage={paginationWithProductCount.currentPage}
          totalElements={paginationWithProductCount.totalElements}
          totalPages={paginationWithProductCount.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <CategoriesModal
        isOpen={createMode || !!editId}
        onClose={closeModal}
        categoriesId={editId || undefined}
        mode={createMode ? ModalMode.CREATE_MODE : ModalMode.UPDATE_MODE}
      />

      <CategoriesDetailModal
        categoriesId={viewId || undefined}
        isOpen={!!viewId}
        onClose={closeModal}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={closeModal}
        onDelete={handleDelete}
        title="Delete Categories"
        description={`Are you sure you want to delete this categories ${
          deleteCategories?.name || ""
        }?`}
        itemName={deleteCategories?.name || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense>
      <CategoriesPageInner />
    </Suspense>
  );
}
