import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectOrderAdminContent,
  selectOrderAdminData,
  selectOrderAdminError,
  selectOrderAdminFilters,
  selectOrderAdminIsLoading,
  selectOrderAdminOperations,
  selectOrderAdminPagination,
  selectOrderAdminState,
} from "../selectors/order-admin-selector";

export const useOrderAdminState = () => {
  const dispatch = useAppDispatch();

  const orderState = useAppSelector(selectOrderAdminState);
  const orderData = useAppSelector(selectOrderAdminData);
  const orderContent = useAppSelector(selectOrderAdminContent);
  const filters = useAppSelector(selectOrderAdminFilters);
  const operations = useAppSelector(selectOrderAdminOperations);
  const pagination = useAppSelector(selectOrderAdminPagination);
  const isLoading = useAppSelector(selectOrderAdminIsLoading);
  const error = useAppSelector(selectOrderAdminError);

  return {
    orderState,
    orderData,
    orderContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
