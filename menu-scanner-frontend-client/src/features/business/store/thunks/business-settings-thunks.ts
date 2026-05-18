import { Messages } from "@/constants/messages";
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
 * Fetches complete business settings using public endpoint (no auth required)
 * Uses public endpoint: /api/v1/public/business-settings/{businessId}
 */
export const fetchBusinessSettingsThunk = createAsyncThunk(
  "businessSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      // Get business ID from localStorage
      const businessId = localStorage.getItem("businessId") || AppDefault.BUSINESS_ID;

      // Use public endpoint (no auth required)
      const settings = await fetchBusinessSettingsByBusinessId(businessId);
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
      const errorMessage = error instanceof Error ? error.message : Messages.business.settingsUpdateFailed;
      return rejectWithValue(errorMessage);
    }
  }
);
