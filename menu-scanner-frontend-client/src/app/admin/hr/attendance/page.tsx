"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/redux/store/use-pagination";
import { useWorkScheduleState } from "@/redux/features/hr/store/state/work-schedule-state";
import { ModalMode } from "@/constants/status/status";
import WorkScheduleModal from "@/redux/features/hr/components/work-schedule-modal";
import { WorkScheduleDetailModal } from "@/redux/features/hr/components/work-schedule-detail-modal";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";
import {
  resetState,
  setPageNo,
  setSearchFilter,
} from "@/redux/features/hr/store/slice/attendance-slice";
import { useAttendanceState } from "@/redux/features/hr/store/state/attendance-state";
import { AttendanceResponseModel } from "@/redux/features/hr/store/models/response/attendance-response";
import {
  deleteAttendanceService,
  fetchAllAttendanceService,
} from "@/redux/features/hr/store/thunks/attendance-thunks";
import { attendanceTableColumns } from "@/redux/features/hr/table/attendance-table";
import AttendanceModal from "@/redux/features/hr/components/attendance-modal";
import { AttendanceDetailModal } from "@/redux/features/hr/components/attendance-detail-modal";

export default function AttendancePage() {
  useAdminCleanup(resetState);

  // Redux state
  const {
    attendanceState,
    attendanceData,
    attendanceContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useAttendanceState();

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
    attendance: null as AttendanceResponseModel | null,
  });

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.HR.ATTENDANCE,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  // Fetch work schedules when filters change
  useEffect(() => {
    dispatch(
      fetchAllAttendanceService({
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

  const handleEditItem = (attendance: AttendanceResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      id: attendance?.id || "",
    });
  };

  const handleViewDetailItem = (attendance: AttendanceResponseModel) => {
    setDetailModalState({
      isOpen: true,
      id: attendance.id || "",
    });
  };

  const handleDeleteItem = (attendance: AttendanceResponseModel) => {
    setDeleteState({
      isOpen: true,
      attendance: attendance,
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
      attendanceTableColumns({
        data: attendanceData,
        handlers: tableHandlers,
      }),
    [attendanceState, tableHandlers],
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
    if (!deleteState.attendance?.id) return;

    try {
      await dispatch(
        deleteAttendanceService(deleteState.attendance.id),
      ).unwrap();

      showToast.success(
        `Attendance "${
          deleteState?.attendance?.userInfo?.fullName ?? ""
        }" deleted successfully`,
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (attendanceContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete attendance");
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
      attendance: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.ROOT },
            { label: "Attendance", href: "" },
          ]}
          title="Attendance Management"
          searchValue={filters.search}
          searchPlaceholder="Search attendace..."
          buttonIcon={<Plus className="w-3 h-3" />}
          onSearchChange={handleSearchChange}
        ></CardHeaderSection>

        {/* Data Table with Your Custom Pagination */}
        <DataTableWithPagination
          data={attendanceContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No attendances found"
          getRowKey={(attendance) => attendance.id}
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
      <AttendanceModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        attendanceId={modalState.id}
      />

      {/* Modals Attendance Detail */}
      <AttendanceDetailModal
        attendanceId={detailModalState.id}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Delete Work Schedule */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Attendance"
        description={`Are you sure you want to delete this attendance ${deleteState.attendance?.userInfo?.fullName}?`}
        itemName={
          deleteState.attendance?.userInfo?.fullName || "this attendance"
        }
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
