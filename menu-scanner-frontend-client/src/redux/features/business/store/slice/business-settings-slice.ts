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
    /**
     * Clear business settings
     */
    clearBusinessSettings: (state) => {
      state.data = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchBusinessSettingsThunk
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
        state.data = null;
      });

    // Handle updateBusinessSettingsThunk
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
      });
  },
});

export const { clearBusinessSettings } = businessSettingsSlice.actions;

export default businessSettingsSlice.reducer;
