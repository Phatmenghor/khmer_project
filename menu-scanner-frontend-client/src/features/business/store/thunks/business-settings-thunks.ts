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
import { RootState } from "@/store";

export const fetchBusinessSettingsThunk = createAsyncThunk<
  BusinessSettingsResponse,
  string | undefined
>(
  "businessSettings/fetch",
  async (businessIdParam, { rejectWithValue }) => {
    try {
      const businessId = businessIdParam || AppDefault.BUSINESS_ID;
      const settings = await fetchBusinessSettingsByBusinessId(businessId);
      return settings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch business settings";
      return rejectWithValue(errorMessage);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      const { data, isLoading } = state.businessSettings;
      if (data || isLoading) {
        return false;
      }
      return true;
    },
  }
);


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

export const switchBusinessIdThunk = createAsyncThunk(
  "businessSettings/switchBusinessId",
  async (newBusinessId: string, { rejectWithValue, dispatch }) => {
    try {
      dispatch(clearBusinessSettings());
      localStorage.setItem("businessId", newBusinessId);
      return { businessId: newBusinessId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to switch business";
      return rejectWithValue(errorMessage);
    }
  }
);
