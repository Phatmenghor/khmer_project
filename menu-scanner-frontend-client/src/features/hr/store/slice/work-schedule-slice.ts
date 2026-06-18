import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkScheduleManagementState } from "../models/type/work-schedule";
import { WorkScheduleResponseModel } from "../models/response/work-schedule-response";
import {
  createWorkScheduleService,
  deleteWorkScheduleService,
  fetchAllWorkScheduleService,
  fetchWorkScheduleByIdService,
  updateWorkScheduleService,
} from "../thunks/work-schedule-thunks";

const initialState: WorkScheduleManagementState = {
  data: null,
  rollbackSnapshot: null,
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


const workScheduleSlice = createSlice({
  name: "work-schedule",
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

    clearSelectedWorkSchedule: (state) => {
      state.selectedWorkSchedule = null;
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    resetState: () => {
      return initialState;
    },

    optimisticAdd: (state, action: PayloadAction<WorkScheduleResponseModel>) => {
      state.rollbackSnapshot = state.data ? JSON.parse(JSON.stringify(state.data)) : null;
      if (state.data) {
        state.data.content = [action.payload, ...state.data.content];
        state.data.totalElements += 1;
        state.data.totalPages = Math.ceil(state.data.totalElements / state.data.pageSize);
      }
    },

    optimisticUpdate: (state, action: PayloadAction<WorkScheduleResponseModel>) => {
      state.rollbackSnapshot = state.data ? JSON.parse(JSON.stringify(state.data)) : null;
      if (state.data) {
        state.data.content = state.data.content.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
      }
    },

    optimisticDelete: (state, action: PayloadAction<string>) => {
      state.rollbackSnapshot = state.data ? JSON.parse(JSON.stringify(state.data)) : null;
      if (state.data) {
        state.data.content = state.data.content.filter((item) => item.id !== action.payload);
        state.data.totalElements -= 1;
        state.data.totalPages = Math.ceil(state.data.totalElements / state.data.pageSize);
        state.data.last = state.data.pageNo >= state.data.totalPages;
        state.data.hasNext = !state.data.last;
        state.data.hasPrevious = state.data.pageNo > 1;
      }
    },

    rollbackOptimistic: (state) => {
      if (state.rollbackSnapshot) {
        state.data = state.rollbackSnapshot;
        state.rollbackSnapshot = null;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllWorkScheduleService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllWorkScheduleService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllWorkScheduleService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchWorkScheduleByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedWorkSchedule = null;
      })
      .addCase(fetchWorkScheduleByIdService.fulfilled, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.selectedWorkSchedule = action.payload;

        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (user) => user.id === action.payload.id,
          );
          if (index !== -1) {
            state.data.content[index] = action.payload;
          }
        }
      })
      .addCase(fetchWorkScheduleByIdService.rejected, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createWorkScheduleService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createWorkScheduleService.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize,
          );
        }
      })
      .addCase(createWorkScheduleService.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateWorkScheduleService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateWorkScheduleService.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.selectedWorkSchedule = action.payload;


        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user,
          );
        }
      })
      .addCase(updateWorkScheduleService.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteWorkScheduleService.pending, (state, action) => {
        state.operations.isDeleting = true;
        state.error = null;
        // Optimistically remove from list immediately
        state.rollbackSnapshot = state.data ? JSON.parse(JSON.stringify(state.data)) : null;
        const id = action.meta.arg as string;
        if (state.data) {
          state.data.content = state.data.content.filter((item) => item.id !== id);
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(state.data.totalElements / state.data.pageSize);
          state.data.last = state.data.pageNo >= state.data.totalPages;
          state.data.hasNext = !state.data.last;
          state.data.hasPrevious = state.data.pageNo > 1;
        }
      })
      .addCase(deleteWorkScheduleService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deleteWorkScheduleService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
        // Rollback the optimistic delete
        if (state.rollbackSnapshot) {
          state.data = state.rollbackSnapshot;
          state.rollbackSnapshot = null;
        }
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
  optimisticAdd,
  optimisticUpdate,
  optimisticDelete,
  rollbackOptimistic,
} = workScheduleSlice.actions;

export default workScheduleSlice.reducer;
