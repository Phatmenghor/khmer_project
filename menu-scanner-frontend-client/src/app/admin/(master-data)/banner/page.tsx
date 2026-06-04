"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
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

export default function BannerPage() {

  useAdminCleanup(resetState);


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


  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    banner: null as BannerResponseModel | null,
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    banner: null as BannerResponseModel | null,
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    banner: null as BannerResponseModel | null,
  });


  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.BANNER,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    dispatch(
      fetchAllBannerService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        status: filters.status == Status.ALL ? undefined : filters.status,
      }),
    );
  }, [
    dispatch,
    debouncedSearch,
    filters.status,
    filters.pageNo,
    globalPageSize,
  ]);


  const handleCreateBanner = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      banner: null,
    });
  };

  const handleEditBanner = (banner: BannerResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      banner: banner,
    });
  };

  const handleBannerViewDetail = (banner: BannerResponseModel) => {
    setDetailModalState({
      isOpen: true,
      banner: banner,
    });
  };

  const handleDeleteBanner = (banner: BannerResponseModel) => {
    setDeleteState({
      isOpen: true,
      banner: banner,
    });
  };

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleStatusChange = (status: Status) => {
    dispatch(setStatusFilter(status));
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
    if (!deleteState.banner?.id) return;

    try {
      await dispatch(deleteBannerService(deleteState.banner.id)).unwrap();

      showToast.success(Messages.banner.deleted);

      closeDeleteModal();


      if (bannerContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.users.deleteFailed);
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      banner: null,
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      banner: null,
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      banner: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1.5">
      <div className="space-y-3">
        <CardHeaderSection
          title="Banner Information"
          searchValue={filters.search}
          searchPlaceholder="Search banner..."
          buttonTooltip="Create a new banner"
          buttonIcon={<Plus className="w-2 h-2" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreateBanner}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <CustomSelect
              options={STATUS_FILTER}
              value={filters.status}
              placeholder="All Status"
              onValueChange={(value) => handleStatusChange(value as Status)}
              label="Banner Status"
            />
          </div>
        </CardHeaderSection>

        {}
        <DataTableWithPagination
          data={bannerContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No banners found"
          getRowKey={(user) => user.id}
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
      <BannerModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        banner={modalState.banner}
        mode={modalState.mode}
      />

      {}
      <BannerDetailModal
        banner={detailModalState.banner}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Banner"
        description="Are you sure you want to delete this banner?"
        itemName=""
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
