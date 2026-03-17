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
import { ModalMode, ProductStatus, Status } from "@/constants/status/status";
import { usePagination } from "@/redux/store/use-pagination";

import { CustomSelect } from "@/components/shared/common/custom-select";
import { PRODUCT_STATUS_FILTER } from "@/constants/status/filter-status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";
import {
  resetState,
  setPageNo,
  setSearchFilter,
} from "@/redux/features/sessions/store/slice/session-slice";
import { useSessionState } from "@/redux/features/sessions/store/state/session-state";
import { SessionResponseModel } from "@/redux/features/sessions/store/models/response/session-response";
import {
  deleteSessionByIDService,
  fetchAllSessionsService,
} from "@/redux/features/sessions/store/thunks/session-thunks";
import { sessionTableColumns } from "@/redux/features/sessions/table/session-table";
import { SessionsDetailModal } from "@/redux/features/sessions/components/session-detail-modal";

export default function SessionPage() {
  // Clean up state when leaving admin area (performance optimization)
  useAdminCleanup(resetState);
  const searchParams = useSearchParams();

  // Redux state
  const {
    sessionState,
    sessionsData,
    sessionsContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useSessionState();

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    sessionId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    session: null as SessionResponseModel | null,
  });

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.USER_SESSIONS,
  });

  // Initialize URL and Redux state on mount
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;

    if (pageFromUrl !== pagination.currentPage) {
      dispatch(setPageNo(pageFromUrl));
    }
  }, [searchParams, filters.pageNo, dispatch]);

  useEffect(() => {
    dispatch(
      fetchAllSessionsService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
      }),
    );
  }, [dispatch, debouncedSearch, filters.pageNo, globalPageSize]);

  const handleSessionViewDetail = (session: SessionResponseModel) => {
    setDetailModalState({
      isOpen: true,
      sessionId: session.id || "",
    });
  };

  const handleDeleteSession = (session: SessionResponseModel) => {
    setDeleteState({
      isOpen: true,
      session: session,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleSessionViewDetail,
      handleDeleteSession,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      sessionTableColumns({
        data: sessionsData,
        handlers: tableHandlers,
      }),
    [sessionState, tableHandlers],
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
    if (!deleteState.session?.id) return;

    try {
      await dispatch(deleteSessionByIDService(deleteState.session.id)).unwrap();

      showToast.success(
        `Session "${deleteState.session.deviceDisplayName ?? ""}" deleted successfully`,
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (sessionsContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete session");
    }
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      sessionId: "",
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      session: null,
    });
  };

  console.log("### Session Page Rendered with sessions:", sessionsContent); // Debug log

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.ROOT },
            { label: "Sessions", href: "" },
          ]}
          title="Session Information"
          searchValue={filters.search}
          searchPlaceholder="Search session..."
          buttonIcon={<Plus className="w-3 h-3" />}
          onSearchChange={handleSearchChange}
        ></CardHeaderSection>

        {/* Data Table with Your Custom Pagination */}
        <DataTableWithPagination
          data={sessionsContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No session found"
          getRowKey={(session) => session.id}
          currentPage={filters.pageNo}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      {/* Modals Session Detail */}
      <SessionsDetailModal
        sessionId={detailModalState.sessionId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Delete Session */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Session"
        description={`Are you sure you want to delete this session ${
          deleteState.session?.deviceDisplayName || ""
        }?`}
        itemName={deleteState.session?.deviceDisplayName || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
