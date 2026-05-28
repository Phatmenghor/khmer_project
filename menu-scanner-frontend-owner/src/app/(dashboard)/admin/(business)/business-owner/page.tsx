"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { AppDefault } from "@/constants/app-resource/default/default";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import {
  ModalMode,
  Status,
  SubscriptionStatus,
} from "@/constants/app-resource/status/status";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { usePagination } from "@/redux/store/use-pagination";
import { showToast } from "@/components/shared/common/show-toast";
import {
  AUTO_RENEW_FILTER,
  SUBSCRIPTION_FILTER,
} from "@/constants/app-resource/status/filter-status";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { useBusinessOwnerState } from "@/redux/features/auth/store/state/business-owner-state";
import { BusinessOwnerResponseModel } from "@/redux/features/auth/store/models/response/business-owner-response";
import {
  setAutoRenewFilter,
  setPageNo,
  setSearchFilter,
  setSubscriptionStatusFilter,
} from "@/redux/features/auth/store/slice/business-owner-slice";
import {
  deleteBusinessOwnerService,
  fetchAllBusinessOwnerService,
  updateBusinessOwnerService,
} from "@/redux/features/auth/store/thunks/business-owner-thunks";
import { userBusinessOwnerTableColumns } from "@/redux/features/auth/table/business-owner-table";
import CreateBusinessOwnerModal from "@/redux/features/auth/components/create-business-owner-modal";
import { BusinessOwnerDetailModal } from "@/redux/features/auth/components/business-owner-detail-modal";
import UpdateBusinessOwnerModal from "@/redux/features/auth/components/update-business-owner-modal";
import ResetPasswordModal from "@/components/shared/modal/reset-password-modal";

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

  const [editModalState, setEditModalState] = useState({
    isOpen: false,
    ownerId: "",
  });

  const [resetPasswordState, setResetPasswordState] = useState({
    isOpen: false,
    userId: "",
    userName: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    owner: null as BusinessOwnerResponseModel | null,
  });

  const globalPageSize = useAppSelector(selectGlobalPageSize);
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
        pageSize: globalPageSize,
        subscriptionStatuses:
          filters.subscriptionStatus === SubscriptionStatus.ALL
            ? []
            : [filters.subscriptionStatus],
        autoRenew:
          filters.autoRenew === Status.ACTIVE
            ? true
            : filters.autoRenew === Status.INACTIVE
            ? false
            : undefined,
      })
    );
  }, [dispatch, debouncedSearch, filters.subscriptionStatus, filters.autoRenew, filters.pageNo, globalPageSize]);

  const handleViewUserDetail = (user: BusinessOwnerResponseModel) => {
    setDetailModalState({ isOpen: true, ownerId: user.ownerId || "" });
  };

  const handleEditOwner = (user: BusinessOwnerResponseModel) => {
    setEditModalState({ isOpen: true, ownerId: user.ownerId || "" });
  };

  const handleResetPassword = (user: BusinessOwnerResponseModel) => {
    setResetPasswordState({
      isOpen: true,
      userId: user.ownerId,
      userName: user.ownerFullName || user.ownerUserIdentifier,
    });
  };

  const handleDeleteUser = (user: BusinessOwnerResponseModel) => {
    setDeleteState({ isOpen: true, owner: user });
  };

  const handleToggleAutoRenew = async (user: BusinessOwnerResponseModel, checked: boolean) => {
    try {
      await dispatch(
        updateBusinessOwnerService({ ownerId: user.ownerId, data: { autoRenew: checked } })
      ).unwrap();
      showToast.success(`Auto renew ${checked ? "enabled" : "disabled"} for ${user.businessName || user.ownerFullName}`);
    } catch (error: any) {
      showToast.error(error || "Failed to update auto renew");
    }
  };

  const tableHandlers = useMemo(
    () => ({ handleViewUserDetail, handleEditOwner, handleResetPassword, handleDeleteUser, handleToggleAutoRenew }),
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

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
    updateUrlWithPage(1);
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
              label="Subscription"
            />
            <CustomSelect
              options={AUTO_RENEW_FILTER}
              value={filters.autoRenew}
              placeholder="All"
              onValueChange={(value) => dispatch(setAutoRenewFilter(value))}
              label="Auto Renew"
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
          totalElements={pagination.totalElements}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <CreateBusinessOwnerModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <UpdateBusinessOwnerModal
        isOpen={editModalState.isOpen}
        ownerId={editModalState.ownerId}
        onClose={() => setEditModalState({ isOpen: false, ownerId: "" })}
      />

      <BusinessOwnerDetailModal
        businessOwnerId={detailModalState.ownerId}
        isOpen={detailModalState.isOpen}
        onClose={() => setDetailModalState({ isOpen: false, ownerId: "" })}
      />

      <ResetPasswordModal
        isOpen={resetPasswordState.isOpen}
        onClose={() => setResetPasswordState({ isOpen: false, userId: "", userName: "" })}
        userId={resetPasswordState.userId}
        userName={resetPasswordState.userName}
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
