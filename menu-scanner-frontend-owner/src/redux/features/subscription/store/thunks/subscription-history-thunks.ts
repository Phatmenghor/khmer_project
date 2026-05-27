import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/apiWrapper";
import { AllSubscriptionHistoryRequest } from "../models/request/subscription-history-request";

export const fetchAllSubscriptionHistoryService = createApiThunk<
  any,
  AllSubscriptionHistoryRequest
>("subscription-history/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/subscriptions/history",
    params
  );
  return response.data.data;
});

export const fetchSubscriptionHistoryByIdService = createApiThunk<any, string>(
  "subscription-history/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/subscriptions/${id}`
    );
    return response.data.data;
  }
);
