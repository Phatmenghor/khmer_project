import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderAdminState } from "../models/type/order-admin-type";
import {
  deleteOrderAdminService,
  fetchAllOrderAdminService,
  fetchOrderByIdAdminService,
  updateOrderAdminService,
} from "../thunks/order-admin-thunks";

const initialState: OrderAdminState = {
  data: null,
  selectedOrder: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
  },
  operations: {
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

const orderAdminSlice = createSlice({
  name: "ordersAdmin",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    setOrderStatusFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.orderStatus = action.payload;
      state.filters.pageNo = 1;
    },
    setPaymentStatusFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.paymentStatus = action.payload;
      state.filters.pageNo = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrderAdminService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrderAdminService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllOrderAdminService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchOrderByIdAdminService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedOrder = null;
      })
      .addCase(fetchOrderByIdAdminService.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
        state.operations.isFetchingDetail = false;

        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (o) => o.id === action.payload.id
          );
          if (index !== -1) {
            state.data.content[index] = action.payload;
          }
        }
      })
      .addCase(fetchOrderByIdAdminService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(updateOrderAdminService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateOrderAdminService.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
        state.operations.isUpdating = false;

        if (state.data) {
          state.data.content = state.data.content.map((o) =>
            o.id === action.payload.id ? action.payload : o
          );
        }
      })
      .addCase(updateOrderAdminService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteOrderAdminService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteOrderAdminService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = state.data.content.filter(
            (o) => o.id !== action.payload.id
          );
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
          state.data.last = state.data.pageNo >= state.data.totalPages;
          state.data.hasNext = !state.data.last;
          state.data.hasPrevious = state.data.pageNo > 1;
        }
        state.operations.isDeleting = false;
      })
      .addCase(deleteOrderAdminService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  setOrderStatusFilter,
  setPaymentStatusFilter,
  clearError,
  clearSelectedOrder,
  resetFilters,
  resetState,
} = orderAdminSlice.actions;

export default orderAdminSlice.reducer;
