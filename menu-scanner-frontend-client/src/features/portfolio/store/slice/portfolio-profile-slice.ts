import { createSlice } from "@reduxjs/toolkit";
import { PortfolioAdminProfile } from "../models/portfolio-types";
import {
  fetchAdminPortfolioProfileThunk,
  saveAdminPortfolioProfileThunk,
} from "../thunks/portfolio-thunks";

interface PortfolioProfileState {
  profile: PortfolioAdminProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: PortfolioProfileState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

const portfolioProfileSlice = createSlice({
  name: "portfolioProfile",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminPortfolioProfileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminPortfolioProfileThunk.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAdminPortfolioProfileThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(saveAdminPortfolioProfileThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveAdminPortfolioProfileThunk.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.isSaving = false;
      })
      .addCase(saveAdminPortfolioProfileThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isSaving = false;
      });
  },
});

export const { clearError, resetState } = portfolioProfileSlice.actions;
export default portfolioProfileSlice.reducer;
