import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  SubscriptionHistoryResponse,
  PaginationResponse,
} from "@/types/subscription";

export const getCurrentSubscriptionService = createApiThunk<
  SubscriptionHistoryResponse,
  void
>("subscription/getCurrent", async () => {
  const response = await axiosClientWithAuth.get<{
    data: SubscriptionHistoryResponse;
  }>("/api/v1/subscriptions/current");
  return response.data.data;
});

export const getSubscriptionHistoryService = createApiThunk<
  PaginationResponse<SubscriptionHistoryResponse>,
  { businessId: string; pageNo?: number; pageSize?: number }
>("subscription/getHistory", async (params) => {
  const response = await axiosClientWithAuth.post<{
    data: PaginationResponse<SubscriptionHistoryResponse>;
  }>("/api/v1/subscriptions/history", {
    businessId: params.businessId,
    pageNo: params.pageNo || 1,
    pageSize: params.pageSize || 10,
  });
  return response.data.data;
});
