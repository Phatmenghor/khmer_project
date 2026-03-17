"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/redux/store/use-pagination";
import { ModalMode } from "@/constants/status/status";
import { useLeaveTypeState } from "@/redux/features/hr/store/state/leave-type-state";
import {
  deleteLeaveTypeService,
  fetchAllLeaveTypesService,
} from "@/redux/features/hr/store/thunks/leave-type-thunks";
import { LeaveTypeResponseModel } from "@/redux/features/hr/store/models/response/leave-type-response";
import { leaveTypeTableColumns } from "@/redux/features/hr/table/leave-type-table";
import LeaveTypeModal from "@/redux/features/hr/components/leave-type-modal";
import { LeaveTypeDetailModal } from "@/redux/features/hr/components/leave-type-detail-modal";
import {
  resetState,
  setPageNo,
  setSearchFilter,
} from "@/redux/features/hr/store/slice/leave-type-slice";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";

export default function LeaveTypePage() {
  useAdminCleanup(resetState);

  const searchParams = useSearchParams();

  // Redux state
  const {
    leaveTypeState,
    leaveTypeData,
    leaveTypeContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useLeaveTypeState();

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    id: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    id: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    leaveType: null as LeaveTypeResponseModel | null,
  });

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.HR.LEAVE_TYPE,
  });

  // Initialize URL and Redux state on mount
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;

    if (pageFromUrl !== pagination.currentPage) {
      dispatch(setPageNo(pageFromUrl));
    }
  }, [searchParams, filters.pageNo, dispatch]);

  // Fetch users when filters change
  useEffect(() => {
    dispatch(
      fetchAllLeaveTypesService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
      }),
    );
  }, [dispatch, debouncedSearch, filters.pageNo, globalPageSize]);

  // Event handlers
  const handleCreate = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      id: "",
    });
  };

  const handleEditItem = (leaveType: LeaveTypeResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      id: leaveType?.id || "",
    });
  };

  const handleViewDetailItem = (leaveType: LeaveTypeResponseModel) => {
    setDetailModalState({
      isOpen: true,
      id: leaveType.id || "",
    });
  };

  const handleDeleteItem = (leaveType: LeaveTypeResponseModel) => {
    setDeleteState({
      isOpen: true,
      leaveType: leaveType,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditItem,
      handleViewDetailItem,
      handleDeleteItem,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      leaveTypeTableColumns({
        data: leaveTypeData,
        handlers: tableHandlers,
      }),
    [leaveTypeState, tableHandlers],
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
    if (!deleteState.leaveType?.id) return;

    try {
      await dispatch(deleteLeaveTypeService(deleteState.leaveType.id)).unwrap();

      showToast.success(
        `Leave Type "${
          deleteState.leaveType.enumName ?? ""
        }" deleted successfully`,
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (leaveTypeContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete leave type");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      id: "",
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      id: "",
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      leaveType: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.ROOT },
            { label: "Leave Type", href: "" },
          ]}
          title="Leave Type Information"
          searchValue={filters.search}
          searchPlaceholder="Search leave types..."
          buttonTooltip="Create a new leave type"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreate}
        ></CardHeaderSection>

        {/* Data Table with Your Custom Pagination */}
        <DataTableWithPagination
          data={leaveTypeContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No leave types found"
          getRowKey={(leaveType) => leaveType.id}
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
      <LeaveTypeModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        leaveTypeId={modalState.id}
        mode={modalState.mode}
      />

      {/* Modals Leave type Detail */}
      <LeaveTypeDetailModal
        leaveTypeId={detailModalState.id}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Delete User */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Leave Type"
        description={`Are you sure you want to delete this leave type ${deleteState.leaveType?.enumName}?`}
        itemName={deleteState.leaveType?.enumName || "this leave type"}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
