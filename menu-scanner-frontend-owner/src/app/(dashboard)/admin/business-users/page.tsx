"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { AppDefault } from "@/constants/app-resource/default/default";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { AccountStatus } from "@/constants/status/status";
import {
  ModalMode,
  UserGropeType,
} from "@/constants/app-resource/status/status";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import ResetPasswordModal from "@/components/shared/modal/reset-password-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { userBusinessTableColumns } from "@/features/auth/table/users-business-table";
import { ACCOUNT_STATUS_FILTER } from "@/constants/app-resource/status/filter-status";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { CollapsibleFilterPanel } from "@/components/shared/common/collapsible-filter-panel";
import { useUsersState } from "@/features/auth/store/state/users-state";
import { usePagination } from "@/hooks/use-pagination";
import {
  deleteUserService,
  fetchAllUsersService,
  updateUserStatusSilentService,
} from "@/features/auth/store/thunks/users-thunks";
import {
  setAccountStatusFilter,
  setPageNo,
  setSearchFilter,
  updateUserDataSilently,
} from "@/features/auth/store/slice/users-slice";
import { UserResponseModel } from "@/features/auth/store/models/response/users-response";
import { UserBusinessDetailModal } from "@/features/auth/components/user-business-detail-modal";
import UserBusinessModal from "@/features/auth/components/user-business-modal";

export default function UserPage() {
  const searchParams = useSearchParams();

  const {
    userState,
    usersData,
    usersContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useUsersState();

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    userId: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    userBusinessId: "",
  });

  const [resetPasswordState, setResetPasswordState] = useState({
    isOpen: false,
    userId: "",
    userName: "",
    profileImageUrl: undefined as string | undefined,
    roles: [] as string[],
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    user: null as UserResponseModel | null,
  });

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.BUSINESS_USER,
    defaultPageSize: 10,
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
      fetchAllUsersService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        roles: [],
        userTypes: [UserGropeType.BUSINESS_USER],
        accountStatus:
          !filters.accountStatus || filters.accountStatus === AccountStatus.ALL
            ? []
            : [filters.accountStatus],
      })
    );
  }, [dispatch, debouncedSearch, filters.accountStatus, filters.pageNo, globalPageSize]);

  const handleEditUser = (user: UserResponseModel) => {
    setModalState({ isOpen: true, mode: ModalMode.UPDATE_MODE, userId: user.id || "" });
  };

  const handleViewDetail = (user: UserResponseModel) => {
    setDetailModalState({ isOpen: true, userBusinessId: user.id || "" });
  };

  const handleResetPassword = (user: UserResponseModel) => {
    setResetPasswordState({
      isOpen: true,
      userId: user.id || "",
      userName: user.userIdentifier,
      roles: user.roles,
      profileImageUrl: user.profileImage?.sm,
    });
  };

  const handleDeleteUser = (user: UserResponseModel) => {
    setDeleteState({ isOpen: true, user });
  };

  const handleToggleStatus = async (user: UserResponseModel, checked: boolean) => {
    if (!user?.id) return;
    const newStatus = checked ? "ACTIVE" : "LOCKED";

    // Optimistic store update - update Redux store immediately (NO loading)
    if (usersData) {
      const updatedData = {
        ...usersData,
        content: usersData.content.map((item: UserResponseModel) =>
          item.id === user.id ? { ...item, accountStatus: newStatus } : item
        ),
      };
      dispatch(updateUserDataSilently(updatedData));
    }

    try {
      await dispatch(
        updateUserStatusSilentService({
          userId: user.id,
          accountStatus: newStatus,
        })
      ).unwrap();
      showToast.success(`User status updated to ${newStatus}`);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update user status");
    }
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditUser,
      handleViewUserDetail: handleViewDetail,
      handleResetPassword,
      handleDeleteUser,
      handleToggleStatus,
    }),
    []
  );

  const columns = useMemo(
    () => userBusinessTableColumns({ data: usersData, handlers: tableHandlers }),
    [userState, tableHandlers]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleStatusChange = (status: AccountStatus) => {
    dispatch(setAccountStatusFilter((status || AccountStatus.ALL) as AccountStatus));
  };

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
    if (!deleteState.user?.id) return;
    try {
      await dispatch(deleteUserService(deleteState.user.id)).unwrap();
      showToast.success(
        `User "${deleteState.user.fullName ?? deleteState.user.userIdentifier ?? ""}" deleted successfully`
      );
      closeDeleteModal();
      if (usersContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to delete user"));
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: ModalMode.CREATE_MODE, userId: "" });
  };

  const closeDetailModal = () => {
    setDetailModalState({ isOpen: false, userBusinessId: "" });
  };

  const closeResetPasswordModal = () => {
    setResetPasswordState({ isOpen: false, userId: "", userName: "", profileImageUrl: undefined, roles: [] });
  };

  const closeDeleteModal = () => {
    setDeleteState({ isOpen: false, user: null });
  };

  const filterPanelConfig = useMemo(
    () => ({
      title: "Business Users",
      subtitle: "Manage business user accounts and permissions",
      totalCount: pagination.totalElements,
      searchValue: filters.search,
      onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => dispatch(setSearchFilter(e.target.value)),
      searchPlaceholder: "Search business users...",
      filters: [
        {
          id: "accountStatus",
          type: "select" as const,
          label: "Account Status",
          value: filters.accountStatus,
          onChange: (val: any) => handleStatusChange(val as AccountStatus),
          options: ACCOUNT_STATUS_FILTER,
        },
      ],
    }),
    [filters.search, filters.accountStatus, pagination.totalElements, dispatch]
  );

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <CollapsibleFilterPanel config={filterPanelConfig} />

      <DataTableWithPagination
          data={usersContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No business users found"
          getRowKey={(user) => user.id}
          currentPage={filters.pageNo}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />

      <UserBusinessModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        userId={modalState.userId}
        mode={modalState.mode}
      />

      <UserBusinessDetailModal
        userId={detailModalState.userBusinessId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      <ResetPasswordModal
        isOpen={resetPasswordState.isOpen}
        userName={resetPasswordState.userName}
        onClose={closeResetPasswordModal}
        userId={resetPasswordState.userId}
        profileImageUrl={resetPasswordState.profileImageUrl}
        userRole={resetPasswordState.roles}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete "${
          deleteState.user?.userIdentifier || deleteState.user?.email
        }"?`}
        itemName={deleteState.user?.fullName || deleteState.user?.email}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
