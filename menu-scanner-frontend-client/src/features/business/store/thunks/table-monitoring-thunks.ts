import { createAsyncThunk } from "@reduxjs/toolkit";
import { tableMonitoringApi, CreateTableRequest } from "../services/table-monitoring-api";

export const fetchTablesThunk = createAsyncThunk(
  "tableMonitoring/fetchTables",
  async (_, { rejectWithValue }) => {
    try {
      const response = await tableMonitoringApi.fetchTables();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tables");
    }
  }
);

export const createTableThunk = createAsyncThunk(
  "tableMonitoring/createTable",
  async (payload: CreateTableRequest, { rejectWithValue }) => {
    try {
      const response = await tableMonitoringApi.createTable(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create table");
    }
  }
);

export const updateTableStatusThunk = createAsyncThunk(
  "tableMonitoring/updateTableStatus",
  async ({ tableId, status }: { tableId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await tableMonitoringApi.updateTableStatus(tableId, status);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update table status");
    }
  }
);

export const payTableOrderThunk = createAsyncThunk(
  "tableMonitoring/payTableOrder",
  async ({ tableId, paymentMethod }: { tableId: string; paymentMethod: string }, { rejectWithValue }) => {
    try {
      const response = await tableMonitoringApi.payTableOrder(tableId, paymentMethod);
      return { tableId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process payment");
    }
  }
);
