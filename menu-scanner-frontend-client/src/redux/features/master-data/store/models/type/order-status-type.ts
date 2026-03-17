import {
  AllOrderStatusResponseModel,
  OrderStatusResponseModel,
} from "../response/order-status-response";

export interface OrderStatusFilters {
  search: string;
  pageNo: number;
  status: string;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface OrderStatusManagementState {
  data: AllOrderStatusResponseModel | null;
  selectedOrderStatus: OrderStatusResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: OrderStatusFilters;
  operations: OperationStates;
}
