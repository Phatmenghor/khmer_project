import { Messages } from "@/constants/messages";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessSettingsByBusinessId,
  updateCurrentBusinessSettings,
  type BusinessSettingsResponse,
  type UpdateBusinessSettingsRequest,
} from "../services/business-settings-service";
import { AppDefault } from "@/constants/app-resource/default/default";

// Cache manager for business settings
const businessSettingsCacheManager = {
  clearForBusinessId: (businessId: string) => {
    try {
      const cacheKey = `business_settings_cache_${businessId}`;
      const timestampKey = `business_settings_timestamp_${businessId}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(timestampKey);
      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(timestampKey);
      console.log(`✅ Cache cleared for business: ${businessId}`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
};

export const fetchBusinessSettingsThunk = createAsyncThunk(
  "businessSettings/fetch",
  async (businessIdParam?: string, { rejectWithValue }) => {
    try {
      const businessId = businessIdParam || localStorage.getItem("businessId") || AppDefault.BUSINESS_ID;

      // Clear cache before fetching to ensure fresh data
      businessSettingsCacheManager.clearForBusinessId(businessId);

      const settings = await fetchBusinessSettingsByBusinessId(businessId);
      return settings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch business settings";
      return rejectWithValue(errorMessage);
    }
  }
);


export const updateBusinessSettingsThunk = createAsyncThunk(
  "businessSettings/updateCurrent",
  async (request: UpdateBusinessSettingsRequest, { rejectWithValue }) => {
    try {
      const settings = await updateCurrentBusinessSettings(request);

      // Clear cache after update
      if (settings.businessId) {
        businessSettingsCacheManager.clearForBusinessId(settings.businessId);
      }

      return settings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : Messages.business.settingsUpdateFailed;
      return rejectWithValue(errorMessage);
    }
  }
);
