import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectOrderStatus,
  selectOrderStatusContent,
  selectOrderStatusState,
  selectPagination,
} from "../selectors/order-status-selector";

export const useOrderStatusState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const orderStatusState = useAppSelector(selectOrderStatusState);
  const orderStatusData = useAppSelector(selectOrderStatus);
  const orderStatusContent = useAppSelector(selectOrderStatusContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    orderStatusState,
    orderStatusData,
    orderStatusContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
