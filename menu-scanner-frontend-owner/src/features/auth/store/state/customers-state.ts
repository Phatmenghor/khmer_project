import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectCustomersFilters,
  selectCustomersIsLoading,
  selectCustomersOperations,
  selectCustomersPagination,
  selectCustomers,
  selectCustomersContent,
  selectCustomersState,
  selectCustomersError,
} from "../selectors/customers-selectors";

export const useCustomersState = () => {
  const dispatch = useAppDispatch();

  const customerState = useAppSelector(selectCustomersState);
  const customersData = useAppSelector(selectCustomers);
  const customersContent = useAppSelector(selectCustomersContent);
  const filters = useAppSelector(selectCustomersFilters);
  const operations = useAppSelector(selectCustomersOperations);
  const pagination = useAppSelector(selectCustomersPagination);
  const isLoading = useAppSelector(selectCustomersIsLoading);
  const error = useAppSelector(selectCustomersError);

  return {
    customerState,
    customersData,
    customersContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
