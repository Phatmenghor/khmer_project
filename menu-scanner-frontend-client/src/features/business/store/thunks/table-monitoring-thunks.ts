import { createAsyncThunk } from "@reduxjs/toolkit";
import { tableMonitoringApi, CreateTableRequest } from "../services/table-monitoring-api";

export const fetchTablesThunk = createAsyncThunk(
  "tableMonitoring/fetchTables",
  async (params: { status?: string; pageNo?: number; pageSize?: number } | void, { rejectWithValue }) => {
    try {
      const response = await tableMonitoringApi.fetchTables(params || undefined);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tables");
    }
  },
  {
    condition: (_, { getState }: any) => {
      const state = getState();
      if (state.tableMonitoring?.isLoading) {
        return false;
      }
      return true;
    },
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

export const resetTableThunk = createAsyncThunk(
  "tableMonitoring/resetTable",
  async (tableId: string, { rejectWithValue }) => {
    try {
      const response = await tableMonitoringApi.resetTable(tableId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to reset table");
    }
  }
);

export const deleteTableThunk = createAsyncThunk(
  "tableMonitoring/deleteTable",
  async (tableId: string, { rejectWithValue }) => {
    try {
      await tableMonitoringApi.deleteTable(tableId);
      return tableId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete table");
    }
  }
);
