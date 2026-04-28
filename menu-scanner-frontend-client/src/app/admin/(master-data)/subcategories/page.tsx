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
  setPageNo,
  setSearchFilter,
  setStatusFilter,
  resetState,
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
  useAdminCleanup(resetState);

  const {
    subcategoriesState,
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
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
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
    if (!deleteState.subcategory?.id) return;

    try {
      await dispatch(deleteSubcategory(deleteState.subcategory.id)).unwrap();

      showToast.success(
        `Subcategory "${deleteState.subcategory.name ?? ""}" deleted successfully`,
      );

      closeDeleteModal();

      if (subcategoriesContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
      } else {
        dispatch(fetchAllSubcategories({
          search: filters.search,
          pageNo: filters.pageNo,
          pageSize: globalPageSize,
          status: filters.status == Status.ALL ? undefined : filters.status,
          categoryId: filters.categoryId || undefined,
        }));
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
    <div className="space-y-6">
      <CardHeaderSection
        title="Subcategories Management"
        description="Manage your subcategories here"
        showActions={true}
        actionLabel="Add Subcategory"
        actionIcon={Plus}
        onAction={handleCreateSubcategory}
      >
        <div className="flex gap-4 items-end w-full">
          <input
            type="text"
            placeholder="Search subcategories..."
            value={filters.search}
            onChange={handleSearchChange}
            className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
          />

          <CustomSelect
            value={filters.status}
            onChange={(value) => handleStatusChange(value as Status)}
            options={STATUS_FILTER}
            placeholder="Filter by status"
            className="w-48"
          />
        </div>
      </CardHeaderSection>

      <DataTableWithPagination
        columns={columns}
        data={subcategoriesContent}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChangeWrapper}
        onPageSizeChange={handlePageSizeChange}
        defaultPageSize={globalPageSize}
      />

      <SubcategoriesModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        subcategory={modalState.subcategory}
        mode={modalState.mode}
      />

      <SubcategoriesDetailModal
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
        subcategory={detailModalState.subcategory}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Subcategory"
        description="Are you sure you want to delete this subcategory?"
        itemName={deleteState.subcategory?.name}
        isDangerous={true}
      />
    </div>
  );
}
