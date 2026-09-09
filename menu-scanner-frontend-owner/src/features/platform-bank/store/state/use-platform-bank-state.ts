import { useAppDispatch, useAppSelector } from "@/store";

export const usePlatformBankState = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.platformBank);

  return {
    dispatch,
    data: state?.data || null,
    selectedBank: state?.selectedBank || null,
    publicBanks: state?.publicBanks || null,
    isFetchingPublic: state?.isFetchingPublic || false,
    isLoading: state?.isLoading ?? true,
    error: state?.error || null,
    filters: state?.filters || { search: "", status: "", pageNo: 1 },
    operations: state?.operations || {
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isFetchingDetail: false,
    },
  };
};
