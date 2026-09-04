import {
  AllSubscriptionHistoryResponseModel,
  SubscriptionHistoryResponseModel,
  MySubscriptionSummaryModel,
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
  isFetchingSummary: boolean;
}

export interface SubscriptionHistoryManagementState {
  data: AllSubscriptionHistoryResponseModel | null;
  selectedHistory: SubscriptionHistoryResponseModel | null;
  mySummary: MySubscriptionSummaryModel | null;
  isLoading: boolean;
  error: string | null;
  filters: SubscriptionHistoryFilters;
  operations: SubscriptionHistoryOperations;
}
