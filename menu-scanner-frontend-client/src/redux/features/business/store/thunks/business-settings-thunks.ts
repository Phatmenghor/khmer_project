import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessSettingsByBusinessId,
  updateCurrentBusinessSettings,
  type BusinessSettingsResponse,
  type UpdateBusinessSettingsRequest,
} from "../services/business-settings-service";
import { businessSettingsStorage } from "@/utils/storage/business-settings-storage";
import { AppDefault } from "@/constants/app-resource/default/default";

/**
 * Async thunk to fetch business settings by ID
 * Uses public endpoint: /api/v1/business-settings/business/{businessId}
 * No authentication required
 * Fetches from cache's businessId for instant verification
 */
export const fetchBusinessSettingsThunk = createAsyncThunk(
  "businessSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      // Get business ID from cache
      const cached = businessSettingsStorage.getCached();
      const businessId = cached?.data?.businessId || "550cad56-cafd-4aba-baef-c4dcd53940d0";

      // Use public endpoint (no auth required)
      const settings = await fetchBusinessSettingsByBusinessId(businessId);
      return settings;
    } catch (error) {
      // Silent fail - use cached settings
      // Log only for debugging, not as error
      console.log("ℹ️ Using cached business settings (API verification)");
      return null;
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
