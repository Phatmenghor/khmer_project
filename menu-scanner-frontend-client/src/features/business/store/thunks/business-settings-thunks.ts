import { Messages } from "@/constants/messages";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessSettingsByBusinessId,
  updateCurrentBusinessSettings,
  type BusinessSettingsResponse,
  type UpdateBusinessSettingsRequest,
} from "../services/business-settings-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { clearBusinessSettings } from "../slice/business-settings-slice";

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
    } catch (error) {
      // Silent fail
    }
  },
  clearAll: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('business_settings')) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('business_settings')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      // Silent fail
    }
  }
};

export const fetchBusinessSettingsThunk = createAsyncThunk(
  "businessSettings/fetch",
  async (businessIdParam?: string, { rejectWithValue }) => {
    try {
      const businessId = businessIdParam || localStorage.getItem("businessId") || AppDefault.BUSINESS_ID;
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

export const switchBusinessIdThunk = createAsyncThunk(
  "businessSettings/switchBusinessId",
  async (newBusinessId: string, { rejectWithValue, dispatch }) => {
    try {
      dispatch(clearBusinessSettings());
      businessSettingsCacheManager.clearAll();
      businessSettingsCacheManager.clearForBusinessId(newBusinessId);
      localStorage.setItem("businessId", newBusinessId);
      return { businessId: newBusinessId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to switch business";
      return rejectWithValue(errorMessage);
    }
  }
);
