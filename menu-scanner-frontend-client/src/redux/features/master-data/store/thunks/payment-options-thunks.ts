import { createAsyncThunk } from "@reduxjs/toolkit";
import { Status } from "@/constants/status/status";
import { PaymentOptionResponse } from "../models/response/payment-option-response";
import { PaginationResponse } from "../models/pagination-response";
import { ApiClient } from "@/utils/api-client";

const API_BASE = "/api/v1/payment-options";

/**
 * Fetch all payment options with filters and pagination
 */
export const fetchAllPaymentOptionsService = createAsyncThunk<
  PaginationResponse<PaymentOptionResponse>,
  {
    search?: string;
    pageNo?: number;
    pageSize?: number;
    statuses?: Status[];
  }
>("paymentOptions/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.pageNo) query.append("pageNo", params.pageNo.toString());
    if (params.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params.statuses?.length) {
      params.statuses.forEach((status) => {
        if (status !== Status.ALL) query.append("status", status);
      });
    }

    const response = await ApiClient.post<
      PaginationResponse<PaymentOptionResponse>
    >(`${API_BASE}/search?${query.toString()}`, {});

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch payment options");
  }
});

/**
 * Fetch payment option by ID
 */
export const fetchPaymentOptionByIdService = createAsyncThunk<
  PaymentOptionResponse,
  string
>("paymentOptions/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await ApiClient.get<PaymentOptionResponse>(
      `${API_BASE}/${id}`
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch payment option");
  }
});

/**
 * Create a new payment option
 */
export const createPaymentOptionService = createAsyncThunk<
  PaymentOptionResponse,
  { name: string }
>("paymentOptions/create", async (data, { rejectWithValue }) => {
  try {
    const response = await ApiClient.post<PaymentOptionResponse>(
      `${API_BASE}`,
      data
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create payment option");
  }
});

/**
 * Update payment option
 */
export const updatePaymentOptionService = createAsyncThunk<
  PaymentOptionResponse,
  { id: string; name: string }
>("paymentOptions/update", async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const response = await ApiClient.put<PaymentOptionResponse>(
      `${API_BASE}/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update payment option");
  }
});

/**
 * Delete payment option
 */
export const deletePaymentOptionService = createAsyncThunk<string, string>(
  "paymentOptions/delete",
  async (id, { rejectWithValue }) => {
    try {
      await ApiClient.delete(`${API_BASE}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete payment option");
    }
  }
);

/**
 * Activate payment option
 */
export const activatePaymentOptionService = createAsyncThunk<
  PaymentOptionResponse,
  string
>("paymentOptions/activate", async (id, { rejectWithValue }) => {
  try {
    const response = await ApiClient.patch<PaymentOptionResponse>(
      `${API_BASE}/${id}/activate`,
      {}
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to activate payment option");
  }
});

/**
 * Deactivate payment option
 */
export const deactivatePaymentOptionService = createAsyncThunk<
  PaymentOptionResponse,
  string
>("paymentOptions/deactivate", async (id, { rejectWithValue }) => {
  try {
    const response = await ApiClient.patch<PaymentOptionResponse>(
      `${API_BASE}/${id}/deactivate`,
      {}
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.message || "Failed to deactivate payment option"
    );
  }
});
