import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCurrentBusinessSettings,
  fetchBusinessSettingsByBusinessId,
  updateCurrentBusinessSettings,
  type BusinessSettingsResponse,
  type UpdateBusinessSettingsRequest,
} from "../services/business-settings-service";
import { AppDefault } from "@/constants/app-resource/default/default";

/**
 * Async thunk to fetch current business settings
 * Fetches complete business settings including tax percentage
 * Uses authenticated endpoint: /api/v1/business-settings/current
 */
export const fetchBusinessSettingsThunk = createAsyncThunk(
  "businessSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      // Try authenticated endpoint first (includes tax percentage)
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
