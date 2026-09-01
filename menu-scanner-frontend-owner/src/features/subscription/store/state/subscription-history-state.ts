import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectSubscriptionHistoryState,
  selectSubscriptionHistoryData,
  selectSubscriptionHistoryContent,
  selectSelectedHistory,
  selectIsLoading,
  selectError,
  selectFilters,
  selectOperations,
  selectPagination,
} from "../selectors/subscription-history-selectors";

export const useSubscriptionHistoryState = () => {
  const dispatch = useAppDispatch();

  const subscriptionHistoryState = useAppSelector(selectSubscriptionHistoryState);
  const subscriptionHistoryData = useAppSelector(selectSubscriptionHistoryData);
  const subscriptionHistoryContent = useAppSelector(selectSubscriptionHistoryContent);
  const selectedHistory = useAppSelector(selectSelectedHistory);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    subscriptionHistoryState,
    subscriptionHistoryData,
    subscriptionHistoryContent,
    selectedHistory,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
