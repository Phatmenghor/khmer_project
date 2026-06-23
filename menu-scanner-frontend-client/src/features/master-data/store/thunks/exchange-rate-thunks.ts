


import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllExchangeRateRequest,
  UpdateExchangeRateParams,
} from "../models/request/exchange-rate-request";
import { CreateExchangeRateData } from "../models/schema/exchange-rate-schema";
import { ExchangeRateResponseModel } from "../models/response/exchange-rate-response";


export const fetchAllExchangeRateService = createApiThunk<
  any,
  AllExchangeRateRequest
>("business-exchange-rates/fetchAll", async (params, signal) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/business-exchange-rates/all",
    params,
    { signal }
  );
  return response.data.data;
});


export const fetchAllMyBusinessExchangeRateService = createApiThunk<
  any,
  AllExchangeRateRequest
>("business-exchange-rates/fetchMyBusiness", async (params, signal) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/business-exchange-rates/my-business/all",
    params,
    { signal }
  );
  return response.data.data;
});


export const fetchExchangeRateByIdService = createApiThunk<any, string>(
  "business-exchange-rates/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/business-exchange-rates/${id}`
    );
    return response.data.data;
  }
);


export const createExchangeRateService = createApiThunk<
  any,
  CreateExchangeRateData
>("business-exchange-rates/create", async (payload) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/business-exchange-rates",
    payload
  );
  return response.data.data;
});


export const updateExchangeRateService = createApiThunk<
  any,
  UpdateExchangeRateParams
>("business-exchange-rates/update", async ({ id, payload }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/business-exchange-rates/${id}`,
    payload
  );
  return response.data.data;
});


export const deleteExchangeRateService = createApiThunk<any, string>(
  "business-exchange-rates/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/business-exchange-rates/${id}`
    );
    return response.data.data;
  }
);

export const toggleExchangeRateStatusService = createApiThunk<
  ExchangeRateResponseModel,
  ExchangeRateResponseModel
>("business-exchange-rates/toggleStatus", async (rate) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/business-exchange-rates/${rate.id}`,
    {
      ...rate,
      status: rate.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    }
  );
  return response.data.data;
});
