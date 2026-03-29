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
import { CreatePaymentOptionData } from "../models/schema/payment-options-schema";

/**
 * Fetch all payment options with filters and pagination
 */
export const fetchAllPaymentOptionsService = createApiThunk<any, AllPaymentOptionsRequest>(
  "paymentOptions/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/payment-options/all",
      params
    );
    return response.data.data;
  }
);

/**
 * Fetch my business payment options with filters and pagination
 */
export const fetchMyBusinessPaymentOptionsService = createApiThunk<any, AllPaymentOptionsRequest>(
  "paymentOptions/fetchMyBusiness",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/payment-options/my-business/all",
      params
    );
    return response.data.data;
  }
);

/**
 * Fetch payment option by ID
 */
export const fetchPaymentOptionByIdService = createApiThunk<any, string>(
  "paymentOptions/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/payment-options/${id}`
    );
    return response.data.data;
  }
);

/**
 * Create a new payment option
 */
export const createPaymentOptionService = createApiThunk<
  any,
  CreatePaymentOptionData
>("paymentOptions/create", async (payload) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/payment-options",
    payload
  );
  return response.data.data;
});

/**
 * Update payment option
 */
export const updatePaymentOptionService = createApiThunk<
  any,
  UpdatePaymentOptionParams
>("paymentOptions/update", async ({ id, payload }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/payment-options/${id}`,
    payload
  );
  return response.data.data;
});

/**
 * Delete payment option
 */
export const deletePaymentOptionService = createApiThunk<any, string>(
  "paymentOptions/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete(`/api/v1/payment-options/${id}`);
    return response.data.data;
  }
);
