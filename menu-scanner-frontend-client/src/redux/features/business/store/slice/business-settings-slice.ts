import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BusinessSettingsResponse } from "../services/business-settings-service";
import { BusinessSettingsState, initialBusinessSettingsState } from "../state/business-settings-state";

const businessSettingsSlice = createSlice({
  name: "businessSettings",
  initialState: initialBusinessSettingsState,
  reducers: {
    /**
     * Set business settings data
     */
    setBusinessSettings: (state, action: PayloadAction<BusinessSettingsResponse>) => {
      state.data = action.payload;
      state.error = null;
    },

    /**
     * Set loading state
     */
    setBusinessSettingsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /**
     * Set error state
     */
    setBusinessSettingsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    /**
     * Clear business settings
     */
    clearBusinessSettings: (state) => {
      state.data = null;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {
  setBusinessSettings,
  setBusinessSettingsLoading,
  setBusinessSettingsError,
  clearBusinessSettings,
} = businessSettingsSlice.actions;

export default businessSettingsSlice.reducer;
