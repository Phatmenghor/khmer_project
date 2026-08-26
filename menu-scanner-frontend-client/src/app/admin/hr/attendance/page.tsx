"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/utils/debounce/debounce";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";

import {
  CollapsibleFilterPanel,
  FilterPanelConfig,
} from "@/components/shared/common/collapsible-filter-panel";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { CancelButton, SubmitButton, CustomButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { SelectField } from "@/components/shared/form-field/select-field";
import { ComboboxSelectUser } from "@/components/shared/combobox/combobox_select_user";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { attendanceTableColumns } from "@/features/hr/table/attendance-table";
import { attendanceSchema, AttendanceFormValues } from "@/features/hr/store/models/schema/hr.schema";
import { showToast } from "@/components/shared/common/show-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { useHRState } from "@/features/hr/store/state/hr-state";
import {
  fetchAttendanceListService,
  checkInAttendanceService,
  deleteAttendanceService,
} from "@/features/hr/store/thunks/hr-thunks";
import { fetchAllUsersService } from "@/features/auth/store/thunks/users-thunks";
import { selectUsersContent } from "@/features/auth/store/selectors/users-selectors";
import { UserResponseModel } from "@/features/auth/store/models/response/users-response";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import {
  AttendanceModel,
  AttendanceStatusType,
} from "@/features/hr/store/models/hr-models";
import { AttendanceQrScannerModal } from "@/features/hr/components/attendance-qr-scanner-modal";
import { AttendanceDetailModal } from "@/features/hr/components/attendance-detail-modal";
import { useAdminTableUrlState } from "@/hooks/use-admin-table-url-state";
import { QrCode, ScanLine } from "lucide-react";

function AttendancePageInner() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const usersContent = useAppSelector(selectUsersContent);

  const { attendanceList, attendanceTotalItems, attendanceLoading, selectedAttendance } = useHRState();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, AppDefault.DEFAULT_DEBOUNCE_MS);

  const {
    isHydrated,
    viewId,
    deleteId,
    createMode,
    openView,
    openDelete,
    openCreate,
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

  // React Hook Form with Zod Resolver validation
  const checkInForm = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      userId: "",
      checkIn: "09:00",
      status: "PRESENT",
      notes: "",
    },
  });

  const { formState: { isSubmitting, isDirty, errors } } = checkInForm;

  // Fetch Attendance & Business Staff List
  useEffect(() => {
    if (!isHydrated) return;
    dispatch(fetchAllUsersService({ pageNo: 1, pageSize: 100 }));
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

  const onCheckInSubmit = async (data: AttendanceFormValues) => {
    try {
      await dispatch(
        checkInAttendanceService({
          userId: data.userId || undefined,
          checkInType: "CHECK_IN",
          remarks: data.notes || "On-site attendance check-in",
        })
      ).unwrap();
      showToast.success("Attendance Check-in recorded!");
      closeModal();
      checkInForm.reset();
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
      showToast.error(err?.message || "Failed to record attendance.");
    }
  };

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
      title: "Attendance Logs & Clock-Ins",
      searchValue: searchQuery,
      searchPlaceholder: "Search attendance records...",
      onSearchChange: (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
      },
      buttonText: "Clock In / Out",
      onButtonClick: openCreate,
      extraActions: (
        <div className="flex items-center gap-1.5">
          <CustomButton
            variant="outline"
            size="sm"
            className="h-9 px-3 text-xs font-bold gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => router.push(ROUTES.ADMIN.HR_ATTENDANCE_SCANNER)}
          >
            <ScanLine className="w-4 h-4" />
            <span>Scanner Station</span>
          </CustomButton>
          <CustomButton
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-xl hover:bg-muted text-muted-foreground"
            onClick={() => setIsQrScannerOpen(true)}
            title="Scan QR Code"
          >
            <QrCode className="w-4 h-4 text-primary" />
          </CustomButton>
        </div>
      ),
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
    [searchQuery, statusFilter, openCreate, router]
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

      {/* Interactive Attendance QR Scanner & Upload Modal */}
      <AttendanceQrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onSuccess={() => {
          dispatch(
            fetchAttendanceListService({
              businessId: AppDefault.BUSINESS_ID,
              searchQuery: debouncedSearch || undefined,
              status: statusFilter === "ALL" ? undefined : (statusFilter as AttendanceStatusType),
              pageNo: currentPage,
              pageSize: globalPageSize,
            })
          );
        }}
      />

      {/* URL Route Synced Clock In / Out Modal with Zod Validation */}
      <CustomModal
        isOpen={createMode}
        onClose={closeModal}
        size="xl"
      >
        <FormHeader
          title="Attendance Check-In"
          description="Record staff clock in/out"
          isCreate={true}
        />
        <form onSubmit={checkInForm.handleSubmit(onCheckInSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden" autoComplete="off">
          <FormBody>
            <Controller
              control={checkInForm.control}
              name="userId"
              render={({ field }) => {
                const selectedUser = usersContent?.find((u: any) => u.id === field.value) || null;
                return (
                  <ComboboxSelectUser
                    label="Staff Member"
                    required
                    placeholder="Select staff member..."
                    dataSelect={selectedUser as UserResponseModel}
                    onChangeSelected={(item) => field.onChange(item?.id || "")}
                    error={errors.userId?.message}
                    disabled={isSubmitting}
                  />
                );
              }}
            />
            <SelectField
              control={checkInForm.control}
              name="status"
              label="Attendance Status"
              required
              disabled={isSubmitting}
              error={errors.status}
              options={[
                { value: "PRESENT", label: "Present" },
                { value: "LATE", label: "Late" },
                { value: "ABSENT", label: "Absent" },
                { value: "HALF_DAY", label: "Half Day" },
              ]}
            />
          </FormBody>
          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isDirty || true}
            isCreate={true}
            createMessage="Recording attendance..."
          >
            <CancelButton onClick={closeModal} disabled={isSubmitting} />
            <SubmitButton
              isSubmitting={isSubmitting}
              isDirty={isDirty || true}
              isCreate={true}
              createText="Save Record"
              submittingCreateText="Saving..."
            />
          </FormFooter>
        </form>
      </CustomModal>

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
