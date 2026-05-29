import { axiosClientWithAuth } from "@/utils/axios";
import {
  SubscriptionHistoryResponse,
  PaginationResponse,
} from "@/types/subscription";

class SubscriptionService {
  async getCurrentSubscription(): Promise<SubscriptionHistoryResponse> {
    const { data } = await axiosClientWithAuth.get<{
      data: SubscriptionHistoryResponse;
    }>("/api/v1/subscriptions/current");
    return data.data;
  }

  async getSubscriptionHistory(
    businessId: string,
    pageNo?: number,
    pageSize?: number
  ): Promise<PaginationResponse<SubscriptionHistoryResponse>> {
    const { data } = await axiosClientWithAuth.post<{
      data: PaginationResponse<SubscriptionHistoryResponse>;
    }>("/api/v1/subscriptions/history", {
      businessId,
      pageNo: pageNo || 1,
      pageSize: pageSize || 10,
    });
    return data.data;
  }
}

export const subscriptionService = new SubscriptionService();
