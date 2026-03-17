import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selecDeliveryOptionsContent,
  selectDeliveryOptions,
  selectDeliveryOptionsState,
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
} from "../selectors/delivery-options-selector";

export const useDeliveryOptionsState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const deliveryOptionsState = useAppSelector(selectDeliveryOptionsState);
  const deliveryOptionsData = useAppSelector(selectDeliveryOptions);
  const deliveryOptionsContent = useAppSelector(selecDeliveryOptionsContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    deliveryOptionsState,
    deliveryOptionsData,
    deliveryOptionsContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
