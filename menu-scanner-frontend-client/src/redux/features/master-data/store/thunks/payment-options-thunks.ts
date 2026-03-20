/**
 * Payment Options Management - Async Thunks
 * Redux thunks for Payment Options CRUD operations
 */

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllPaymentOptionsRequest,
  UpdatePaymentOptionParams,
} from "../models/request/payment-options-request";
import {
  CreatePaymentOptionData,
} from "../models/schema/payment-options-schema";
import { PaymentOptionResponse } from "../models/response/payment-option-response";
import { PaginationResponse } from "../models/pagination-response";

const API_BASE = "/api/v1/admin/payment-options";

/**
 * Fetch all payment options with filters and pagination
 */
export const fetchAllPaymentOptionsService = createApiThunk<
  PaginationResponse<PaymentOptionResponse>,
  AllPaymentOptionsRequest
>("paymentOptions/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<
    PaginationResponse<PaymentOptionResponse>
  >(`${API_BASE}/all`, params);

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
  CreatePaymentOptionData
>("paymentOptions/create", async (payload) => {
  const response = await axiosClientWithAuth.post<PaymentOptionResponse>(
    `${API_BASE}`,
    payload
  );
  return response.data.data;
});

/**
 * Update payment option
 */
export const updatePaymentOptionService = createApiThunk<
  PaymentOptionResponse,
  UpdatePaymentOptionParams
>("paymentOptions/update", async ({ id, payload }) => {
  const response = await axiosClientWithAuth.put<PaymentOptionResponse>(
    `${API_BASE}/${id}`,
    payload
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


