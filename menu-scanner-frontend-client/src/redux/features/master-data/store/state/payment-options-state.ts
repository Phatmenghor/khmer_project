import { useAppDispatch, useAppSelector } from "@/redux/store";
import { selectPaymentOptionsState } from "../selectors/payment-options-selectors";
import { PaymentOptionResponse } from "../models/response/payment-option-response";
import { PaginationResponse } from "../models/pagination-response";

export function usePaymentOptionsState() {
  const dispatch = useAppDispatch();
  const paymentOptionsState = useAppSelector(selectPaymentOptionsState);

  const paymentOptionsData = paymentOptionsState.data;
  const paymentOptionsContent =
    paymentOptionsData?.content || ([] as PaymentOptionResponse[]);

  const isLoading = {
    fetch: paymentOptionsState.isLoading,
    create: paymentOptionsState.operations.isCreating,
    update: paymentOptionsState.operations.isUpdating,
    delete: paymentOptionsState.operations.isDeleting,
    detail: paymentOptionsState.operations.isFetchingDetail,
    activate: paymentOptionsState.operations.isActivating,
    deactivate: paymentOptionsState.operations.isDeactivating,
  };

  const filters = paymentOptionsState.filters;

  const operations = paymentOptionsState.operations;

  const pagination = {
    currentPage: paymentOptionsData?.pageNo || 1,
    pageSize: paymentOptionsData?.pageSize || 10,
    totalElements: paymentOptionsData?.totalElements || 0,
    totalPages: paymentOptionsData?.totalPages || 0,
    hasNext: paymentOptionsData?.hasNext || false,
    hasPrevious: paymentOptionsData?.hasPrevious || false,
    isLast: paymentOptionsData?.last || false,
  };

  return {
    paymentOptionsState,
    paymentOptionsData,
    paymentOptionsContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  };
}
