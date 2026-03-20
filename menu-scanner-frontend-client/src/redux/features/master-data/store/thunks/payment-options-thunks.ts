import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { Status } from "@/constants/status/status";
import { PaymentOptionResponse } from "../models/response/payment-option-response";
import { PaginationResponse } from "../models/pagination-response";

const API_BASE = "/api/v1/admin/payment-options";

/**
 * Fetch all payment options with filters and pagination
 */
export const fetchAllPaymentOptionsService = createApiThunk<
  PaginationResponse<PaymentOptionResponse>,
  {
    search?: string;
    pageNo?: number;
    pageSize?: number;
    statuses?: Status[];
  }
>("paymentOptions/fetchAll", async (params) => {
  const payload = {
    search: params.search || "",
    pageNo: params.pageNo || 1,
    pageSize: params.pageSize || 15,
    statuses: params.statuses && params.statuses.length > 0 ? params.statuses : [],
  };

  const response = await axiosClientWithAuth.post<
    PaginationResponse<PaymentOptionResponse>
  >(`${API_BASE}/all`, payload);

  return response.data.data;
});

/**
 * Fetch payment option by ID
 */
export const fetchPaymentOptionByIdService = createApiThunk<
  PaymentOptionResponse,
  string
>("paymentOptions/fetchById", async (id) => {
  const response = await axiosClientWithAuth.get<PaymentOptionResponse>(
    `${API_BASE}/${id}`
  );
  return response.data.data;
});

/**
 * Create a new payment option
 */
export const createPaymentOptionService = createApiThunk<
  PaymentOptionResponse,
  { name: string; paymentOptionType: string; status: string }
>("paymentOptions/create", async (data) => {
  const response = await axiosClientWithAuth.post<PaymentOptionResponse>(
    `${API_BASE}`,
    data
  );
  return response.data.data;
});

/**
 * Update payment option
 */
export const updatePaymentOptionService = createApiThunk<
  PaymentOptionResponse,
  { id: string; name: string; paymentOptionType: string; status: string }
>("paymentOptions/update", async ({ id, ...data }) => {
  const response = await axiosClientWithAuth.put<PaymentOptionResponse>(
    `${API_BASE}/${id}`,
    data
  );
  return response.data.data;
});

/**
 * Delete payment option
 */
export const deletePaymentOptionService = createApiThunk<string, string>(
  "paymentOptions/delete",
  async (id) => {
    await axiosClientWithAuth.delete(`${API_BASE}/${id}`);
    return id;
  }
);


