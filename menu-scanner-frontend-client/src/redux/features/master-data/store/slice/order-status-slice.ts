import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "@/constants/status/status";
import { OrderStatusManagementState } from "../models/type/order-status-type";
import {
  createOrderStatusService,
  deleteOrderStatusService,
  fetchAllOrderStatusService,
  fetchOrderStatusByIdService,
  updateOrderStatusService,
} from "../thunks/order-status-thunks";

/**
 * Initial state
 */
const initialState: OrderStatusManagementState = {
  data: null,
  selectedOrderStatus: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
    status: Status.ALL,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

/**
 * OrderStatus slice
 */
const orderStatusSlice = createSlice({
  name: "order-status",
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

    setStatusFilter: (state, action: PayloadAction<Status>) => {
      state.filters.status = action.payload;
      state.filters.pageNo = 1;
    },

    clearSelectedOrderStatus: (state) => {
      state.selectedOrderStatus = null;
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
      .addCase(fetchAllOrderStatusService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrderStatusService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllOrderStatusService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchOrderStatusByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedOrderStatus = null;
      })
      .addCase(fetchOrderStatusByIdService.fulfilled, (state, action) => {
        state.selectedOrderStatus = action.payload;
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
      .addCase(fetchOrderStatusByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(createOrderStatusService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createOrderStatusService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize,
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createOrderStatusService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updateOrderStatusService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateOrderStatusService.fulfilled, (state, action) => {
        state.selectedOrderStatus = action.payload;
        state.operations.isUpdating = false;

        // Update in list
        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user,
          );
        }
      })
      .addCase(updateOrderStatusService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteOrderStatusService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteOrderStatusService.fulfilled, (state, action) => {
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
      .addCase(deleteOrderStatusService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  clearError,
  setStatusFilter,
  clearSelectedOrderStatus,
  resetFilters,
  resetState,
} = orderStatusSlice.actions;

export default orderStatusSlice.reducer;
