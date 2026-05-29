import { apiInstance } from "@/api/axios-instance";
import {
  SubscriptionHistoryResponse,
  PaginationResponse,
} from "@/types/subscription";

class SubscriptionService {
  async getCurrentSubscription(): Promise<SubscriptionHistoryResponse> {
    const { data } = await apiInstance.get<{
      data: SubscriptionHistoryResponse;
    }>("/subscriptions/current");
    return data.data;
  }

  async getSubscriptionHistory(
    businessId: string,
    pageNo?: number,
    pageSize?: number
  ): Promise<PaginationResponse<SubscriptionHistoryResponse>> {
    const { data } = await apiInstance.post<{
      data: PaginationResponse<SubscriptionHistoryResponse>;
    }>("/subscriptions/history", {
      businessId,
      pageNo: pageNo || 1,
      pageSize: pageSize || 10,
    });
    return data.data;
  }
}

export const subscriptionService = new SubscriptionService();
