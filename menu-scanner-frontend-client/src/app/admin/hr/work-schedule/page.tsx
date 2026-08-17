"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/utils/debounce/debounce";
import { useActionRouting } from "@/hooks/use-action-routing";
import {
  CollapsibleFilterPanel,
  FilterPanelConfig,
} from "@/components/shared/common/collapsible-filter-panel";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import {
  workScheduleSchema,
  WorkScheduleFormValues,
} from "@/features/hr/store/models/schema/hr.schema";
import {
  WorkScheduleModel,
  DayShiftDto,
} from "@/features/hr/store/models/hr-models";
import {
  fetchWorkScheduleListService,
  fetchWorkScheduleByIdService,
  createWorkScheduleService,
  updateWorkScheduleService,
  deleteWorkScheduleService,
} from "@/features/hr/store/thunks/hr-thunks";
import { fetchAllUsersService } from "@/features/auth/store/thunks/users-thunks";
import { fetchBusinessSettingsThunk } from "@/features/business/store/thunks/business-settings-thunks";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selectors";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppDispatch, useAppSelector } from "@/store";
import { AppDefault } from "@/constants/app-resource/default/default";

import { workScheduleTableColumns } from "@/features/hr/table/work-schedule-table";
import {
  WorkScheduleModal,
  DayShiftFieldConfig,
} from "@/features/hr/components/work-schedule-modal";
import { WorkScheduleDetailModal } from "@/features/hr/components/work-schedule-detail-modal";

const BASE_WEEK_DAYS: { day: string; label: string; short: string }[] = [
  { day: "MONDAY", label: "Monday", short: "Mon" },
  { day: "TUESDAY", label: "Tuesday", short: "Tue" },
  { day: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { day: "THURSDAY", label: "Thursday", short: "Thu" },
  { day: "FRIDAY", label: "Friday", short: "Fri" },
  { day: "SATURDAY", label: "Saturday", short: "Sat" },
  { day: "SUNDAY", label: "Sunday", short: "Sun" },
];

function normalizeTimeStr(val?: string | null): string {
  if (!val || typeof val !== "string") return "";
  const trimmed = val.trim();
  if (trimmed.length >= 5) {
    return trimmed.substring(0, 5);
  }
  return trimmed;
}

function WorkSchedulePageInner() {
  const dispatch = useAppDispatch();

  const businessSettings = useAppSelector(selectBusinessSettings);
  const globalPageSizeState = useAppSelector(selectGlobalPageSize);
  const globalPageSize = typeof globalPageSizeState === "number" ? globalPageSizeState : 10;
  const { workScheduleList = [], workScheduleTotalItems = 0, workScheduleLoading = false } = useAppSelector(
    (state) => state.hr
  );

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(1);

  const [editingSchedule, setEditingSchedule] = useState<WorkScheduleModel | null>(null);
  const [viewingSchedule, setViewingSchedule] = useState<WorkScheduleModel | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [hasCustomChanges, setHasCustomChanges] = useState(false);

  const { createMode, editId, viewId, openCreate, openEdit, openView, closeModal } =
    useActionRouting();

  const scheduleForm = useForm<WorkScheduleFormValues>({
    resolver: zodResolver(workScheduleSchema),
    defaultValues: {
      name: "",
      userIds: [],
      startTime: "",
      endTime: "",
      breakStartTime: "",
      breakEndTime: "",
    },
  });

  const { formState: { isDirty } } = scheduleForm;

  const computedDaysConfig = useMemo((): DayShiftFieldConfig[] => {
    const defaultStart = normalizeTimeStr(businessSettings?.openTime) || "08:00";
    const defaultEnd = normalizeTimeStr(businessSettings?.closeTime) || "18:00";

    return BASE_WEEK_DAYS.map((d) => ({
      day: d.day as any,
      label: d.label,
      short: d.short,
      enabled: d.day !== "SUNDAY",
      startTime: defaultStart,
      endTime: defaultEnd,
      breakStartTime: "",
      breakEndTime: "",
    }));
  }, [businessSettings]);

  const [dayConfigs, setDayConfigs] = useState<DayShiftFieldConfig[]>(computedDaysConfig);

  useEffect(() => {
    if (!createMode && !editId) {
      setDayConfigs(computedDaysConfig);
    }
  }, [computedDaysConfig, createMode, editId]);

  const modalKey = editId ? `edit-${editId}` : createMode ? "create" : viewId ? `view-${viewId}` : null;
  const [activeModalKey, setActiveModalKey] = useState<string | null>(null);

  useEffect(() => {
    if (!modalKey) {
      setActiveModalKey(null);
      setEditingSchedule(null);
      setViewingSchedule(null);
      setIsFetchingDetail(false);
      return;
    }

    if (activeModalKey === modalKey) return;

    if (viewId) {
      setActiveModalKey(modalKey);
    } else if (editId) {
      setActiveModalKey(modalKey);
      setIsFetchingDetail(true);
      dispatch(fetchWorkScheduleByIdService(editId))
        .unwrap()
        .then((item: WorkScheduleModel) => {
          setEditingSchedule(item);
          const assignedDays = (item.workDays as string[]) || computedDaysConfig.filter((d) => d.enabled).map((d) => d.day);
          const dayShiftsMap = new Map<string, DayShiftDto>(
            (item.dayShifts || []).map((ds: DayShiftDto) => [ds.dayOfWeek.toUpperCase(), ds])
          );
          const hasDayShifts = item.dayShifts && item.dayShifts.length > 0;

          setDayConfigs(
            BASE_WEEK_DAYS.map((d) => {
              const existingShift = dayShiftsMap.get(d.day);
              const existingConfig = computedDaysConfig.find((c) => c.day === d.day);

              const breakStartVal = hasDayShifts
                ? normalizeTimeStr(existingShift?.breakStartTime)
                : normalizeTimeStr(item.breakStartTime);

              const breakEndVal = hasDayShifts
                ? normalizeTimeStr(existingShift?.breakEndTime)
                : normalizeTimeStr(item.breakEndTime);

              return {
                day: d.day as any,
                label: d.label,
                short: d.short,
                enabled: existingShift ? !!existingShift.enabled : assignedDays.includes(d.day),
                startTime: normalizeTimeStr(existingShift?.startTime || item.startTime || existingConfig?.startTime),
                endTime: normalizeTimeStr(existingShift?.endTime || item.endTime || existingConfig?.endTime),
                breakStartTime: breakStartVal,
                breakEndTime: breakEndVal,
              };
            })
          );
          setSelectedUserIds(item.userInfo?.id ? [item.userInfo.id] : []);
          setHasCustomChanges(false);
          scheduleForm.reset({
            name: item.name,
            userIds: item.userInfo?.id ? [item.userInfo.id] : [],
            startTime: normalizeTimeStr(item.startTime),
            endTime: normalizeTimeStr(item.endTime),
            breakStartTime: normalizeTimeStr(item.breakStartTime),
            breakEndTime: normalizeTimeStr(item.breakEndTime),
          });
        })
        .catch(() => {
          showToast.error("Failed to load schedule from API");
        })
        .finally(() => {
          setIsFetchingDetail(false);
        });
    } else if (createMode) {
      setEditingSchedule(null);
      setViewingSchedule(null);
      setIsFetchingDetail(false);
      setDayConfigs(computedDaysConfig);
      setSelectedUserIds([]);
      setHasCustomChanges(false);

      scheduleForm.reset({
        name: businessSettings?.businessName ? `${businessSettings.businessName} Shift Roster` : "",
        userIds: [],
        startTime: "",
        endTime: "",
        breakStartTime: "",
        breakEndTime: "",
      });
      setActiveModalKey(modalKey);
    }
  }, [modalKey, activeModalKey, viewId, editId, createMode, workScheduleList, computedDaysConfig, businessSettings, scheduleForm, dispatch]);

  useEffect(() => {
    dispatch(fetchAllUsersService({ pageNo: 1, pageSize: 100 }));
    dispatch(fetchBusinessSettingsThunk(AppDefault.BUSINESS_ID));
    dispatch(
      fetchWorkScheduleListService({
        businessId: AppDefault.BUSINESS_ID,
        searchQuery: debouncedSearch || undefined,
        pageNo: currentPage,
        pageSize: globalPageSize,
      })
    );
  }, [dispatch, debouncedSearch, currentPage, globalPageSize]);

  const handleUpdateDayConfig = (day: any, field: keyof DayShiftFieldConfig, value: any) => {
    setDayConfigs((prev) =>
      prev.map((item) => (item.day === day ? { ...item, [field]: value } : item))
    );
    setHasCustomChanges(true);
  };

  const onScheduleSubmit = async (data: WorkScheduleFormValues) => {
    try {
      const dayShiftsPayload: DayShiftDto[] = dayConfigs.map((d) => ({
        dayOfWeek: d.day,
        enabled: d.enabled,
        startTime: normalizeTimeStr(d.startTime),
        endTime: normalizeTimeStr(d.endTime),
        breakStartTime: normalizeTimeStr(d.breakStartTime) || undefined,
        breakEndTime: normalizeTimeStr(d.breakEndTime) || undefined,
      }));

      const targetId = editingSchedule?.id || editId;
      if (editId || editingSchedule) {
        if (!targetId || targetId === "undefined") {
          showToast.error("Invalid work schedule ID for update");
          return;
        }
        await dispatch(
          updateWorkScheduleService({
            id: targetId,
            name: data.name,
            dayShifts: dayShiftsPayload,
          })
        ).unwrap();
        showToast.success("Work schedule updated!");
      } else {
        if (selectedUserIds.length > 0) {
          await Promise.all(
            selectedUserIds.map((uId) =>
              dispatch(
                createWorkScheduleService({
                  userId: uId,
                  name: data.name,
                  dayShifts: dayShiftsPayload,
                })
              ).unwrap()
            )
          );
          showToast.success(`Work schedule assigned to ${selectedUserIds.length} staff member(s)!`);
        } else {
          await dispatch(
            createWorkScheduleService({
              name: data.name,
              dayShifts: dayShiftsPayload,
            })
          ).unwrap();
          showToast.success("Work schedule created for general shift!");
        }
      }
      setActiveModalKey(null);
      closeModal();
      setEditingSchedule(null);
      scheduleForm.reset();
      setSelectedUserIds([]);
      setHasCustomChanges(false);
      dispatch(
        fetchWorkScheduleListService({
          businessId: AppDefault.BUSINESS_ID,
          searchQuery: debouncedSearch || undefined,
          pageNo: currentPage,
          pageSize: globalPageSize,
        })
      );
    } catch (err: any) {
      showToast.error(err?.message || "Failed to save work schedule.");
    }
  };

  const handleDeleteSchedule = async (item: WorkScheduleModel) => {
    if (window.confirm("Delete this work schedule?")) {
      await dispatch(deleteWorkScheduleService(item.id));
      dispatch(
        fetchWorkScheduleListService({
          businessId: AppDefault.BUSINESS_ID,
          searchQuery: debouncedSearch || undefined,
          pageNo: currentPage,
          pageSize: globalPageSize,
        })
      );
    }
  };

  const columns = useMemo(
    () =>
      workScheduleTableColumns({
        currentPage,
        pageSize: globalPageSize,
        onView: (item) => openView(item.id),
        onEdit: (item) => openEdit(item.id),
        onDelete: handleDeleteSchedule,
      }),
    [currentPage, globalPageSize, debouncedSearch, openView, openEdit]
  );

  const filterConfig = useMemo(
    (): FilterPanelConfig => ({
      title: "Work Schedules & Shift Rosters",
      searchValue: searchQuery,
      searchPlaceholder: "Search work schedules...",
      onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
      },
      buttonText: "New Schedule",
      onButtonClick: openCreate,
      filters: [],
    }),
    [searchQuery, openCreate]
  );

  const isEditOrCreateOpen = createMode || !!editId;
  const isFormDirtyOrReady = isDirty || selectedUserIds.length > 0 || hasCustomChanges || !editingSchedule;

  return (
    <div className="flex flex-1 flex-col gap-3 px-1 py-3">
      <div className="space-y-3">
        <CollapsibleFilterPanel config={filterConfig} />

        <DataTableWithPagination
          data={workScheduleList}
          columns={columns}
          loading={workScheduleLoading}
          emptyMessage="No work schedules found"
          getRowKey={(item: WorkScheduleModel) => item.id}
          currentPage={currentPage}
          totalElements={workScheduleTotalItems || workScheduleList.length}
          totalPages={Math.max(1, Math.ceil((workScheduleTotalItems || workScheduleList.length) / globalPageSize))}
          onPageChange={(page: number) => setCurrentPage(page)}
          pageSize={globalPageSize}
          onPageSizeChange={(size: number) => {
            dispatch(setGlobalPageSize(size));
            setCurrentPage(1);
          }}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      {/* URL Router Synced Create / Edit Work Schedule Modal Component */}
      <WorkScheduleModal
        isOpen={isEditOrCreateOpen}
        isLoading={isFetchingDetail}
        onClose={() => {
          setActiveModalKey(null);
          closeModal();
        }}
        editingSchedule={editingSchedule}
        form={scheduleForm}
        selectedUserIds={selectedUserIds}
        onChangeSelectedUserIds={(ids) => {
          setSelectedUserIds(ids);
          setHasCustomChanges(true);
        }}
        dayConfigs={dayConfigs}
        onUpdateDayConfig={handleUpdateDayConfig}
        onSubmit={onScheduleSubmit}
        isFormDirtyOrReady={isFormDirtyOrReady}
      />

      {/* URL Router Synced Detail View Modal Component */}
      <WorkScheduleDetailModal
        isOpen={!!viewId}
        onClose={() => {
          setActiveModalKey(null);
          closeModal();
          setViewingSchedule(null);
        }}
        viewId={viewId}
        initialSchedule={viewingSchedule}
      />
    </div>
  );
}

export default function WorkSchedulePage() {
  return (
    <Suspense>
      <WorkSchedulePageInner />
    </Suspense>
  );
}
