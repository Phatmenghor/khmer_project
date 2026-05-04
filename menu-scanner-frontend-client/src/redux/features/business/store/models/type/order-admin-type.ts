import { AllOrderResponseModel } from "../response/order-admin-response";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";

export interface OrderAdminFilters {
  search: string;
  pageNo: number;
  orderStatus?: string;
  paymentStatus?: string;
  startDate?: string; // ISO 8601 format
  endDate?: string;   // ISO 8601 format
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
