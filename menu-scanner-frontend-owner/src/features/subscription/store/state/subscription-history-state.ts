import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectSubscriptionHistoryState,
  selectSubscriptionHistoryData,
  selectSubscriptionHistoryContent,
  selectSelectedHistory,
  selectMySubscriptionSummary,
  selectIsLoading,
  selectIsFetchingSummary,
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
  const mySummary = useAppSelector(selectMySubscriptionSummary);
  const isFetchingSummary = useAppSelector(selectIsFetchingSummary);
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
    mySummary,
    isFetchingSummary,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
