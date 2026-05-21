import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PortfolioReviewAdmin } from "../models/portfolio-types";
import { PaginationResponseModel } from "@/features/master-data/store/models/response/pagination-response";
import {
  fetchPortfolioReviewsThunk,
  approveReviewThunk,
  rejectReviewThunk,
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
    isApproved: string;
  };
  operations: {
    isApproving: boolean;
    isRejecting: boolean;
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
    isApproved: "ALL",
  },
  operations: {
    isApproving: false,
    isRejecting: false,
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
    setApprovedFilter: (state, action: PayloadAction<string>) => {
      state.filters.isApproved = action.payload;
      state.filters.pageNo = 1;
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
      .addCase(approveReviewThunk.pending, (state) => {
        state.operations.isApproving = true;
      })
      .addCase(approveReviewThunk.fulfilled, (state, action) => {
        state.operations.isApproving = false;
        if (state.data) {
          state.data.content = state.data.content.map((r) =>
            r.id === action.payload.id ? action.payload : r
          );
        }
      })
      .addCase(approveReviewThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isApproving = false;
      });

    builder
      .addCase(rejectReviewThunk.pending, (state) => {
        state.operations.isRejecting = true;
      })
      .addCase(rejectReviewThunk.fulfilled, (state, action) => {
        state.operations.isRejecting = false;
        if (state.data) {
          state.data.content = state.data.content.map((r) =>
            r.id === action.payload.id ? action.payload : r
          );
        }
      })
      .addCase(rejectReviewThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isRejecting = false;
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
  setApprovedFilter,
  clearError,
  resetState,
} = portfolioReviewsSlice.actions;
export default portfolioReviewsSlice.reducer;
