import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCurrentBusinessSettings,
  updateCurrentBusinessSettings,
  type BusinessSettingsResponse,
  type UpdateBusinessSettingsRequest,
} from "../services/business-settings-service";

/**
 * Async thunk to fetch current business settings
 */
export const fetchBusinessSettingsThunk = createAsyncThunk(
  "businessSettings/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const settings = await fetchCurrentBusinessSettings();
      return settings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch business settings";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk to update current business settings
 */
export const updateBusinessSettingsThunk = createAsyncThunk(
  "businessSettings/updateCurrent",
  async (request: UpdateBusinessSettingsRequest, { rejectWithValue }) => {
    try {
      const settings = await updateCurrentBusinessSettings(request);
      return settings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update business settings";
      return rejectWithValue(errorMessage);
    }
  }
);
