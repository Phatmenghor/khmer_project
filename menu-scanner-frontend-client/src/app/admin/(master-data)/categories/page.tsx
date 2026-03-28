"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, Status } from "@/constants/status/status";
import { usePagination } from "@/redux/store/use-pagination";
import { STATUS_FILTER } from "@/constants/status/filter-status";
import { useCategoriesState } from "@/redux/features/master-data/store/state/categories-state";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import {
  setPageNo,
  setSearchFilter,
  setStatusFilter,
  resetState,
} from "@/redux/features/master-data/store/slice/categories-slice";
import {
  deleteCategoriesService,
  fetchAllCategoriesService,
} from "@/redux/features/master-data/store/thunks/categories-thunks";
import { categoriesTableColumns } from "@/redux/features/master-data/table/categories-table";
import CategoriesModal from "@/redux/features/master-data/components/categories-modal";
import { CategoriesDetailModal } from "@/redux/features/master-data/components/categories-detail-modal";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";

export default function CategoriesPage() {
  // Clean up state when leaving admin area (performance optimization)
  useAdminCleanup(resetState);

  // Redux state
  const {
    categoriesState,
    categoriesData,
    categoriesContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useCategoriesState();

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    categoriesId: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    categoriesId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    categories: null as CategoriesResponseModel | null,
  });

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.CATEGORIES,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    dispatch(
      fetchAllCategoriesService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        status: filters.status == Status.ALL ? undefined : filters.status,
      }),
    );
  }, [
    dispatch,
    debouncedSearch,
    filters.status,
    filters.pageNo,
    globalPageSize,
  ]);

  // Event handlers
  const handleCreateCategories = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      categoriesId: "",
    });
  };

  const handleEditCategories = (categories: CategoriesResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      categoriesId: categories?.id || "",
    });
  };

  const handleCategoriesViewDetail = (categories: CategoriesResponseModel) => {
    setDetailModalState({
      isOpen: true,
      categoriesId: categories.id || "",
    });
  };

  const handleDeleteCategories = (categories: CategoriesResponseModel) => {
    setDeleteState({
      isOpen: true,
      categories: categories,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditCategories,
      handleCategoriesViewDetail,
      handleDeleteCategories,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      categoriesTableColumns({
        data: categoriesData,
        handlers: tableHandlers,
      }),
    [categoriesState, tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleStatusChange = (status: Status) => {
    dispatch(setStatusFilter(status));
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
    if (!deleteState.categories?.id) return;

    try {
      await dispatch(
        deleteCategoriesService(deleteState.categories.id),
      ).unwrap();

      showToast.success(
        `Categories "${deleteState.categories.name ?? ""}" deleted successfully`,
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (categoriesContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete categories");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      categoriesId: "",
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      categoriesId: "",
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      categories: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          title="Categories Information"
          searchValue={filters.search}
          searchPlaceholder="Search categories..."
          buttonTooltip="Create a new banner"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreateCategories}
        >
          <div className="flex flex-wrap items-center gap-2">
            <CustomSelect
              options={STATUS_FILTER}
              value={filters.status}
              placeholder="All Status"
              onValueChange={(value) => handleStatusChange(value as Status)}
              label="Categories Status"
            />
          </div>
        </CardHeaderSection>

        {/* Data Table with Your Custom Pagination */}
        <DataTableWithPagination
          data={categoriesContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No Categories found"
          getRowKey={(categories) => categories.id}
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
      <CategoriesModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        categoriesId={modalState.categoriesId}
        mode={modalState.mode}
      />

      {/* Modals categories Detail */}
      <CategoriesDetailModal
        categoriesId={detailModalState.categoriesId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Delete User */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Categories"
        description={`Are you sure you want to delete this categories ${
          deleteState.categories?.name || ""
        }?`}
        itemName={deleteState.categories?.name || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
