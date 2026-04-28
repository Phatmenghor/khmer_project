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
import { useSubcategoriesState } from "@/redux/features/master-data/store/state/subcategories-state";
import { SubcategoriesResponseModel } from "@/redux/features/master-data/store/models/response/subcategories-response";
import {
  setSubcategoriesFilters,
  clearSubcategoriesError,
} from "@/redux/features/master-data/store/slice/subcategories-slice";
import {
  deleteSubcategory,
  toggleSubcategoryStatus,
  fetchAllSubcategories,
} from "@/redux/features/master-data/store/thunks/subcategories-thunks";
import { subcategoriesTableColumns } from "@/redux/features/master-data/table/subcategories-table";
import SubcategoriesModal from "@/redux/features/master-data/components/subcategories-modal";
import { SubcategoriesDetailModal } from "@/redux/features/master-data/components/subcategories-detail-modal";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";

export default function SubcategoriesPage() {
  useAdminCleanup(() => clearSubcategoriesError());

  const {
    subcategoriesContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useSubcategoriesState();

  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    subcategory: null as SubcategoriesResponseModel | null,
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    subcategory: null as SubcategoriesResponseModel | null,
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    subcategory: null as SubcategoriesResponseModel | null,
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.SUBCATEGORIES,
    syncPageToRedux: (page) => dispatch(setSubcategoriesFilters({ pageNo: page })),
  });

  useEffect(() => {
    dispatch(
      fetchAllSubcategories({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        status: filters.status == Status.ALL ? undefined : filters.status,
        categoryId: filters.categoryId || undefined,
      }),
    );
  }, [
    dispatch,
    debouncedSearch,
    filters.status,
    filters.pageNo,
    filters.categoryId,
    globalPageSize,
  ]);

  const handleCreateSubcategory = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      subcategory: null,
    });
  };

  const handleEditSubcategory = (subcategory: SubcategoriesResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      subcategory: subcategory,
    });
  };

  const handleSubcategoryViewDetail = (subcategory: SubcategoriesResponseModel) => {
    setDetailModalState({
      isOpen: true,
      subcategory: subcategory,
    });
  };

  const handleDeleteSubcategory = (subcategory: SubcategoriesResponseModel) => {
    setDeleteState({
      isOpen: true,
      subcategory: subcategory,
    });
  };

  const handleToggleSubcategoryStatus = (subcategory: SubcategoriesResponseModel) => {
    if (!subcategory?.id) return;
    try {
      dispatch(toggleSubcategoryStatus(subcategory));
      showToast.success("Subcategory status updated successfully");
    } catch (error: any) {
      showToast.error(error || "Failed to update subcategory status");
    }
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditSubcategory,
      handleSubcategoryViewDetail,
      handleDeleteSubcategory,
      handleToggleSubcategoryStatus,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      subcategoriesTableColumns({
        handlers: tableHandlers,
      }),
    [tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSubcategoriesFilters({ search: e.target.value, pageNo: 1 }));
  };

  const handleStatusChange = (status: Status) => {
    dispatch(setSubcategoriesFilters({ status, pageNo: 1 }));
  };

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setSubcategoriesFilters({ pageNo: page }));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setSubcategoriesFilters({ pageNo: 1 }));
  };

  const handleDelete = async () => {
    if (!deleteState.subcategory?.id) return;

    try {
      await dispatch(deleteSubcategory(deleteState.subcategory.id)).unwrap();

      showToast.success(
        `Subcategory "${deleteState.subcategory.name ?? ""}" deleted successfully`,
      );

      closeDeleteModal();

      if (subcategoriesContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setSubcategoriesFilters({ pageNo: newPage }));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete subcategory");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      subcategory: null,
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      subcategory: null,
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      subcategory: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          title="Subcategories Information"
          searchValue={filters.search}
          searchPlaceholder="Search subcategories..."
          buttonTooltip="Create a new subcategory"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreateSubcategory}
        >
          <div className="flex flex-wrap items-center gap-2">
            <CustomSelect
              options={STATUS_FILTER}
              value={filters.status}
              placeholder="All Status"
              onValueChange={(value) => handleStatusChange(value as Status)}
              label="Subcategory Status"
            />
          </div>
        </CardHeaderSection>

        <DataTableWithPagination
          data={subcategoriesContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No Subcategories found"
          getRowKey={(subcategory) => subcategory.id}
          currentPage={pagination.currentPage}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <SubcategoriesModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        subcategory={modalState.subcategory}
        mode={modalState.mode}
      />

      <SubcategoriesDetailModal
        subcategory={detailModalState.subcategory}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Subcategory"
        description={`Are you sure you want to delete this subcategory ${
          deleteState.subcategory?.name || ""
        }?`}
        itemName={deleteState.subcategory?.name || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
