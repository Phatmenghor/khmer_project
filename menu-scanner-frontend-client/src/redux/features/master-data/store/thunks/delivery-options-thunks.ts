/**
 * DeliveryOptions Management - Async Thunks
 * Redux thunks for DeliveryOptions CRUD operations
 */

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllDeliveryOptionsRequest,
  UpdateDeliveryOptionsParams,
} from "../models/request/delivery-options-request";
import { CreateDeliveryOptionsData } from "../models/schema/delivery-options-schema";

/**
 * Fetch all DeliveryOptions from /api/v1/delivery-options/all
 */
export const fetchAllDeliveryOptionsService = createApiThunk<
  any,
  AllDeliveryOptionsRequest
>("delivery-options/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/delivery-options/all",
    params
  );
  return response.data.data;
});

/**
 * Fetch DeliveryOptions by ID
 */
export const fetchDeliveryOptionsByIdService = createApiThunk<any, string>(
  "delivery-options/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/delivery-options/${id}`
    );
    return response.data.data;
  }
);

/**
 * Create DeliveryOptions
 */
export const createDeliveryOptionsService = createApiThunk<
  any,
  CreateDeliveryOptionsData
>("delivery-options/create", async (payload) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/delivery-options",
    payload
  );
  return response.data.data;
});

/**
 * Update DeliveryOptions
 */
export const updateDeliveryOptionsService = createApiThunk<
  any,
  UpdateDeliveryOptionsParams
>("delivery-options/update", async ({ id, payload }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/delivery-options/${id}`,
    payload
  );
  return response.data.data;
});

/**
 * Delete DeliveryOptions
 */
export const deleteDeliveryOptionsService = createApiThunk<any, string>(
  "delivery-options/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/delivery-options/${id}`
    );
    return response.data.data;
  }
);
