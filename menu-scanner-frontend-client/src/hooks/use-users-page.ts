import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/utils/debounce/debounce";
import { fetchAllUsersService } from "@/redux/features/auth/store/thunks/users-thunks";
import { setPageNo } from "@/redux/features/auth/store/slice/users-slice";
import { useUsersState } from "@/redux/features/auth/store/state/users-state";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";
import { AccountStatus, UserGropeType, UserRole } from "@/constants/status/status";

export function useUsersPage() {
  const searchParams = useSearchParams();
  const { filters, pagination, dispatch } = useUsersState();
  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, 400);

  // Sync page from URL on mount
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("pageNo") ?? "1", 10);
    if (pageFromUrl !== pagination.currentPage) {
      dispatch(setPageNo(pageFromUrl));
    }
  }, [searchParams, filters.pageNo, dispatch]);

  // Fetch users whenever filters change
  useEffect(() => {
    dispatch(
      fetchAllUsersService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        roles: filters.role === UserRole.ALL ? [] : [filters.role],
        userTypes: [UserGropeType.BUSINESS_USER],
        accountStatus: filters.accountStatus === AccountStatus.ALL ? [] : [filters.accountStatus],
      }),
    );
  }, [dispatch, debouncedSearch, filters.accountStatus, filters.role, filters.pageNo, globalPageSize]);

  return { debouncedSearch, globalPageSize };
}
