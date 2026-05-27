import {
  AllSubscriptionHistoryResponseModel,
  SubscriptionHistoryResponseModel,
} from "../response/subscription-history-response";

export interface SubscriptionHistoryFilters {
  businessId: string;
  planId: string;
  fromDate: string;
  toDate: string;
  status: string;
  pageNo: number;
}

export interface SubscriptionHistoryOperations {
  isFetchingDetail: boolean;
}

export interface SubscriptionHistoryManagementState {
  data: AllSubscriptionHistoryResponseModel | null;
  selectedHistory: SubscriptionHistoryResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: SubscriptionHistoryFilters;
  operations: SubscriptionHistoryOperations;
}
