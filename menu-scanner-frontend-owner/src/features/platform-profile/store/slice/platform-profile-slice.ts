import { createSlice } from "@reduxjs/toolkit";
import { PlatformProfileResponseModel } from "../models/response/platform-profile-response";
import {
  fetchPublicPlatformProfileService,
  fetchAdminPlatformProfileService,
  updatePlatformProfileService,
} from "../thunks/platform-profile-thunks";

interface PlatformProfileState {
  profile: PlatformProfileResponseModel | null;
  publicProfile: PlatformProfileResponseModel | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

const initialState: PlatformProfileState = {
  profile: null,
  publicProfile: {
    brandName: "ScanMe KH",
    brandSlogan: "Digital Menu & Smart POS Platform",
    supportEmail: "phatmenghor7@gmail.com",
    supportTelegram: "070411260",
    supportPhone: "070411260",
  },
  isLoading: false,
  isUpdating: false,
  error: null,
};

const platformProfileSlice = createSlice({
  name: "platformProfile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Public fetch
    builder
      .addCase(fetchPublicPlatformProfileService.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchPublicPlatformProfileService.fulfilled, (state, action) => {
        if (action.payload) {
          state.publicProfile = action.payload;
        }
      })
      .addCase(fetchPublicPlatformProfileService.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch public platform profile";
      });

    // Admin fetch
    builder
      .addCase(fetchAdminPlatformProfileService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminPlatformProfileService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.publicProfile = action.payload;
      })
      .addCase(fetchAdminPlatformProfileService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch platform profile";
      });

    // Update
    builder
      .addCase(updatePlatformProfileService.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePlatformProfileService.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload;
        state.publicProfile = action.payload;
      })
      .addCase(updatePlatformProfileService.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || "Failed to update platform profile";
      });
  },
});

export const platformProfileReducer = platformProfileSlice.reducer;
