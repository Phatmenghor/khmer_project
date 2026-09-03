"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { AppDefault } from "@/constants/app-resource/default/default";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import {
  ModalMode,
  Status,
  SubscriptionStatus,
  UserGropeType,
  UserRole,
} from "@/constants/app-resource/status/status";
import { CollapsibleFilterPanel } from "@/components/shared/common/collapsible-filter-panel";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { usePagination } from "@/hooks/use-pagination";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import {
  AUTO_RENEW_FILTER,
  SUBSCRIPTION_FILTER,
} from "@/constants/app-resource/status/filter-status";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { useBusinessOwnerState } from "@/features/auth/store/state/business-owner-state";
import { BusinessOwnerResponseModel } from "@/features/auth/store/models/response/business-owner-response";
import {
  setAutoRenewFilter,
  setPageNo,
  setSearchFilter,
  setSubscriptionStatusFilter,
  updateBusinessOwnerDataSilently,
} from "@/features/auth/store/slice/business-owner-slice";
import {
  deleteBusinessOwnerService,
  fetchAllBusinessOwnerService,
  updateBusinessOwnerAutoRenewService,
  updateBusinessOwnerService,
} from "@/features/auth/store/thunks/business-owner-thunks";
import { userBusinessOwnerTableColumns } from "@/features/auth/table/business-owner-table";
import CreateBusinessOwnerModal from "@/features/auth/components/create-business-owner-modal";
import { BusinessOwnerDetailModal } from "@/features/auth/components/business-owner-detail-modal";
import UpdateBusinessOwnerModal from "@/features/auth/components/update-business-owner-modal";
import ResetPasswordModal from "@/components/shared/modal/reset-password-modal";
import SubscriptionActionModal from "@/features/auth/components/subscription-action-modal";

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

  const [subscriptionActionState, setSubscriptionActionState] = useState({
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

  // Initial fetch on filter/page change
  useEffect(() => {
    dispatch(
      fetchAllBusinessOwnerService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        userType: UserGropeType.BUSINESS_USER,
        userTypes: [UserGropeType.BUSINESS_USER],
        userGroupType: UserGropeType.BUSINESS_USER,
        userGroupTypes: [UserGropeType.BUSINESS_USER],
        userGropeType: UserGropeType.BUSINESS_USER,
        userGropeTypes: [UserGropeType.BUSINESS_USER],
        role: UserRole.BUSINESS_OWNER,
        roles: [UserRole.BUSINESS_OWNER],
        includeAll: true,
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

  const filteredBusinessOwners = useMemo(() => {
    if (!businessOwnerContent) return [];
    return businessOwnerContent.filter((owner: any) => {
      const rolesList = owner.roles || owner.ownerRoles || (owner.role ? [owner.role] : null);
      if (rolesList && Array.isArray(rolesList) && rolesList.length > 0) {
        const hasOwnerRole = rolesList.some((r: string) => r.toUpperCase().includes("OWNER"));
        if (!hasOwnerRole) return false;
      }
      const uType = owner.userType || owner.userGropeType || owner.userGroupType;
      if (uType && uType !== "BUSINESS_USER") {
        return false;
      }
      return true;
    });
  }, [businessOwnerContent]);


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

  const handleSubscriptionAction = (user: BusinessOwnerResponseModel) => {
    setSubscriptionActionState({ isOpen: true, owner: user });
  };

  const handleToggleAutoRenew = async (user: BusinessOwnerResponseModel, checked: boolean) => {
    try {
      if (businessOwnerData) {
        const updatedData = {
          ...businessOwnerData,
          content: businessOwnerData.content.map((owner: BusinessOwnerResponseModel) =>
            owner.ownerId === user.ownerId ? { ...owner, autoRenew: checked } : owner
          ),
        };
        dispatch(updateBusinessOwnerDataSilently(updatedData));
      }

      await dispatch(
        updateBusinessOwnerAutoRenewService({
          ownerId: user.ownerId,
          autoRenew: checked,
        })
      ).unwrap();

      showToast.success(`Auto renew ${checked ? "enabled" : "disabled"}`);
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to update auto renew"));
    }
  };

  const tableHandlers = useMemo(
    () => ({ handleViewUserDetail, handleEditOwner, handleResetPassword, handleDeleteUser, handleToggleAutoRenew, handleSubscriptionAction }),
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
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to delete business owner"));
    }
  };

  const filterPanelConfig = useMemo(
    () => ({
      title: "Business Owner",
      subtitle: "Manage business owners, accounts and subscriptions",
      totalCount: pagination.totalElements,
      buttonText: "New",
      buttonTooltip: "Create a new business owner",
      onButtonClick: () => setCreateModalOpen(true),
      searchValue: filters.search,
      onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => dispatch(setSearchFilter(e.target.value)),
      searchPlaceholder: "Search business owners...",
      filters: [
        {
          id: "subscriptionStatus",
          type: "select" as const,
          label: "Subscription",
          value: filters.subscriptionStatus,
          onChange: (val: any) => dispatch(setSubscriptionStatusFilter(val as SubscriptionStatus)),
          options: SUBSCRIPTION_FILTER,
        },
        {
          id: "autoRenew",
          type: "select" as const,
          label: "Auto Renew",
          value: filters.autoRenew,
          onChange: (val: any) => dispatch(setAutoRenewFilter(val)),
          options: AUTO_RENEW_FILTER,
        },
      ],
    }),
    [filters.search, filters.subscriptionStatus, filters.autoRenew, pagination.totalElements, dispatch]
  );

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <CollapsibleFilterPanel config={filterPanelConfig} />

        <DataTableWithPagination
          data={filteredBusinessOwners}
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

      <SubscriptionActionModal
        owner={subscriptionActionState.owner}
        isOpen={subscriptionActionState.isOpen}
        onClose={() => setSubscriptionActionState({ isOpen: false, owner: null })}
        onSuccess={() => dispatch(fetchAllBusinessOwnerService({
          search: debouncedSearch,
          pageNo: filters.pageNo,
          pageSize: globalPageSize,
          userType: UserGropeType.BUSINESS_USER,
          userTypes: [UserGropeType.BUSINESS_USER],
          role: UserRole.BUSINESS_OWNER,
          roles: [UserRole.BUSINESS_OWNER],
          subscriptionStatuses: filters.subscriptionStatus === SubscriptionStatus.ALL ? [] : [filters.subscriptionStatus],
          autoRenew: filters.autoRenew === Status.ACTIVE ? true : filters.autoRenew === Status.INACTIVE ? false : undefined,
        }))}
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
