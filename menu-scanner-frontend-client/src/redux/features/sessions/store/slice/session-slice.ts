import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "@/constants/status/status";
import { SessionManagementState } from "../models/type/session-type";
import {
  deleteSessionByIDService,
  fetchAllSessionsService,
  fetchSessionByIdService,
} from "../thunks/session-thunks";

/**
 * Initial state
 */
const initialState: SessionManagementState = {
  data: null,
  selectedSession: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
  },
  operations: {
    isDeleting: false,
    isFetchingDetail: false,
  },
};

/**
 * Session slice
 */
const sessionSlice = createSlice({
  name: "sessions",
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

    clearSelectedSession: (state) => {
      state.selectedSession = null;
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    resetState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSessionsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSessionsService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllSessionsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchSessionByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedSession = null;
      })
      .addCase(fetchSessionByIdService.fulfilled, (state, action) => {
        state.selectedSession = action.payload;
        state.operations.isFetchingDetail = false;

        // Also update in list if exists (for consistency)
        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (user) => user.id === action.payload.id,
          );
          if (index !== -1) {
            state.data.content[index] = action.payload;
          }
        }
      })
      .addCase(fetchSessionByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(deleteSessionByIDService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSessionByIDService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = state.data.content.filter(
            (user) => user.id !== action.payload,
          );
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize,
          );
          state.data.last = state.data.pageNo >= state.data.totalPages;
          state.data.hasNext = !state.data.last;
          state.data.hasPrevious = state.data.pageNo > 1;
        }
        state.operations.isDeleting = false;
      })
      .addCase(deleteSessionByIDService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  clearError,
  clearSelectedSession,
  resetFilters,
  resetState,
} = sessionSlice.actions;

export default sessionSlice.reducer;
