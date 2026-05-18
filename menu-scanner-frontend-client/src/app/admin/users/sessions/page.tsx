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
import { ModalMode, ProductStatus, Status } from "@/constants/status/status";
import { usePagination } from "@/hooks/use-pagination";

import { CustomSelect } from "@/components/shared/common/custom-select";
import { PRODUCT_STATUS_FILTER } from "@/constants/status/filter-status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
import {
  resetState,
  setPageNo,
  setSearchFilter,
} from "@/features/sessions/store/slice/session-slice";
import { useSessionState } from "@/features/sessions/store/state/session-state";
import { SessionResponseModel } from "@/features/sessions/store/models/response/session-response";
import {
  deleteSessionByIDService,
  fetchAllSessionsService,
} from "@/features/sessions/store/thunks/session-thunks";
import { sessionTableColumns } from "@/features/sessions/table/session-table";
import { SessionsDetailModal } from "@/features/sessions/components/session-detail-modal";

export default function SessionPage() {

  useAdminCleanup(resetState);


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


  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.USER_SESSIONS,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

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


      if (sessionsContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.users.sessionDeleteFailed);
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

        {}
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

      {}
      <SessionsDetailModal
        sessionId={detailModalState.sessionId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {}
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
