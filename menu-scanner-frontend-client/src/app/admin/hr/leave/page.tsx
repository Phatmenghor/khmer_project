"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { useActionRouting } from "@/hooks/use-action-routing";

import {
  CollapsibleFilterPanel,
  FilterPanelConfig,
} from "@/components/shared/common/collapsible-filter-panel";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { CancelButton, CustomButton, SubmitButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { leaveTableColumns } from "@/features/hr/table/leave-table";
import { leaveSchema, LeaveFormValues } from "@/features/hr/store/models/schema/hr.schema";
import { showToast } from "@/components/shared/common/show-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { useHRState } from "@/features/hr/store/state/hr-state";
import {
  fetchLeaveListService,
  createLeaveService,
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

interface LeaveDecisionFormData {
  actionNote: string;
}

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

  // React Hook Form with Zod Resolver validation
  const leaveForm = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leaveType: "ANNUAL",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      reason: "",
    },
  });

  const decisionForm = useForm<LeaveDecisionFormData>({
    defaultValues: {
      actionNote: "",
    },
  });

  const { formState: { errors: leaveErrors, isSubmitting: isSubmittingLeave, isDirty: isDirtyLeave } } = leaveForm;
  const { formState: { isSubmitting: isSubmittingDecision, isDirty: isDirtyDecision } } = decisionForm;

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

  const selectedLeaveType = leaveForm.watch("leaveType");
  const [leaveToDelete, setLeaveToDelete] = useState<LeaveModel | null>(null);

  const onLeaveSubmit = async (data: LeaveFormValues) => {
    try {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

      const finalLeaveType = data.leaveType === "OTHER" && data.otherLeaveType?.trim()
        ? data.otherLeaveType.trim()
        : data.leaveType;

      await dispatch(
        createLeaveService({
          leaveTypeEnum: finalLeaveType,
          startDate: data.startDate,
          endDate: data.endDate,
          totalDays,
          reason: data.reason,
        })
      ).unwrap();
      showToast.success("Leave application submitted successfully!");
      closeModal();
      leaveForm.reset();
      dispatch(
        fetchLeaveListService({
          businessId: AppDefault.BUSINESS_ID,
          searchQuery: debouncedSearch || undefined,
          status: statusFilter === "ALL" ? undefined : (statusFilter as LeaveStatusType),
          pageNo: currentPage,
          pageSize: globalPageSize,
        })
      );
    } catch (err: any) {
      showToast.error(err?.message || "Failed to submit leave application.");
    }
  };

  const onDecisionSubmit = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedLeave) return;
    try {
      const note = decisionForm.getValues("actionNote");
      await dispatch(
        approveLeaveService({
          id: selectedLeave.id,
          status,
          actionNote: note,
        })
      ).unwrap();
      showToast.success(`Leave request ${status.toLowerCase()} successfully!`);
      closeModal();
      setSelectedLeave(null);
      decisionForm.reset();
      dispatch(
        fetchLeaveListService({
          businessId: AppDefault.BUSINESS_ID,
          searchQuery: debouncedSearch || undefined,
          status: statusFilter === "ALL" ? undefined : (statusFilter as LeaveStatusType),
          pageNo: currentPage,
          pageSize: globalPageSize,
        })
      );
    } catch (err: any) {
      showToast.error(err?.message || "Failed to update leave request.");
    }
  };

  const handleDeleteLeave = (item: LeaveModel) => {
    setLeaveToDelete(item);
  };

  const confirmDeleteLeave = async () => {
    if (!leaveToDelete) return;
    try {
      await dispatch(deleteLeaveService(leaveToDelete.id)).unwrap();
      showToast.success("Leave application deleted successfully!");
      dispatch(
        fetchLeaveListService({
          businessId: AppDefault.BUSINESS_ID,
          searchQuery: debouncedSearch || undefined,
          status: statusFilter === "ALL" ? undefined : (statusFilter as LeaveStatusType),
          pageNo: currentPage,
          pageSize: globalPageSize,
        })
      );
    } catch (err: any) {
      showToast.error(err?.message || "Failed to delete leave application");
      throw err;
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
        onDelete: handleDeleteLeave,
      }),
    [currentPage, globalPageSize, debouncedSearch, statusFilter, openEdit]
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
          columns={columns}
          loading={leaveLoading}
          emptyMessage="No leave applications found"
          getRowKey={(item) => item.id}
          currentPage={currentPage}
          totalElements={leaveTotalItems || leaveList.length}
          totalPages={Math.max(1, Math.ceil((leaveTotalItems || leaveList.length) / globalPageSize))}
          onPageChange={(page) => setCurrentPage(page)}
          pageSize={globalPageSize}
          onPageSizeChange={(size) => {
            dispatch(setGlobalPageSize(size));
            setCurrentPage(1);
          }}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      {/* URL Route Synced Apply Leave Modal with Zod Validation */}
      <CustomModal
        isOpen={createMode}
        onClose={closeModal}
        size="2xl"
      >
        <FormHeader
          title="Apply Leave"
          description="Submit staff leave request"
          isCreate={true}
        />
        <form onSubmit={leaveForm.handleSubmit(onLeaveSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden" autoComplete="off">
          <FormBody>
            <SelectField
              control={leaveForm.control}
              name="leaveType"
              label="Leave Type"
              required
              disabled={isSubmittingLeave}
              error={leaveErrors.leaveType}
              options={[
                { value: "ANNUAL", label: "Annual Leave" },
                { value: "SICK", label: "Sick Leave" },
                { value: "UNPAID", label: "Unpaid Leave" },
                { value: "MATERNITY", label: "Maternity / Paternity Leave" },
                { value: "SPECIAL", label: "Special Leave" },
                { value: "OTHER", label: "Other Leave (Custom)" },
              ]}
            />
            {selectedLeaveType === "OTHER" && (
              <TextField
                control={leaveForm.control}
                name="otherLeaveType"
                label="Custom Leave Type Name"
                required
                placeholder="e.g. Compassionate Leave, Emergency Leave..."
                disabled={isSubmittingLeave}
                error={leaveErrors.otherLeaveType}
              />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DateTimePickerField
                control={leaveForm.control}
                name="startDate"
                label="Start Date"
                mode="date"
                required
                disabled={isSubmittingLeave}
                error={leaveErrors.startDate}
              />
              <DateTimePickerField
                control={leaveForm.control}
                name="endDate"
                label="End Date"
                mode="date"
                required
                disabled={isSubmittingLeave}
                error={leaveErrors.endDate}
              />
            </div>
            <TextareaField
              control={leaveForm.control}
              name="reason"
              label="Reason for Leave"
              required
              disabled={isSubmittingLeave}
              placeholder="Specify the reason for leave..."
              error={leaveErrors.reason}
            />
          </FormBody>
          <FormFooter
            isSubmitting={isSubmittingLeave}
            isDirty={isDirtyLeave || true}
            isCreate={true}
            createMessage="Submitting leave..."
          >
            <CancelButton onClick={closeModal} disabled={isSubmittingLeave} />
            <SubmitButton
              isSubmitting={isSubmittingLeave}
              isDirty={isDirtyLeave || true}
              isCreate={true}
              createText="Submit Application"
              submittingCreateText="Submitting..."
            />
          </FormFooter>
        </form>
      </CustomModal>

      {/* URL Route Synced Review Leave Modal */}
      {selectedLeave && (
        <CustomModal
          isOpen={!!editId}
          onClose={() => {
            closeModal();
            setSelectedLeave(null);
          }}
          size="xl"
        >
          <FormHeader
            title="Review Leave"
            description={`Request for ${selectedLeave.userInfo?.firstName || "Staff"}`}
            isCreate={false}
          />
          <form className="flex flex-col flex-1 min-h-0 overflow-hidden" autoComplete="off">
            <FormBody>
              <div className="bg-muted/40 rounded-xl p-3 border border-border/60 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Leave Type:</span>
                  <span className="font-extrabold text-primary">{selectedLeave.leaveTypeEnum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Duration:</span>
                  <span className="font-bold text-foreground">
                    {selectedLeave.startDate} → {selectedLeave.endDate} ({selectedLeave.totalDays} days)
                  </span>
                </div>
                <div className="pt-1 border-t border-border/40">
                  <span className="text-muted-foreground font-medium block">Reason:</span>
                  <p className="text-foreground italic mt-0.5">{selectedLeave.reason}</p>
                </div>
              </div>
              <TextField
                control={decisionForm.control}
                name="actionNote"
                label="Manager Decision Note"
                disabled={isSubmittingDecision}
                placeholder="E.g. Approved based on annual leave allowance"
              />
            </FormBody>
            <FormFooter
              isSubmitting={isSubmittingDecision}
              isDirty={isDirtyDecision || true}
              isCreate={false}
            >
              <CustomButton
                variant="outline"
                type="button"
                className="h-9 rounded-xl text-xs font-bold border-red-500/40 text-red-600 hover:bg-red-500/10 cursor-pointer"
                onClick={() => onDecisionSubmit("REJECTED")}
                disabled={isSubmittingDecision}
              >
                <X className="h-3.5 w-3.5" /> Reject Request
              </CustomButton>
              <CustomButton
                type="button"
                className="h-9 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                onClick={() => onDecisionSubmit("APPROVED")}
                disabled={isSubmittingDecision}
              >
                <Check className="h-3.5 w-3.5" /> Approve Leave
              </CustomButton>
            </FormFooter>
          </form>
        </CustomModal>
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
