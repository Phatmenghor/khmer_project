


import { axiosClient, axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllDeliveryOptionsRequest,
  UpdateDeliveryOptionsParams,
} from "../models/request/delivery-options-request";
import { CreateDeliveryOptionsData } from "../models/schema/delivery-options-schema";

export const fetchPublicDeliveryOptionsService = createApiThunk<
  any,
  AllDeliveryOptionsRequest
>("delivery-options/fetchPublic", async (params, signal) => {
  const response = await axiosClient.post(
    "/api/v1/public/delivery-options/all",
    params,
    { signal }
  );
  return response.data.data;
});

export const fetchPublicDeliveryOptionsDataService = createApiThunk<
  any,
  { businessId?: string }
>("delivery-options/fetchPublicData", async (params, signal) => {
  const response = await axiosClient.post(
    "/api/v1/public/delivery-options/all-data",
    params,
    { signal }
  );
  return response.data.data;
});

export const fetchAllDeliveryOptionsService = createApiThunk<
  any,
  AllDeliveryOptionsRequest
>("delivery-options/fetchAll", async (params, signal) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/delivery-options/all",
    params,
    { signal }
  );
  return response.data.data;
});


export const fetchMyBusinessDeliveryOptionsService = createApiThunk<
  any,
  AllDeliveryOptionsRequest
>("delivery-options/fetchMyBusiness", async (params, signal) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/delivery-options/my-business/all",
    params,
    { signal }
  );
  return response.data.data;
});


export const fetchDeliveryOptionsByIdService = createApiThunk<any, string>(
  "delivery-options/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/delivery-options/${id}`
    );
    return response.data.data;
  }
);


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


export const deleteDeliveryOptionsService = createApiThunk<any, string>(
  "delivery-options/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/delivery-options/${id}`
    );
    return response.data.data;
  }
);


export const toggleDeliveryOptionsStatusService = createApiThunk<any, any>(
  "delivery-options/toggleStatus",
  async (deliveryOptions) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/delivery-options/${deliveryOptions.id}`,
      {
        ...deliveryOptions,
        status: deliveryOptions.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      }
    );
    return response.data.data;
  }
);

export const importDeliveryOptionsBatchService = createApiThunk<any, { requests: any[]; importId?: string }>(
  "delivery-options/importBatch",
  async ({ requests, importId }) => {
    const response = await axiosClientWithAuth.post(
      `/api/v1/delivery-options/batch${importId ? `?importId=${importId}` : ""}`,
      requests
    );
    return response.data.data;
  }
);
