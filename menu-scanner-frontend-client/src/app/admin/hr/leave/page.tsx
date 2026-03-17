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
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { useLeaveState } from "@/redux/features/hr/store/state/leave-state";
import { LeaveResponseModel } from "@/redux/features/hr/store/models/response/leave-response";
import {
  resetState,
  setPageNo,
  setSearchFilter,
} from "@/redux/features/hr/store/slice/leave-slice";
import {
  deleteLeaveService,
  fetchAllLeaveService,
} from "@/redux/features/hr/store/thunks/leave-thunks";
import { leaveTableColumns } from "@/redux/features/hr/table/leave-table";
import LeaveModal from "@/redux/features/hr/components/leave-modal";
import { LeaveDetailModal } from "@/redux/features/hr/components/leave-detail-modal";
import ApproveRejectLeaveModal from "@/redux/features/hr/components/approve-reject-leave-modal";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";

export default function LeaveTypePage() {
  useAdminCleanup(resetState);

  const searchParams = useSearchParams();

  // Redux state
  const {
    leaveState,
    leaveData,
    leaveContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useLeaveState();

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
    leave: null as LeaveResponseModel | null,
  });

  const [approveRejectState, setApproveRejectState] = useState({
    isOpen: false,
    leaveId: "",
    action: "APPROVED" as "APPROVED" | "REJECTED",
  });

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.HR.LEAVE,
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
      fetchAllLeaveService({
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

  const handleEditItem = (leave: LeaveResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      id: leave?.id || "",
    });
  };

  const handleViewDetailItem = (leave: LeaveResponseModel) => {
    setDetailModalState({
      isOpen: true,
      id: leave.id || "",
    });
  };

  const handleDeleteItem = (leave: LeaveResponseModel) => {
    setDeleteState({
      isOpen: true,
      leave: leave,
    });
  };

  const handleApproveItem = (leave: LeaveResponseModel) => {
    setApproveRejectState({
      isOpen: true,
      leaveId: leave.id,
      action: "APPROVED",
    });
  };

  const handleRejectItem = (leave: LeaveResponseModel) => {
    setApproveRejectState({
      isOpen: true,
      leaveId: leave.id,
      action: "REJECTED",
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditItem,
      handleViewDetailItem,
      handleDeleteItem,
      handleApproveItem,
      handleRejectItem,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      leaveTableColumns({
        data: leaveData,
        handlers: tableHandlers,
      }),
    [leaveState, tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size)); // Update global settings (syncs to all pages)
    dispatch(setPageNo(1)); // Reset to first page
  };

  const handleDelete = async () => {
    if (!deleteState.leave?.id) return;

    try {
      await dispatch(deleteLeaveService(deleteState.leave.id)).unwrap();

      showToast.success(
        `Leave Type "${deleteState.leave.userInfo.fullName ?? ""}" deleted successfully`,
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (leaveContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete leave");
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
      leave: null,
    });
  };

  const closeApproveRejectModal = () => {
    setApproveRejectState({
      isOpen: false,
      leaveId: "",
      action: "APPROVED",
    });
    // No need to refresh - Redux store updates automatically from approveLeaveService
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.ROOT },
            { label: "Leave Type", href: "" },
          ]}
          title="Leave Information"
          searchValue={filters.search}
          searchPlaceholder="Search leave..."
          buttonTooltip="Create a new leave"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreate}
        ></CardHeaderSection>

        {/* Data Table with Your Custom Pagination */}
        <DataTableWithPagination
          data={leaveContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No leave found"
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
      <LeaveModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        leaveId={modalState.id}
        mode={modalState.mode}
        onApprove={handleApproveItem}
        onReject={handleRejectItem}
      />

      {/* Modals Leave Detail */}
      <LeaveDetailModal
        leaveId={detailModalState.id}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
        onApprove={handleApproveItem}
        onReject={handleRejectItem}
        onEdit={handleEditItem}
      />

      {/* Modals Approve/Reject Leave */}
      <ApproveRejectLeaveModal
        isOpen={approveRejectState.isOpen}
        onClose={closeApproveRejectModal}
        leaveId={approveRejectState.leaveId}
        action={approveRejectState.action}
      />

      {/* Modals Delete User */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Leave"
        description={`Are you sure you want to delete this leave ${deleteState.leave?.userInfo.fullName}?`}
        itemName={deleteState.leave?.userInfo.fullName || "this leave"}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
