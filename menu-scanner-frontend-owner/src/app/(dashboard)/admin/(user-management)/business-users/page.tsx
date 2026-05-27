"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import {
  AccountStatus,
  UserGropeType,
} from "@/constants/app-resource/status/status";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import ResetPasswordModal from "@/components/shared/modal/reset-password-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { userBusinessTableColumns } from "@/redux/features/auth/table/users-business-table";
import { ACCOUNT_STATUS_FILTER } from "@/constants/app-resource/status/filter-status";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { useUsersState } from "@/redux/features/auth/store/state/users-state";
import { usePagination } from "@/redux/store/use-pagination";
import {
  deleteUserService,
  fetchAllUsersService,
} from "@/redux/features/auth/store/thunks/users-thunks";
import {
  setAccountStatusFilter,
  setPageNo,
  setSearchFilter,
} from "@/redux/features/auth/store/slice/users-slice";
import { UserResponseModel } from "@/redux/features/auth/store/models/response/users-response";
import { UserBusinessDetailModal } from "@/redux/features/auth/components/user-business-detail-modal";

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
        roles: [],
        userTypes: [UserGropeType.BUSINESS_USER],
        accountStatus:
          filters.accountStatus === AccountStatus.ALL
            ? []
            : [filters.accountStatus],
      })
    );
  }, [dispatch, debouncedSearch, filters.accountStatus, filters.pageNo]);

  const handleViewDetail = (user: UserResponseModel) => {
    setDetailModalState({ isOpen: true, userBusinessId: user.id || "" });
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
    setDeleteState({ isOpen: true, user });
  };

  const tableHandlers = useMemo(
    () => ({
      handleViewUserDetail: handleViewDetail,
      handleResetPassword,
      handleDeleteUser,
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
    dispatch(setAccountStatusFilter(status));
  };

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
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
    } catch (error: any) {
      showToast.error(error || "Failed to delete user");
    }
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

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.DASHBOARD.INDEX },
            { label: "Business Users", href: "" },
          ]}
          title="Business Users"
          searchValue={filters.search}
          searchPlaceholder="Search business users..."
          onSearchChange={handleSearchChange}
        >
          <div className="flex items-center gap-3">
            <CustomSelect
              options={ACCOUNT_STATUS_FILTER}
              value={filters.accountStatus}
              placeholder="All Status"
              onValueChange={(value) =>
                handleStatusChange(value as AccountStatus)
              }
              label="Account Status"
            />
          </div>
        </CardHeaderSection>

        <DataTableWithPagination
          data={usersContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No business users found"
          getRowKey={(user) => user.id}
          currentPage={filters.pageNo}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
        />
      </div>

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
