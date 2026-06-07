"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, useState, Suspense} from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/hooks/use-pagination";
import { useWorkScheduleTypeState } from "@/features/hr/store/state/work-schedule-type-state";
import { ModalMode } from "@/constants/status/status";
import { WorkScheduleTypeResponseModel } from "@/features/hr/store/models/response/work-schedule-type-response";
import {
  resetState,
  setPageNo,
  setSearchFilter,
} from "@/features/hr/store/slice/work-schedule-type-slice";
import {
  deleteWorkScheduleTypeService,
  fetchAllWorkSchedulesTypeService,
} from "@/features/hr/store/thunks/work-schedule-type-thunks";
import { workScheduleTypeTableColumns } from "@/features/hr/table/work-schedule-type-table";
import WorkScheduleTypeModal from "@/features/hr/components/work-schedule-type-modal";
import { WorkScheduleTypeDetailModal } from "@/features/hr/components/work-schedule-type-detail-modal";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";

function WorkScheduleTypePageInner() {
  useAdminCleanup(resetState);
  const searchParams = useSearchParams();


  const {
    workScheduleTypeState,
    workScheduleTypeData,
    workScheduleTypeContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useWorkScheduleTypeState();


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
    workSchedule: null as WorkScheduleTypeResponseModel | null,
  });


  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.HR.WORK_SCHEDULE_TYPE,
  });


  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;

    if (pageFromUrl !== pagination.currentPage) {
      dispatch(setPageNo(pageFromUrl));
    }
  }, [searchParams, filters.pageNo, dispatch]);


  useEffect(() => {
    dispatch(
      fetchAllWorkSchedulesTypeService({
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

  const handleEditItem = (schedule: WorkScheduleTypeResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      id: schedule?.id || "",
    });
  };

  const handleViewDetailItem = (schedule: WorkScheduleTypeResponseModel) => {
    setDetailModalState({
      isOpen: true,
      id: schedule.id || "",
    });
  };

  const handleDeleteItem = (schedule: WorkScheduleTypeResponseModel) => {
    setDeleteState({
      isOpen: true,
      workSchedule: schedule,
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
      workScheduleTypeTableColumns({
        data: workScheduleTypeData,
        handlers: tableHandlers,
      }),
    [workScheduleTypeState, tableHandlers],
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
    if (!deleteState.workSchedule?.id) return;

    try {
      await dispatch(
        deleteWorkScheduleTypeService(deleteState.workSchedule.id),
      ).unwrap();

      showToast.success(
        `Work Schedule "${
          deleteState.workSchedule.enumName ?? ""
        }" deleted successfully`,
      );

      closeDeleteModal();


      if (workScheduleTypeContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.hr.workScheduleDeleteFailed);
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
      workSchedule: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CardHeaderSection
          title="Work Schedule Type Information"
          searchValue={filters.search}
          searchPlaceholder="Search work schedule types..."
          buttonTooltip="Create a new work schedule type"
          buttonIcon={<Plus className="w-2 h-2" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreate}
        ></CardHeaderSection>

        {}
        <DataTableWithPagination
          data={workScheduleTypeContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No work schedule types found"
          getRowKey={(workSchedule) => workSchedule.id}
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
      <WorkScheduleTypeModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        workScheduleId={modalState.id}
        mode={modalState.mode}
      />

      {}
      <WorkScheduleTypeDetailModal
        workScheduleId={detailModalState.id}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Work Schedule"
        description={`Are you sure you want to delete this work schedule ${deleteState.workSchedule?.enumName}?`}
        itemName={deleteState.workSchedule?.enumName || "this work schedule"}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}

export default function WorkScheduleTypePage() {
  return (
    <Suspense>
      <WorkScheduleTypePageInner />
    </Suspense>
  );
}
