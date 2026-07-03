


import { axiosClientWithAuth, axiosClient } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllPaymentOptionsRequest,
  UpdatePaymentOptionParams,
} from "../models/request/payment-options-request";
import { CreatePaymentOptionData } from "../models/schema/payment-options-schema";


export const fetchPublicPaymentOptionsService = createApiThunk<any, AllPaymentOptionsRequest>(
  "paymentOptions/fetchPublic",
  async (params, signal) => {
    const response = await axiosClient.post(
      "/api/v1/public/payment-options/all",
      params,
      { signal }
    );
    return response.data.data;
  }
);


export const fetchAllPaymentOptionsService = createApiThunk<any, AllPaymentOptionsRequest>(
  "paymentOptions/fetchAll",
  async (params, signal) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/payment-options/all",
      params,
      { signal }
    );
    return response.data.data;
  }
);


export const fetchMyBusinessPaymentOptionsService = createApiThunk<any, AllPaymentOptionsRequest>(
  "paymentOptions/fetchMyBusiness",
  async (params, signal) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/payment-options/my-business/all",
      params,
      { signal }
    );
    return response.data.data;
  }
);


export const fetchPaymentOptionByIdService = createApiThunk<any, string>(
  "paymentOptions/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/payment-options/${id}`
    );
    return response.data.data;
  }
);


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


export const deletePaymentOptionService = createApiThunk<any, string>(
  "paymentOptions/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete(`/api/v1/payment-options/${id}`);
    return response.data.data;
  }
);

export const importPaymentOptionsBatchService = createApiThunk<any, any[]>(
  "paymentOptions/importBatch",
  async (requests) => {
    const response = await axiosClientWithAuth.post("/api/v1/payment-options/batch", requests);
    return response.data.data;
  }
);
