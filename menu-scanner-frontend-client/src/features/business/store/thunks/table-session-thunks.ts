import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClientWithAuth } from "@/utils/axios";
import { TableSession } from "../models/type/table-session-type";

export const fetchTableSessionsThunk = createAsyncThunk<
  { content: TableSession[]; totalElements: number; totalPages: number; pageNo: number; pageSize: number },
  { businessId?: string; tableId?: string; status?: string; search?: string; pageNo?: number; pageSize?: number },
  { rejectValue: string }
>("tableSession/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/table-sessions/all",
      params || {}
    );
    return response.data?.data || { content: [], totalElements: 0, totalPages: 1, pageNo: 1, pageSize: 15 };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch table sessions"
    );
  }
});

export const fetchMyBusinessTableSessionsThunk = createAsyncThunk<
  { content: TableSession[]; totalElements: number; totalPages: number; pageNo: number; pageSize: number },
  { status?: string; tableId?: string; search?: string; pageNo?: number; pageSize?: number },
  { rejectValue: string }
>("tableSession/fetchMyBusinessAll", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/table-sessions/my-business/all",
      params || {}
    );
    return response.data?.data || { content: [], totalElements: 0, totalPages: 1, pageNo: 1, pageSize: 15 };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch business table sessions"
    );
  }
});

export const fetchAllActiveTableSessionsThunk = createAsyncThunk<
  TableSession[],
  void,
  { rejectValue: string }
>("tableSession/fetchAllActive", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClientWithAuth.get(
      "/api/v1/table-sessions/all-active"
    );
    return response.data?.data || [];
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch all active table sessions"
    );
  }
});

export const fetchActiveTableSessionThunk = createAsyncThunk<
  TableSession | null,
  string,
  { rejectValue: string }
>("tableSession/fetchActive", async (tableId, { rejectWithValue }) => {
  try {
    const response = await axiosClientWithAuth.get(
      `/api/v1/table-sessions/active?tableId=${tableId}`
    );
    return response.data?.data || null;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch active table session"
    );
  }
});

export const addTableSessionItemThunk = createAsyncThunk<
  TableSession,
  {
    tableId: string;
    tableNumber?: string;
    productId: string;
    productName: string;
    imageUrl?: string;
    sizeId?: string;
    sizeName?: string;
    quantity: number;
    unitPrice: number;
    customizationTotal?: number;
    customerNote?: string;
  },
  { rejectValue: string }
>("tableSession/addItem", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/table-sessions/items",
      payload
    );
    return response.data?.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to add item to table session"
    );
  }
});

export const addBatchItemsToSessionThunk = createAsyncThunk<
  TableSession,
  {
    tableId: string;
    tableNumber?: string;
    orderRound?: number;
    items: Array<{
      productId: string;
      productName: string;
      imageUrl?: string;
      sizeId?: string;
      sizeName?: string;
      quantity: number;
      unitPrice: number;
      customizationTotal?: number;
      customerNote?: string;
    }>;
  },
  { rejectValue: string }
>("tableSession/addBatchItems", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/table-sessions/batch-items",
      payload
    );
    return response.data?.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to add batch items to table session"
    );
  }
});

export const settleTableSessionThunk = createAsyncThunk<
  TableSession,
  {
    tableId: string;
    paymentMethod?: string;
    customerName?: string;
    note?: string;
  },
  { rejectValue: string }
>("tableSession/settle", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/table-sessions/settle",
      payload
    );
    return response.data?.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to settle table bill"
    );
  }
});

export const fetchTableSessionByIdThunk = createAsyncThunk<
  TableSession | null,
  string,
  { rejectValue: string }
>("tableSession/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await axiosClientWithAuth.get(
      `/api/v1/table-sessions/${id}`
    );
    return response.data?.data || null;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch table session"
    );
  }
});

export const approveTableSessionThunk = createAsyncThunk<
  TableSession,
  { id: string; round?: number },
  { rejectValue: string }
>("tableSession/approve", async ({ id, round }, { rejectWithValue }) => {
  try {
    const response = await axiosClientWithAuth.put(
      `/api/v1/table-sessions/${id}/approve`,
      null,
      { params: { round } }
    );
    return response.data?.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to approve table session"
    );
  }
});

export const deleteTableSessionThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("tableSession/delete", async (id, { rejectWithValue }) => {
  try {
    await axiosClientWithAuth.delete(
      `/api/v1/table-sessions/${id}`
    );
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete table session"
    );
  }
});
