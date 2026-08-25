"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { useActionRouting } from "@/hooks/use-action-routing";
import {
  CollapsibleFilterPanel,
  FilterPanelConfig,
} from "@/components/shared/common/collapsible-filter-panel";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { leaveTableColumns } from "@/features/hr/table/leave-table";
import { showToast } from "@/components/shared/common/show-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { useHRState } from "@/features/hr/store/state/hr-state";
import {
  fetchLeaveListService,
  approveLeaveService,
  deleteLeaveService,
} from "@/features/hr/store/thunks/hr-thunks";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import {
  LeaveModel,
  LeaveStatusType,
} from "@/features/hr/store/models/hr-models";
import { LeaveModal } from "@/features/hr/components/leave-modal";
import { LeaveDetailModal } from "@/features/hr/components/leave-detail-modal";
import { LeaveDecisionConfirmModal } from "@/features/hr/components/leave-decision-confirm-modal";

function LeavePageInner() {
  const dispatch = useAppDispatch();
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const { leaveList, leaveTotalItems, leaveLoading } = useHRState();

  // URL Route Action State Sync (?create=true, ?edit=id)
  const { createMode, editId, openCreate, openEdit, closeModal } = useActionRouting();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, AppDefault.DEFAULT_DEBOUNCE_MS);

  const [selectedLeave, setSelectedLeave] = useState<LeaveModel | null>(null);
  const [leaveToDelete, setLeaveToDelete] = useState<LeaveModel | null>(null);
  const [decisionTarget, setDecisionTarget] = useState<{
    leave: LeaveModel;
    status: "APPROVED" | "REJECTED";
  } | null>(null);

  // Sync modal state from URL search params
  useEffect(() => {
    if (editId && leaveList.length > 0) {
      const found = leaveList.find((l: LeaveModel) => l.id === editId);
      if (found) {
        setSelectedLeave(found);
      }
    }
  }, [editId, leaveList]);

  // Fetch Leave Requests directly from Backend with SQL filters
  useEffect(() => {
    dispatch(
      fetchLeaveListService({
        businessId: AppDefault.BUSINESS_ID,
        searchQuery: debouncedSearch || undefined,
        status: statusFilter === "ALL" ? undefined : (statusFilter as LeaveStatusType),
        pageNo: currentPage,
        pageSize: globalPageSize,
      })
    );
  }, [dispatch, debouncedSearch, statusFilter, currentPage, globalPageSize]);

  const handleDeleteLeave = (item: LeaveModel) => {
    setLeaveToDelete(item);
  };

  const confirmDeleteLeave = async () => {
    if (!leaveToDelete) return;
    try {
      await dispatch(deleteLeaveService(leaveToDelete.id)).unwrap();
      showToast.success("Leave application deleted successfully!");
      setLeaveToDelete(null);
      dispatch(
        fetchLeaveListService({
          businessId: AppDefault.BUSINESS_ID,
          searchQuery: debouncedSearch || undefined,
          status: statusFilter === "ALL" ? undefined : (statusFilter as LeaveStatusType),
          pageNo: currentPage,
          pageSize: globalPageSize,
        })
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete leave application";
      showToast.error(message);
    }
  };

  const handleDecisionConfirm = async (actionNote: string) => {
    if (!decisionTarget) return;
    try {
      await dispatch(
        approveLeaveService({
          id: decisionTarget.leave.id,
          status: decisionTarget.status,
          actionNote: actionNote || undefined,
        })
      ).unwrap();
      showToast.success(`Leave request ${decisionTarget.status.toLowerCase()} successfully!`);
      setDecisionTarget(null);
      dispatch(
        fetchLeaveListService({
          businessId: AppDefault.BUSINESS_ID,
          searchQuery: debouncedSearch || undefined,
          status: statusFilter === "ALL" ? undefined : (statusFilter as LeaveStatusType),
          pageNo: currentPage,
          pageSize: globalPageSize,
        })
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process leave request";
      showToast.error(message);
    }
  };

  const columns = useMemo(
    () =>
      leaveTableColumns({
        currentPage,
        pageSize: globalPageSize,
        onReview: (item) => {
          setSelectedLeave(item);
          openEdit(item.id);
        },
        onApprove: (item) => {
          setDecisionTarget({ leave: item, status: "APPROVED" });
        },
        onReject: (item) => {
          setDecisionTarget({ leave: item, status: "REJECTED" });
        },
        onDelete: handleDeleteLeave,
      }),
    [currentPage, globalPageSize, openEdit]
  );

  const filterConfig = useMemo(
    (): FilterPanelConfig => ({
      title: "Leave Request Pipeline",
      searchValue: searchQuery,
      searchPlaceholder: "Search leave applications...",
      onSearchChange: (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
      },
      buttonText: "Apply Leave",
      onButtonClick: openCreate,
      filters: [
        {
          id: "statusFilter",
          type: "select",
          label: "Application Status",
          placeholder: "All Status",
          value: statusFilter,
          onChange: (val) => {
            setStatusFilter((val || "ALL") as string);
            setCurrentPage(1);
          },
          options: [
            { value: "ALL", label: "All Status" },
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
          ],
        },
      ],
    }),
    [searchQuery, statusFilter, openCreate]
  );

  return (
    <div className="flex flex-1 flex-col gap-3 px-1 py-3">
      <div className="space-y-3">
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["statusFilter"]}
        />

        <DataTableWithPagination
          data={leaveList}
          columns={columns as TableColumn<any>[]}
          loading={leaveLoading}
          totalPages={Math.ceil((leaveTotalItems || 0) / globalPageSize) || 1}
          totalElements={leaveTotalItems}
          currentPage={currentPage}
          pageSize={globalPageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            dispatch(setGlobalPageSize(newSize));
            setCurrentPage(1);
          }}
          emptyMessage="No leave applications found matching your criteria."
        />
      </div>

      {/* URL Route Synced Apply Leave Modal */}
      <LeaveModal
        isOpen={createMode}
        onClose={closeModal}
      />

      {/* URL Route Synced Review / Details Modal */}
      <LeaveDetailModal
        isOpen={!!editId && !!selectedLeave}
        leave={selectedLeave}
        onClose={() => {
          closeModal();
          setSelectedLeave(null);
        }}
      />

      {/* Table Quick Action Decision Confirmation Modal */}
      {decisionTarget && (
        <LeaveDecisionConfirmModal
          isOpen={!!decisionTarget}
          onClose={() => setDecisionTarget(null)}
          onConfirm={handleDecisionConfirm}
          status={decisionTarget.status}
          employeeName={
            decisionTarget.leave.userInfo
              ? `${decisionTarget.leave.userInfo.firstName || ""} ${decisionTarget.leave.userInfo.lastName || ""}`.trim()
              : "Staff Member"
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!leaveToDelete}
        onClose={() => setLeaveToDelete(null)}
        onDelete={confirmDeleteLeave}
        title="Delete Leave Application"
        description="Are you sure you want to delete this leave application?"
        itemName={leaveToDelete ? `${leaveToDelete.leaveTypeEnum} (${leaveToDelete.startDate} - ${leaveToDelete.endDate})` : undefined}
        confirmButtonText="Delete Application"
      />
    </div>
  );
}

export default function LeavePage() {
  return (
    <Suspense>
      <LeavePageInner />
    </Suspense>
  );
}
