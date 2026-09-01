import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PortfolioReviewAdmin } from "../models/portfolio-types";
import { PaginationResponseModel } from "@/features/master-data/store/models/response/pagination-response";
import {
  fetchPortfolioReviewsThunk,
  deleteReviewThunk,
} from "../thunks/portfolio-thunks";

interface PortfolioReviewsState {
  data: PaginationResponseModel<PortfolioReviewAdmin> | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    pageNo: number;
    pageSize: number;
  };
  operations: {
    isDeleting: boolean;
  };
}

const initialState: PortfolioReviewsState = {
  data: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
    pageSize: 15,
  },
  operations: {
    isDeleting: false,
  },
};

const portfolioReviewsSlice = createSlice({
  name: "portfolioReviews",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolioReviewsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioReviewsThunk.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPortfolioReviewsThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(deleteReviewThunk.pending, (state) => {
        state.operations.isDeleting = true;
      })
      .addCase(deleteReviewThunk.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        if (state.data) {
          state.data.content = state.data.content.filter((r) => r.id !== action.payload);
          state.data.totalElements -= 1;
        }
      })
      .addCase(deleteReviewThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  clearError,
  resetState,
} = portfolioReviewsSlice.actions;
export default portfolioReviewsSlice.reducer;
