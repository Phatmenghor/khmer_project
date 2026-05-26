"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import {
  ModalMode,
  SubscriptionStatus,
} from "@/constants/app-resource/status/status";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { usePagination } from "@/redux/store/use-pagination";
import { showToast } from "@/components/shared/common/show-toast";
import { SUBSCRIPTION_FILTER } from "@/constants/app-resource/status/filter-status";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { useBusinessOwnerState } from "@/redux/features/auth/store/state/business-owner-state";
import { BusinessOwnerResponseModel } from "@/redux/features/auth/store/models/response/business-owner-response";
import {
  setPageNo,
  setSearchFilter,
  setSubscriptionStatusFilter,
} from "@/redux/features/auth/store/slice/business-owner-slice";
import {
  deleteBusinessOwnerService,
  fetchAllBusinessOwnerService,
} from "@/redux/features/auth/store/thunks/business-owner-thunks";
import { userBusinessOwnerTableColumns } from "@/redux/features/auth/table/business-owner-table";
import CreateBusinessOwnerModal from "@/redux/features/auth/components/create-business-owner-modal";
import { BusinessOwnerDetailModal } from "@/redux/features/auth/components/business-owner-detail-modal";

export default function BusinessOwnerPage() {
  const searchParams = useSearchParams();

  const {
    businessOwnerState,
    businessOwnerData,
    businessOwnerContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useBusinessOwnerState();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    ownerId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    owner: null as BusinessOwnerResponseModel | null,
  });


  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.BUSINESS_OWNER,
    defaultPageSize: 15,
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
      fetchAllBusinessOwnerService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        subscriptionStatuses:
          filters.subscriptionStatus === SubscriptionStatus.ALL
            ? []
            : [filters.subscriptionStatus],
      })
    );
  }, [dispatch, debouncedSearch, filters.subscriptionStatus, filters.pageNo]);

  const handleViewUserDetail = (user: BusinessOwnerResponseModel) => {
    setDetailModalState({ isOpen: true, ownerId: user.ownerId || "" });
  };

  const handleDeleteUser = (user: BusinessOwnerResponseModel) => {
    setDeleteState({ isOpen: true, owner: user });
  };

  const tableHandlers = useMemo(
    () => ({ handleViewUserDetail, handleDeleteUser }),
    []
  );

  const columns = useMemo(
    () =>
      userBusinessOwnerTableColumns({
        data: businessOwnerData,
        handlers: tableHandlers,
      }),
    [businessOwnerData, tableHandlers]
  );

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handleDelete = async () => {
    if (!deleteState.owner?.id) return;
    try {
      await dispatch(deleteBusinessOwnerService(deleteState.owner.id)).unwrap();
      showToast.success(
        `Business owner "${deleteState.owner.ownerFullName ?? ""}" deleted successfully`
      );
      setDeleteState({ isOpen: false, owner: null });
      if (businessOwnerContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete business owner");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          title="Business Owner"
          searchValue={filters.search}
          searchPlaceholder="Search business owners..."
          buttonTooltip="Create a new business owner"
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={(e) => dispatch(setSearchFilter(e.target.value))}
          openModal={() => setCreateModalOpen(true)}
        >
          <div className="flex items-center gap-3">
            <CustomSelect
              options={SUBSCRIPTION_FILTER}
              value={filters.subscriptionStatus}
              placeholder="All Status"
              onValueChange={(value) =>
                dispatch(setSubscriptionStatusFilter(value as SubscriptionStatus))
              }
              label="Subscription Status"
            />
          </div>
        </CardHeaderSection>

        <DataTableWithPagination
          data={businessOwnerContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No business owners found"
          getRowKey={(user) => user.id}
          currentPage={filters.pageNo}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
        />
      </div>

      <CreateBusinessOwnerModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <BusinessOwnerDetailModal
        businessOwnerId={detailModalState.ownerId}
        isOpen={detailModalState.isOpen}
        onClose={() => setDetailModalState({ isOpen: false, ownerId: "" })}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, owner: null })}
        onDelete={handleDelete}
        title="Delete Business Owner"
        description={`Are you sure you want to delete ${
          deleteState.owner?.ownerFullName || deleteState.owner?.ownerUserIdentifier
        }?`}
        itemName={
          deleteState.owner?.ownerFullName || deleteState.owner?.ownerUserIdentifier
        }
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
