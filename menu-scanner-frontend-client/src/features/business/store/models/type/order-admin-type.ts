import { AllOrderResponseModel } from "../response/order-admin-response";
import { OrderResponse } from "@/features/main/store/models/response/order-response";

export interface OrderAdminFilters {
  search: string;
  pageNo: number;
  orderStatus?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderAdminOperations {
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface OrderAdminState {
  data: AllOrderResponseModel | null;
  selectedOrder: OrderResponse | null;
  isLoading: boolean;
  error: string | null;
  filters: OrderAdminFilters;
  operations: OrderAdminOperations;
}
