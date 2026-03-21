import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllOrderStatusRequest,
  UpdateOrderStatusParams,
} from "../models/request/order-status-request";
import { AppDefault } from "@/constants/app-resource/default/default";
import { CreateOrderStatusData } from "../models/schema/order-status-schema";

/**
 * Fetch all OrderStatus
 */
export const fetchAllOrderStatusService = createApiThunk<
  any,
  AllOrderStatusRequest
>("order-status/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/order-process-statuses/my-business/all",
    params,
  );
  return response.data.data;
});

/**
 * Fetch OrderStatus by ID
 */
export const fetchOrderStatusByIdService = createApiThunk<any, string>(
  "order-status/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/order-process-statuses/${id}`,
    );
    return response.data.data;
  },
);

/**
 * Create OrderStatus
 */
export const createOrderStatusService = createApiThunk<
  any,
  CreateOrderStatusData
>("order-status/create", async (payload) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/order-process-statuses",
    payload,
  );
  return response.data.data;
});

/**
 * Update OrderStatus
 */
export const updateOrderStatusService = createApiThunk<
  any,
  UpdateOrderStatusParams
>("order-status/update", async ({ id, payload }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/order-process-statuses/${id}`,
    payload,
  );
  return response.data.data;
});

/**
 * Delete OrderStatus
 */
export const deleteOrderStatusService = createApiThunk<any, string>(
  "order-status/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/order-process-statuses/${id}`,
    );
    return response.data.data;
  },
);

/**
 * Fetch Initial OrderStatus for a business
 */
export const fetchInitialOrderStatusService = createApiThunk<any, string>(
  "order-status/fetchInitial",
  async (businessId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/order-process-statuses/business/${businessId}/initial`,
    );
    return response.data.data;
  },
);
