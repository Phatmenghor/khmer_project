import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LeaveManagementState } from "../models/type/leave-types";
import {
  approveLeaveService,
  createLeaveService,
  deleteLeaveService,
  fetchAllLeaveService,
  fetchLeaveByIdService,
  updateLeaveService,
} from "../thunks/leave-thunks";

const initialState: LeaveManagementState = {
  data: null,
  selectedLeave: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

/**
 * Leave slice
 */
const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    // Filter actions
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },

    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },

    // Utility actions
    clearError: (state) => {
      state.error = null;
    },

    clearSelectedLeave: (state) => {
      state.selectedLeave = null;
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
      .addCase(fetchAllLeaveService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllLeaveService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllLeaveService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchLeaveByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedLeave = null;
      })
      .addCase(fetchLeaveByIdService.fulfilled, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.selectedLeave = action.payload;
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
      .addCase(fetchLeaveByIdService.rejected, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createLeaveService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createLeaveService.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize,
          );
        }
      })
      .addCase(createLeaveService.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateLeaveService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateLeaveService.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.selectedLeave = action.payload;

        // Update in list
        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user,
          );
        }
      })
      .addCase(updateLeaveService.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(approveLeaveService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(approveLeaveService.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.selectedLeave = action.payload;

        // Update in list
        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user,
          );
        }
      })
      .addCase(approveLeaveService.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteLeaveService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteLeaveService.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
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
      })
      .addCase(deleteLeaveService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  clearError,
  clearSelectedLeave,
  resetFilters,
  resetState,
} = leaveSlice.actions;

export default leaveSlice.reducer;
