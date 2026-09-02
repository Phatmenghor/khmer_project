"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { AccountStatus } from "@/constants/status/status";
import {
  ModalMode,
  UserRole,
  UserGropeType,
} from "@/constants/app-resource/status/status";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import ResetPasswordModal from "@/components/shared/modal/reset-password-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { userPlatformTableColumns } from "@/features/auth/table/users-platform-table";
import {
  ACCOUNT_STATUS_FILTER,
} from "@/constants/app-resource/status/filter-status";
import { fetchAllRolesListService } from "@/features/auth/store/thunks/role-thunks";
import { selectRolesList } from "@/features/auth/store/selectors/role-selectors";
import { convertEnumOrString } from "@/utils/common/enum-convert";
import { useAppSelector } from "@/store";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { AppDefault } from "@/constants/app-resource/default/default";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { buildRoleFilterOptions } from "@/utils/filter/role-filter-options";
import { CollapsibleFilterPanel } from "@/components/shared/common/collapsible-filter-panel";
import { showToast } from "@/components/shared/common/show-toast";
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
  setRoleFilter,
  setSearchFilter,
  updateUserDataSilently,
} from "@/features/auth/store/slice/users-slice";
import UserPlatformModal from "@/features/auth/components/user-platform-modal";
import { UserPlatformDetailModal } from "@/features/auth/components/user-platform-detail-modal";
import { UserResponseModel } from "@/features/auth/store/models/response/users-response";

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

  const rolesList = useAppSelector(selectRolesList);
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const roleFilterOptions = useMemo(() => buildRoleFilterOptions(rolesList), [rolesList]);

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    userId: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    userId: "",
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

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.USERS,
    defaultPageSize: 15,
  });

  useEffect(() => {
    dispatch(
      fetchAllRolesListService({
        includeAll: true,
        userTypes: [UserGropeType.PLATFORM_USER],
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;
    if (pageFromUrl !== pagination.currentPage) {
      dispatch(setPageNo(pageFromUrl));
    }
  }, [searchParams, filters.pageNo, dispatch]);

  // Fetch users when filters change
  useEffect(() => {
    dispatch(
      fetchAllUsersService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        roles: filters.role === UserRole.ALL ? [] : [filters.role],
        userTypes: [UserGropeType.PLATFORM_USER],
        includeAll: true,
        accountStatus:
          filters.accountStatus === AccountStatus.ALL
            ? []
            : [filters.accountStatus],
      })
    );
  }, [
    dispatch,
    debouncedSearch,
    filters.accountStatus,
    filters.role,
    filters.pageNo,
    globalPageSize,
  ]);

  // Event handlers
  const handleCreateUser = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      userId: "",
    });
  };

  const handleEditUser = (user: UserResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      userId: user?.id || "",
    });
  };

  const handleViewDetail = (user: UserResponseModel) => {
    setDetailModalState({
      isOpen: true,
      userId: user.id || "",
    });
  };

  const handleResetPassword = (user: UserResponseModel) => {
    setResetPasswordState({
      isOpen: true,
      userId: user.id || "",
      userName: user.userIdentifier || "",
      profileImageUrl: user.profileImageUrl || undefined,
      roles: user.roles || [],
    });
  };

  const handleDeleteUser = (user: UserResponseModel) => {
    setDeleteState({
      isOpen: true,
      user: user,
    });
  };

  const handleToggleStatus = async (user: UserResponseModel, checked: boolean) => {
    if (!user?.id) return;
    const newStatus = checked ? "ACTIVE" : "LOCKED";

    // Optimistic store update - update Redux store immediately (NO loading state)
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
    () =>
      userPlatformTableColumns({
        data: usersData,
        handlers: tableHandlers,
      }),
    [userState, tableHandlers]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleStatusChange = (status: AccountStatus) => {
    dispatch(setAccountStatusFilter(status));
  };

  const handleRoleChange = (role: UserRole) => {
    dispatch(setRoleFilter(role));
  };

  const handlePageChangeWrapper = (page: number) => {
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
        `User "${deleteState.user.fullName ?? ""}" deleted successfully`
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (usersContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete user");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      userId: "",
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      userId: "",
    });
  };

  const closeResetPasswordModal = () => {
    setResetPasswordState({
      isOpen: false,
      userId: "",
      userName: "",
      profileImageUrl: undefined,
      roles: [],
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      user: null,
    });
  };

  const filterPanelConfig = useMemo(
    () => ({
      title: "Platform Users",
      subtitle: "Manage platform administrative users and roles",
      totalCount: pagination.totalElements,
      buttonText: "New",
      buttonTooltip: "Create a new platform user",
      onButtonClick: handleCreateUser,
      searchValue: filters.search,
      onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => dispatch(setSearchFilter(e.target.value)),
      searchPlaceholder: "Search users platform...",
      filters: [
        {
          id: "accountStatus",
          type: "select" as const,
          label: "Account Status",
          value: filters.accountStatus,
          onChange: (val: any) => handleStatusChange(val as AccountStatus),
          options: ACCOUNT_STATUS_FILTER,
        },
        {
          id: "role",
          type: "select" as const,
          label: "Platform Role",
          value: filters.role,
          onChange: (val: any) => handleRoleChange(val as UserRole),
          options: roleFilterOptions,
        },
      ],
    }),
    [filters.search, filters.accountStatus, filters.role, roleFilterOptions, pagination.totalElements, dispatch]
  );

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <CollapsibleFilterPanel config={filterPanelConfig} />

        {/* Data Table with Your Custom Pagination */}
        <DataTableWithPagination
          data={usersContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No users platform found"
          getRowKey={(user) => user.id}
          currentPage={filters.pageNo}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />

      {/* Modals Add/Edit */}
      <UserPlatformModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        userId={modalState.userId}
        mode={modalState.mode}
      />

      {/* Modals User platform Detail */}
      <UserPlatformDetailModal
        userId={detailModalState.userId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Reset Password */}
      <ResetPasswordModal
        isOpen={resetPasswordState.isOpen}
        userName={resetPasswordState.userName}
        onClose={closeResetPasswordModal}
        userId={resetPasswordState.userId}
        profileImageUrl={resetPasswordState.profileImageUrl}
        userRole={resetPasswordState.roles}
      />

      {/* Modals Delete User platform */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete this platform user ${
          deleteState.user?.userIdentifier || deleteState.user?.email
        }?`}
        itemName={deleteState.user?.fullName || deleteState.user?.email}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
