import { createSlice } from "@reduxjs/toolkit";
import { PortfolioPublicProfile } from "../models/portfolio-types";
import {
  fetchPublicPortfolioThunk,
  submitPublicReviewThunk,
} from "../thunks/portfolio-thunks";

interface PublicPortfolioState {
  profile: PortfolioPublicProfile | null;
  isLoading: boolean;
  isSubmittingReview: boolean;
  error: string | null;
}

const initialState: PublicPortfolioState = {
  profile: null,
  isLoading: false,
  isSubmittingReview: false,
  error: null,
};

const publicPortfolioSlice = createSlice({
  name: "publicPortfolio",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicPortfolioThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicPortfolioThunk.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPublicPortfolioThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(submitPublicReviewThunk.pending, (state) => {
        state.isSubmittingReview = true;
        state.error = null;
      })
      .addCase(submitPublicReviewThunk.fulfilled, (state) => {
        state.isSubmittingReview = false;
      })
      .addCase(submitPublicReviewThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isSubmittingReview = false;
      });
  },
});

export const { clearError } = publicPortfolioSlice.actions;
export default publicPortfolioSlice.reducer;
