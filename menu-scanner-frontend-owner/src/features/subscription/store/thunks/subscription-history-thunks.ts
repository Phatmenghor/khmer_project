import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { AllSubscriptionHistoryRequest } from "../models/request/subscription-history-request";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";

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

export const fetchAllSubscriptionsByBusinessIdService = createApiThunk<
  any,
  string
>("subscription-history/fetchAllByBusinessId", async (businessId) => {
  const response = await axiosClientWithAuth.get(
    `/api/v1/subscriptions/business/${businessId}`
  );
  return response.data.data;
});

export const fetchMySubscriptionSummaryService = createApiThunk<any, void>(
  "subscription-history/fetchMySummary",
  async () => {
    const response = await axiosClientWithAuth.get(
      "/api/v1/subscriptions/my-summary"
    );
    return response.data.data;
  }
);

export const downloadSubscriptionReceiptPdfService = async (subscriptionId?: string): Promise<boolean> => {
  if (!subscriptionId || subscriptionId === "undefined" || subscriptionId === "null" || subscriptionId.trim() === "") {
    showToast.info("Subscription receipt is not available for this record.");
    return false;
  }
  try {
    const response = await axiosClientWithAuth.get(
      `/api/v1/subscriptions/${subscriptionId}/receipt/pdf`,
      { responseType: "blob" }
    );
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `subscription-receipt-${subscriptionId.substring(0, 8)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
    showToast.success("Subscription receipt PDF downloaded successfully!");
    return true;
  } catch (error: unknown) {
    showToast.error(getErrorMessage(error, "Failed to download subscription receipt PDF"));
    return false;
  }
};
