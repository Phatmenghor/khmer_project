"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, useState, Suspense} from "react";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, Status } from "@/constants/status/status";
import { usePagination } from "@/hooks/use-pagination";
import { STATUS_FILTER } from "@/constants/status/filter-status";
import { useBrandState } from "@/features/master-data/store/state/brand-state";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import {
  setPageNo,
  setSearchFilter,
  setStatusFilter,
  resetState,
} from "@/features/master-data/store/slice/brand-slice";
import {
  deleteBrandService,
  fetchAllBrandWithProductCountService,
  toggleBrandStatusService,
} from "@/features/master-data/store/thunks/brand-thunks";
import { brandTableColumns } from "@/features/master-data/table/brand-table";
import BrandModal from "@/features/master-data/components/brand-modal";
import { BrandDetailModal } from "@/features/master-data/components/brand-detail-modal";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";

function BrandPageInner() {
  useAdminCleanup(resetState);

  const {
    brandState,
    brandData,
    brandContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useBrandState();

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    brand: null as BrandResponseModel | null,
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    brand: null as BrandResponseModel | null,
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    brand: null as BrandResponseModel | null,
  });

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.BRAND,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    dispatch(
      fetchAllBrandWithProductCountService({
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


  const handleCreateBrand = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      brand: null,
    });
  };

  const handleEditBrand = (brand: BrandResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      brand: brand,
    });
  };

  const handleBrandViewDetail = (brand: BrandResponseModel) => {
    setDetailModalState({
      isOpen: true,
      brand: brand,
    });
  };

  const handleDeleteBrand = (brand: BrandResponseModel) => {
    setDeleteState({
      isOpen: true,
      brand: brand,
    });
  };

  const handleToggleBrandStatus = async (brand: BrandResponseModel) => {
    if (!brand?.id) return;
    try {
      const newStatus = brand.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await dispatch(
        toggleBrandStatusService({
          brandId: brand.id,
          brandData: { ...brand, status: newStatus },
        })
      ).unwrap();
      showToast.success(Messages.brand.statusUpdated);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.brand.statusUpdateFailed);
    }
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditBrand,
      handleBrandViewDetail,
      handleDeleteBrand,
      handleToggleBrandStatus,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      brandTableColumns({
        data: brandData,
        handlers: tableHandlers,
      }),
    [brandState, tableHandlers],
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
    if (!deleteState.brand?.id) return;

    try {
      await dispatch(deleteBrandService(deleteState.brand.id)).unwrap();

      showToast.success(
        `Brand "${deleteState.brand.businessName ?? ""}" deleted successfully`,
      );

      closeDeleteModal();


      if (brandContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.brand.deleteFailed);
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      brand: null,
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      brand: null,
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      brand: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CardHeaderSection
          title="Brand Information"
          searchValue={filters.search}
          searchPlaceholder="Search brand..."
          buttonTooltip="Create a new brand"
          buttonIcon={<Plus className="w-2 h-2" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreateBrand}
        >
          <div className="flex flex-wrap items-center gap-1">
            <CustomSelect
              options={STATUS_FILTER}
              value={filters.status}
              placeholder="All Status"
              onValueChange={(value) => handleStatusChange(value as Status)}
              label="Brand Status"
            />
          </div>
        </CardHeaderSection>

        {}
        <DataTableWithPagination
          data={brandContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No brand found"
          getRowKey={(brand) => brand.id}
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
      <BrandModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        brand={modalState.brand}
        mode={modalState.mode}
      />

      {}
      <BrandDetailModal
        brand={detailModalState.brand}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Brand"
        description={`Are you sure you want to delete this brand ${
          deleteState.brand?.name || ""
        }?`}
        itemName={deleteState.brand?.name || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}

export default function BrandPage() {
  return (
    <Suspense>
      <BrandPageInner />
    </Suspense>
  );
}
