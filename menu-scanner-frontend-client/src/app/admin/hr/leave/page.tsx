"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/hooks/use-pagination";
import { ModalMode } from "@/constants/status/status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { useLeaveState } from "@/features/hr/store/state/leave-state";
import { LeaveResponseModel } from "@/features/hr/store/models/response/leave-response";
import {
  resetState,
  setPageNo,
  setSearchFilter,
} from "@/features/hr/store/slice/leave-slice";
import {
  deleteLeaveService,
  fetchAllLeaveService,
} from "@/features/hr/store/thunks/leave-thunks";
import { leaveTableColumns } from "@/features/hr/table/leave-table";
import LeaveModal from "@/features/hr/components/leave-modal";
import { LeaveDetailModal } from "@/features/hr/components/leave-detail-modal";
import ApproveRejectLeaveModal from "@/features/hr/components/approve-reject-leave-modal";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";

export default function LeaveTypePage() {
  useAdminCleanup(resetState);


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


  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.HR.LEAVE,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });


  useEffect(() => {
    dispatch(
      fetchAllLeaveService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
      }),
    );
  }, [dispatch, debouncedSearch, filters.pageNo, globalPageSize]);


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
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const handleDelete = async () => {
    if (!deleteState.leave?.id) return;

    try {
      await dispatch(deleteLeaveService(deleteState.leave.id)).unwrap();

      showToast.success(
        `Leave Type "${deleteState.leave.userInfo.fullName ?? ""}" deleted successfully`,
      );

      closeDeleteModal();


      if (leaveContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.hr.leaveDeleteFailed);
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

  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1.5">
      <div className="space-y-3">
        <CardHeaderSection
          title="Leave Information"
          searchValue={filters.search}
          searchPlaceholder="Search leave..."
          buttonTooltip="Create a new leave"
          buttonIcon={<Plus className="w-2 h-2" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreate}
        ></CardHeaderSection>

        {}
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

      {}
      <LeaveModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        leaveId={modalState.id}
        mode={modalState.mode}
        onApprove={handleApproveItem}
        onReject={handleRejectItem}
      />

      {}
      <LeaveDetailModal
        leaveId={detailModalState.id}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
        onApprove={handleApproveItem}
        onReject={handleRejectItem}
        onEdit={handleEditItem}
      />

      {}
      <ApproveRejectLeaveModal
        isOpen={approveRejectState.isOpen}
        onClose={closeApproveRejectModal}
        leaveId={approveRejectState.leaveId}
        action={approveRejectState.action}
      />

      {}
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
