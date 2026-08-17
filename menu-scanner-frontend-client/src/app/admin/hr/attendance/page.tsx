"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/utils/debounce/debounce";
import { useActionRouting } from "@/hooks/use-action-routing";

import {
  CollapsibleFilterPanel,
  FilterPanelConfig,
} from "@/components/shared/common/collapsible-filter-panel";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { CancelButton, SubmitButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { ComboboxSelectUser } from "@/components/shared/combobox/combobox_select_user";
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

function AttendancePageInner() {
  const dispatch = useAppDispatch();
  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const usersContent = useAppSelector(selectUsersContent);

  const { attendanceList, attendanceTotalItems, attendanceLoading } = useHRState();

  // URL Route Action State Sync (?create=true)
  const { createMode, openCreate, closeModal } = useActionRouting();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, AppDefault.DEFAULT_DEBOUNCE_MS);

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
  }, [dispatch, debouncedSearch, statusFilter, currentPage, globalPageSize]);

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

  const handleDeleteAttendance = async (item: AttendanceModel) => {
    if (window.confirm("Delete this attendance log?")) {
      await dispatch(deleteAttendanceService(item.id));
      dispatch(
        fetchAttendanceListService({
          businessId: AppDefault.BUSINESS_ID,
          searchQuery: debouncedSearch || undefined,
          status: statusFilter === "ALL" ? undefined : (statusFilter as AttendanceStatusType),
          pageNo: currentPage,
          pageSize: globalPageSize,
        })
      );
    }
  };

  const columns = useMemo(
    () =>
      attendanceTableColumns({
        currentPage,
        pageSize: globalPageSize,
        onDelete: handleDeleteAttendance,
      }),
    [currentPage, globalPageSize, debouncedSearch, statusFilter]
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
            <TextField
              control={checkInForm.control}
              name="notes"
              label="Remarks / Notes"
              disabled={isSubmitting}
              placeholder="E.g. On-site shift check-in"
              error={errors.notes}
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
