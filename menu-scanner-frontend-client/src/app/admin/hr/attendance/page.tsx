"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";

import {
  CollapsibleFilterPanel,
  FilterPanelConfig,
} from "@/components/shared/common/collapsible-filter-panel";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { attendanceTableColumns } from "@/features/hr/table/attendance-table";
import { showToast } from "@/components/shared/common/show-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { useHRState } from "@/features/hr/store/state/hr-state";
import {
  fetchAttendanceListService,
  deleteAttendanceService,
} from "@/features/hr/store/thunks/hr-thunks";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import {
  AttendanceModel,
  AttendanceStatusType,
} from "@/features/hr/store/models/hr-models";
import { AttendanceDetailModal } from "@/features/hr/components/attendance-detail-modal";
import { useAdminTableUrlState } from "@/hooks/use-admin-table-url-state";

function AttendancePageInner() {
  const dispatch = useAppDispatch();
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const { attendanceList, attendanceTotalItems, attendanceLoading, selectedAttendance } = useHRState();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, AppDefault.DEFAULT_DEBOUNCE_MS);

  const {
    isHydrated,
    viewId,
    deleteId,
    openView,
    openDelete,
    closeModal,
  } = useAdminTableUrlState({
    baseRoute: ROUTES.ADMIN.HR_ATTENDANCE,
    filters: {
      search: searchQuery,
      status: statusFilter !== "ALL" ? statusFilter : "",
      pageNo: currentPage,
      pageSize: globalPageSize !== AppDefault.PAGE_SIZE ? globalPageSize : "",
    },
    onInit: (params) => {
      if (params.search) setSearchQuery(params.search);
      if (params.status) setStatusFilter(params.status);
      if (params.pageNo) setCurrentPage(Number(params.pageNo));
      if (params.pageSize) dispatch(setGlobalPageSize(Number(params.pageSize)));
    },
    syncPageToRedux: (page) => setCurrentPage(page),
  });

  const deleteAttendance = useMemo(() => {
    if (!deleteId) return null;
    return (
      attendanceList.find((a: AttendanceModel) => a.id === deleteId) ||
      (selectedAttendance?.id === deleteId ? selectedAttendance : null)
    );
  }, [deleteId, attendanceList, selectedAttendance]);

  // Fetch Attendance List
  useEffect(() => {
    if (!isHydrated) return;
    dispatch(
      fetchAttendanceListService({
        businessId: AppDefault.BUSINESS_ID,
        searchQuery: debouncedSearch || undefined,
        status: statusFilter === "ALL" ? undefined : (statusFilter as AttendanceStatusType),
        pageNo: currentPage,
        pageSize: globalPageSize,
      })
    );
  }, [dispatch, debouncedSearch, statusFilter, currentPage, globalPageSize, isHydrated]);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteAttendanceService(deleteId)).unwrap();
      showToast.success("Attendance record deleted successfully");
      closeModal();
      dispatch(
        fetchAttendanceListService({
          businessId: AppDefault.BUSINESS_ID,
          searchQuery: debouncedSearch || undefined,
          status: statusFilter === "ALL" ? undefined : (statusFilter as AttendanceStatusType),
          pageNo: currentPage,
          pageSize: globalPageSize,
        })
      );
    } catch (err: any) {
      showToast.error(err?.message || "Failed to delete attendance record");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetail = (item: AttendanceModel) => {
    openView(item.id);
  };

  const handleDeleteItem = (item: AttendanceModel) => {
    openDelete(item.id);
  };

  const columns = useMemo(
    () =>
      attendanceTableColumns({
        currentPage,
        pageSize: globalPageSize,
        onViewDetail: handleViewDetail,
        onDelete: handleDeleteItem,
      }),
    [currentPage, globalPageSize]
  );

  const filterConfig = useMemo(
    (): FilterPanelConfig => ({
      title: "Attendance Logs",
      searchValue: searchQuery,
      searchPlaceholder: "Search attendance records...",
      onSearchChange: (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
      },
      filters: [
        {
          id: "statusFilter",
          type: "select",
          label: "Attendance Status",
          placeholder: "All Status",
          value: statusFilter,
          onChange: (val) => {
            setStatusFilter((val || "ALL") as string);
            setCurrentPage(1);
          },
          options: [
            { value: "ALL", label: "All Status" },
            { value: "PRESENT", label: "Present" },
            { value: "LATE", label: "Late" },
            { value: "ABSENT", label: "Absent" },
            { value: "HALF_DAY", label: "Half Day" },
          ],
        },
      ],
    }),
    [searchQuery, statusFilter]
  );

  return (
    <div className="flex flex-1 flex-col gap-3 px-1 py-3">
      <div className="space-y-3">
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["statusFilter"]}
        />

        <DataTableWithPagination
          data={attendanceList}
          columns={columns}
          loading={attendanceLoading}
          emptyMessage="No attendance records found"
          getRowKey={(item) => item.id}
          currentPage={currentPage}
          totalElements={attendanceTotalItems || attendanceList.length}
          totalPages={Math.max(1, Math.ceil((attendanceTotalItems || attendanceList.length) / globalPageSize))}
          onPageChange={(page) => setCurrentPage(page)}
          pageSize={globalPageSize}
          onPageSizeChange={(size) => {
            dispatch(setGlobalPageSize(size));
            setCurrentPage(1);
          }}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <AttendanceDetailModal
        attendanceId={viewId || undefined}
        isOpen={!!viewId}
        onClose={closeModal}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={closeModal}
        onDelete={handleConfirmDelete}
        title="Delete Attendance Record"
        description="Are you sure you want to delete this attendance log?"
        itemName={deleteAttendance ? `${deleteAttendance.userInfo?.firstName || "Staff"} (${deleteAttendance.attendanceDate})` : "Attendance Log"}
        isSubmitting={isDeleting}
      />
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense>
      <AttendancePageInner />
    </Suspense>
  );
}
