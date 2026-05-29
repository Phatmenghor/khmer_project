import { createApiThunk } from "@/utils/axios/api-wrapper";
import { subscriptionService } from "../services/subscription-service";
import {
  SubscriptionHistoryResponse,
  PaginationResponse,
} from "@/types/subscription";

export const getCurrentSubscriptionService = createApiThunk<
  SubscriptionHistoryResponse,
  void
>("subscription/getCurrent", async () => {
  return await subscriptionService.getCurrentSubscription();
});

export const getSubscriptionHistoryService = createApiThunk<
  PaginationResponse<SubscriptionHistoryResponse>,
  { businessId: string; pageNo?: number; pageSize?: number }
>("subscription/getHistory", async (params) => {
  return await subscriptionService.getSubscriptionHistory(
    params.businessId,
    params.pageNo,
    params.pageSize
  );
});
