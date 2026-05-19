import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClientWithAuth } from "@/utils/axios";
import {
  ProductStockCreateRequest,
  ProductStockFilterRequest,
  ProductStockUpdateRequest,
  ProductStockItemsFilterRequest,
} from "../models/request/stock-request";
import {
  ProductStockDto,
  ProductStockListResponse,
  ProductStockItemsListResponse,
} from "../models/response/stock-response";

export const createProductStockService = createAsyncThunk(
  "stock-management/createProductStock",
  async (request: ProductStockCreateRequest, { rejectWithValue }) => {
    try {
      const response = await axiosClientWithAuth.post<{
        data: ProductStockDto;
      }>("/api/v1/product-stock", request);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create stock"
      );
    }
  }
);

export const getProductStockHistoryService = createAsyncThunk(
  "stock-management/getProductStockHistory",
  async (request: ProductStockFilterRequest, { rejectWithValue }) => {
    try {
      const response = await axiosClientWithAuth.post<{
        data: ProductStockListResponse;
      }>("/api/v1/product-stock/my-business/all", request);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stock history"
      );
    }
  }
);

export const updateProductStockService = createAsyncThunk(
  "stock-management/updateProductStock",
  async (
    {
      stockId,
      request,
    }: { stockId: string; request: ProductStockUpdateRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClientWithAuth.put<{
        data: ProductStockDto;
      }>(`/api/v1/product-stock/${stockId}`, request);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update stock"
      );
    }
  }
);

export const deleteProductStockService = createAsyncThunk(
  "stock-management/deleteProductStock",
  async (stockId: string, { rejectWithValue }) => {
    try {
      await axiosClientWithAuth.delete(`/api/v1/product-stock/${stockId}`);
      return stockId;
    } catch (error: unknown) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete stock"
      );
    }
  }
);


export const getProductStockItemsService = createAsyncThunk(
  "stock-management/getProductStockItems",
  async (request: ProductStockItemsFilterRequest, { rejectWithValue }) => {
    try {
      const response = await axiosClientWithAuth.post<{
        data: ProductStockItemsListResponse;
      }>("/api/v1/product-stock/items/my-business", request);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stock items"
      );
    }
  }
);


export const getProductStockItemsAllService = createAsyncThunk(
  "stock-management/getProductStockItemsAll",
  async (request: Omit<ProductStockItemsFilterRequest, 'pageNo' | 'pageSize'>, { rejectWithValue }) => {
    try {
      const response = await axiosClientWithAuth.post<{
        data: ProductStockItemsListResponse;
      }>("/api/v1/product-stock/items/my-business/all", request);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all stock items"
      );
    }
  }
);
