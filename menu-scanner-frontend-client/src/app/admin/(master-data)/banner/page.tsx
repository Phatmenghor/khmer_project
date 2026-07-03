"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, Suspense, useRef } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { DownloadTemplateButton, ImportSpreadsheetButton } from "@/components/shared/button/custom-button";
import { downloadBannerTemplate } from "@/utils/excel/banner-excel.utils";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { useBannerState } from "@/features/master-data/store/state/banner-state";
import { ModalMode, Status } from "@/constants/status/status";
import { BannerResponseModel } from "@/features/master-data/store/models/response/banner-response";
import { usePagination } from "@/hooks/use-pagination";
import {
  setPageNo,
  setSearchFilter,
  setStatusFilter,
  resetState,
} from "@/features/master-data/store/slice/banner-slice";
import {
  deleteBannerService,
  fetchAllBannerService,
  fetchBannerByIdService,
  toggleBannerStatusService,
} from "@/features/master-data/store/thunks/banner-thunks";
import { bannerTableColumns } from "@/features/master-data/table/banner-table";
import { STATUS_FILTER } from "@/constants/status/filter-status";
import BannerModal from "@/features/master-data/components/banner-modal";
import { BannerDetailModal } from "@/features/master-data/components/banner-detail-modal";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
import { selecBannerContent, selectSelectedBanner } from "@/features/master-data/store/selectors/banner-selector";
import { useActionRouting } from "@/hooks/use-action-routing";
import { useAdminFilterUrlSync } from "@/hooks/use-admin-filter-url-sync";

function BannerPageInner() {
  useAdminCleanup(resetState);
  const isInitialMount = useRef(true);
  const router = useRouter();

  const {
    bannerState,
    bannerData,
    bannerContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useBannerState();

  const {
    viewId,
    editId,
    deleteId,
    createMode,
    openView,
    openEdit,
    openDelete,
    openCreate,
    closeModal,
  } = useActionRouting();

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, AppDefault.DEFAULT_DEBOUNCE_MS);

  const isHydrated = useAdminFilterUrlSync({
    filters: {
      search: filters.search,
      status: filters.status !== Status.ALL ? filters.status : "",
      pageNo: filters.pageNo,
      pageSize: globalPageSize !== AppDefault.PAGE_SIZE ? globalPageSize : "",
    },
    onInit: (params) => {
      if (params.search) dispatch(setSearchFilter(params.search));
      if (params.status) dispatch(setStatusFilter(params.status as Status));
      if (params.pageNo) dispatch(setPageNo(Number(params.pageNo)));
      if (params.pageSize) dispatch(setGlobalPageSize(Number(params.pageSize)));
    },
  });

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.BANNER,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    if (!isHydrated) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (bannerContent && bannerContent.length > 0) {
        return;
      }
    }

    dispatch(
      fetchAllBannerService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        status: filters.status === Status.ALL ? undefined : filters.status,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, debouncedSearch, filters.status, filters.pageNo, globalPageSize, isHydrated]);

  // ── Deep-link resolver ────────────────────────────────────────────────────
  const allBannerContent = useAppSelector(selecBannerContent);
  const selectedBanner = useAppSelector(selectSelectedBanner);

  const resolveBanner = (id: string | null): BannerResponseModel | null => {
    if (!id) return null;
    return allBannerContent.find(b => b.id === id) || (selectedBanner?.id === id ? selectedBanner : null);
  };

  const deleteBanner = resolveBanner(deleteId);

  useEffect(() => {
    if (deleteId && !deleteBanner) {
      dispatch(fetchBannerByIdService(deleteId));
    }
  }, [deleteId, deleteBanner, dispatch]);

  // ── Table action handlers ─────────────────────────────────────────────────
  const handleCreateBanner = () => openCreate();
  const handleEditBanner = (banner: BannerResponseModel) => openEdit(banner.id || "");
  const handleBannerViewDetail = (banner: BannerResponseModel) => openView(banner.id || "");
  const handleDeleteBanner = (banner: BannerResponseModel) => openDelete(banner.id || "");

  const handleToggleBannerStatus = async (banner: BannerResponseModel) => {
    if (!banner?.id) return;
    try {
      await dispatch(toggleBannerStatusService(banner)).unwrap();
      showToast.success(Messages.banner.statusUpdated);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.banner.statusUpdateFailed);
    }
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditBanner,
      handleBannerViewDetail,
      handleDeleteBanner,
      handleToggleBannerStatus,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      bannerTableColumns({
        data: bannerData,
        handlers: tableHandlers,
      }),
    [bannerState, tableHandlers],
  );

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const handleOpenImport = () => {
    router.push(ROUTES.ADMIN.BANNER_IMPORT);
  };

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Banner Information",
    searchValue: filters.search,
    searchPlaceholder: "Search banner...",
    onSearchChange: (e) => dispatch(setSearchFilter(e.target.value)),
    buttonText: "New",
    buttonTooltip: "Create a new banner",
    onButtonClick: handleCreateBanner,
    extraActions: (
      <div className="flex items-center gap-1">
        <DownloadTemplateButton onDownload={downloadBannerTemplate} />
        <ImportSpreadsheetButton onClick={handleOpenImport} title="Import banners from Excel" />
      </div>
    ),
    filters: [
      {
        id: "status",
        type: "select",
        label: "Banner Status",
        placeholder: "All Status",
        value: filters.status,
        onChange: (value) => dispatch(setStatusFilter(value as Status)),
        options: STATUS_FILTER,
      },
    ],
  }), [filters.search, filters.status]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteBannerService(deleteId)).unwrap();
      showToast.success(Messages.banner.deleted);
      closeModal();
      if (bannerContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.users.deleteFailed);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel config={filterConfig} essentialFilterIds={["status"]} />

        <DataTableWithPagination
          data={bannerContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No banners found"
          getRowKey={(banner) => banner.id}
          currentPage={filters.pageNo}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <BannerModal
        isOpen={createMode || !!editId}
        onClose={closeModal}
        bannerId={editId || undefined}
        mode={createMode ? ModalMode.CREATE_MODE : ModalMode.UPDATE_MODE}
      />

      <BannerDetailModal
        bannerId={viewId || undefined}
        isOpen={!!viewId}
        onClose={closeModal}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={closeModal}
        onDelete={handleDelete}
        title="Delete Banner"
        description="Are you sure you want to delete this banner?"
        itemName={deleteBanner?.description || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}

export default function BannerPage() {
  return (
    <Suspense>
      <BannerPageInner />
    </Suspense>
  );
}
