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
      .addCase(submitPublicReviewThunk.fulfilled, (state, action) => {
        state.isSubmittingReview = false;
        if (state.profile && action.meta.arg?.request) {
          const newRating = action.meta.arg.request.rating;
          const currentStats = state.profile.reviewStats || {
            averageRating: 0,
            totalReviews: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          };

          const oldTotal = currentStats.totalReviews || 0;
          const oldAvg = currentStats.averageRating || 0;
          const oldSum = oldAvg * oldTotal;

          const newTotal = oldTotal + 1;
          const newAvg = Math.round(((oldSum + newRating) / newTotal) * 10) / 10;

          const newDist = { ...(currentStats.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }) };
          newDist[newRating] = (newDist[newRating] || 0) + 1;

          state.profile = {
            ...state.profile,
            reviewStats: {
              averageRating: newAvg,
              totalReviews: newTotal,
              distribution: newDist,
            },
          };
        }
      })
      .addCase(submitPublicReviewThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isSubmittingReview = false;
      });
  },
});

export const { clearError } = publicPortfolioSlice.actions;
export default publicPortfolioSlice.reducer;
