import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderResponse } from "../models/response/order-response";
import { fetchMyOrdersService, fetchAllOrderStatusService } from "../thunks/my-orders-thunks";

interface OrderStatusTab {
  id: string;
  name: string;
  description?: string;
  order?: number;
}

interface MyOrdersState {
  orders: OrderResponse[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
  loading: {
    list: boolean;
    statuses: boolean;
  };
  error: {
    list: string | null;
    statuses: string | null;
  };
  statusTabs: OrderStatusTab[];
  loadedFilters: string; // Track what filters the orders were loaded with
}

const initialState: MyOrdersState = {
  orders: [],
  pagination: {
    currentPage: 1,
    pageSize: 15,
    totalPages: 0,
    totalElements: 0,
  },
  loading: {
    list: false,
    statuses: false,
  },
  error: {
    list: null,
    statuses: null,
  },
  statusTabs: [],
  loadedFilters: "", // Initialize empty
};

const myOrdersSlice = createSlice({
  name: "myOrders",
  initialState,
  reducers: {
    setLoadedFilters: (state, action: PayloadAction<string>) => {
      state.loadedFilters = action.payload;
    },

    clearOrders: (state) => {
      state.orders = [];
      state.pagination = initialState.pagination;
      state.loadedFilters = "";
    },

    resetMyOrdersState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Orders
    builder
      .addCase(fetchMyOrdersService.pending, (state) => {
        state.loading.list = true;
        state.error.list = null;
      })
      .addCase(fetchMyOrdersService.fulfilled, (state, action) => {
        const newOrders = action.payload.content || [];

        // Sort orders by order process status order
        const sortedOrders = [...newOrders].sort((a, b) => {
          const orderA = a.orderProcessStatus?.order || 0;
          const orderB = b.orderProcessStatus?.order || 0;
          return orderA - orderB;
        });

        state.orders = sortedOrders;
        state.loading.list = false;
        state.pagination = {
          currentPage: action.payload.pageNo || 1,
          pageSize: action.payload.pageSize || 15,
          totalPages: action.payload.totalPages || 0,
          totalElements: action.payload.totalElements || 0,
        };
      })
      .addCase(fetchMyOrdersService.rejected, (state, action) => {
        state.loading.list = false;
        state.error.list = action.payload as string;
      });

    // Fetch Order Status Tabs
    builder
      .addCase(fetchAllOrderStatusService.pending, (state) => {
        state.loading.statuses = true;
        state.error.statuses = null;
      })
      .addCase(fetchAllOrderStatusService.fulfilled, (state, action) => {
        const statuses = action.payload.content || [];
        state.statusTabs = statuses;
        state.loading.statuses = false;
      })
      .addCase(fetchAllOrderStatusService.rejected, (state, action) => {
        state.loading.statuses = false;
        state.error.statuses = action.payload as string;
      });
  },
});

export const {
  setLoadedFilters,
  clearOrders,
  resetMyOrdersState,
} = myOrdersSlice.actions;

export default myOrdersSlice.reducer;
