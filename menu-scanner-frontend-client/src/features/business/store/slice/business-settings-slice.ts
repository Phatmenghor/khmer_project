import { createSlice } from "@reduxjs/toolkit";
import { BusinessSettingsState, initialBusinessSettingsState } from "../state/business-settings-state";
import {
  fetchBusinessSettingsThunk,
  updateBusinessSettingsThunk,
} from "../thunks/business-settings-thunks";

const businessSettingsSlice = createSlice({
  name: "businessSettings",
  initialState: initialBusinessSettingsState,
  reducers: {


    clearBusinessSettings: (state) => {
      state.data = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {

    builder
      .addCase(fetchBusinessSettingsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessSettingsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchBusinessSettingsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        if (!state.data) {
          state.data = {
            id: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: "SYSTEM",
            updatedBy: "SYSTEM",
            businessId: "",
            businessName: BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
            taxPercentage: BUSINESS_SETTINGS_DEFAULTS.TAX_PERCENTAGE,
            logoBusinessUrl: "",
            enableStock: "DISABLED",
            socialMedia: [],
            primaryColor: BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
            businessHours: [],
            useBrands: false,
            lowStockThreshold: BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD,
            telegramGroupChatId: null,
            contactAddress: null,
            contactPhone: null,
            contactEmail: null,
            useSubcategories: false,
          } as any;
        }
      });


    builder
      .addCase(updateBusinessSettingsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessSettingsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(updateBusinessSettingsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        if (!state.data) {
          state.data = {
            id: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: "SYSTEM",
            updatedBy: "SYSTEM",
            businessId: "",
            businessName: BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
            taxPercentage: BUSINESS_SETTINGS_DEFAULTS.TAX_PERCENTAGE,
            logoBusinessUrl: "",
            enableStock: "DISABLED",
            socialMedia: [],
            primaryColor: BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
            businessHours: [],
            useBrands: false,
            lowStockThreshold: BUSINESS_SETTINGS_DEFAULTS.LOW_STOCK_THRESHOLD,
            telegramGroupChatId: null,
            contactAddress: null,
            contactPhone: null,
            contactEmail: null,
            useSubcategories: false,
          } as any;
        }
      });
  },
});

export const { clearBusinessSettings } = businessSettingsSlice.actions;

export default businessSettingsSlice.reducer;
