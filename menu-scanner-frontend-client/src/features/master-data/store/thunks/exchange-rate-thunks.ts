/**
 * Exchange Rate Management - Async Thunks
 * Redux thunks for Exchange Rate CRUD operations
 */

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllExchangeRateRequest,
  UpdateExchangeRateParams,
} from "../models/request/exchange-rate-request";
import { CreateExchangeRateData } from "../models/schema/exchange-rate-schema";

/**
 * Fetch all ExchangeRate
 */
export const fetchAllExchangeRateService = createApiThunk<
  any,
  AllExchangeRateRequest
>("business-exchange-rates/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/business-exchange-rates/all",
    params
  );
  return response.data.data;
});

/**
 * Fetch all ExchangeRate for current business
 */
export const fetchAllMyBusinessExchangeRateService = createApiThunk<
  any,
  AllExchangeRateRequest
>("business-exchange-rates/fetchMyBusiness", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/business-exchange-rates/my-business/all",
    params
  );
  return response.data.data;
});

/**
 * Fetch ExchangeRate by ID
 */
export const fetchExchangeRateByIdService = createApiThunk<any, string>(
  "business-exchange-rates/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/business-exchange-rates/${id}`
    );
    return response.data.data;
  }
);

/**
 * Create ExchangeRate
 */
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

/**
 * Update ExchangeRate
 */
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

/**
 * Delete ExchangeRate
 */
export const deleteExchangeRateService = createApiThunk<any, string>(
  "business-exchange-rates/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/business-exchange-rates/${id}`
    );
    return response.data.data;
  }
);
