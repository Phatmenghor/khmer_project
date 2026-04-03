import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessSettingsByBusinessId,
  updateCurrentBusinessSettings,
  type BusinessSettingsResponse,
  type UpdateBusinessSettingsRequest,
} from "../services/business-settings-service";
import { AppDefault } from "@/constants/app-resource/default/default";

/**
 * Async thunk to fetch business settings
 * Fetches theme colors, logo, and business name from public endpoint
 */
export const fetchBusinessSettingsThunk = createAsyncThunk(
  "businessSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const settings = await fetchBusinessSettingsByBusinessId(AppDefault.BUSINESS_ID);
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
