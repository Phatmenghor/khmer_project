import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkScheduleTypeManagementState } from "../models/type/work-schedule-type";
import {
  createWorkScheduleTypeService,
  deleteWorkScheduleTypeService,
  fetchAllWorkSchedulesTypeService,
  fetchWorkScheduleTypeByIdService,
  updateWorkScheduleTypeService,
} from "../thunks/work-schedule-type-thunks";

const initialState: WorkScheduleTypeManagementState = {
  data: null,
  selectedWorkSchedule: null,
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
 * Work Schedule Type slice
 */
const workScheduleTypeSlice = createSlice({
  name: "work-schedule-type",
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

    clearSelectedWorkSchedule: (state) => {
      state.selectedWorkSchedule = null;
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
      .addCase(fetchAllWorkSchedulesTypeService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllWorkSchedulesTypeService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllWorkSchedulesTypeService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchWorkScheduleTypeByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedWorkSchedule = null;
      })
      .addCase(fetchWorkScheduleTypeByIdService.fulfilled, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.selectedWorkSchedule = action.payload;
        // Also update in list if exists (for consistency)
        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (user) => user.id === action.payload.id
          );
          if (index !== -1) {
            state.data.content[index] = action.payload;
          }
        }
      })
      .addCase(fetchWorkScheduleTypeByIdService.rejected, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createWorkScheduleTypeService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createWorkScheduleTypeService.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
      })
      .addCase(createWorkScheduleTypeService.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateWorkScheduleTypeService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateWorkScheduleTypeService.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.selectedWorkSchedule = action.payload;

        // Update in list
        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user
          );
        }
      })
      .addCase(updateWorkScheduleTypeService.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteWorkScheduleTypeService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteWorkScheduleTypeService.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        if (state.data) {
          state.data.content = state.data.content.filter(
            (user) => user.id !== action.payload
          );
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
          state.data.last = state.data.pageNo >= state.data.totalPages;
          state.data.hasNext = !state.data.last;
          state.data.hasPrevious = state.data.pageNo > 1;
        }
      })
      .addCase(deleteWorkScheduleTypeService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  clearError,
  clearSelectedWorkSchedule,
  resetFilters,
  resetState,
} = workScheduleTypeSlice.actions;

export default workScheduleTypeSlice.reducer;
