import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderResponse } from "../models/response/order-response";
import { fetchMyOrdersService } from "../thunks/my-orders-thunks";

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

    setStatusTabs: (state, action: PayloadAction<OrderStatusTab[]>) => {
      state.statusTabs = action.payload;
    },

    setStatusesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.statuses = action.payload;
    },

    setStatusesError: (state, action: PayloadAction<string | null>) => {
      state.error.statuses = action.payload;
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
        const pageNo = action.payload.pageNo || 1;
        const pageSize = action.payload.pageSize || 15;

        // For infinite scroll: append on page > 1, replace on page 1
        // Backend handles all sorting - no frontend sorting
        if (pageNo === 1) {
          // First page: replace all orders
          state.orders = newOrders;
        } else {
          // Load more: append new orders, deduplicating by ID
          const existingIds = new Set(state.orders.map((o) => o.id));
          const uniqueNew = newOrders.filter((o) => !existingIds.has(o.id));
          state.orders = [...state.orders, ...uniqueNew];
        }

        state.loading.list = false;
        state.pagination = {
          currentPage: pageNo,
          pageSize: pageSize,
          totalPages: action.payload.totalPages || 0,
          totalElements: action.payload.totalElements || 0,
        };
      })
      .addCase(fetchMyOrdersService.rejected, (state, action) => {
        state.loading.list = false;
        state.error.list = action.payload as string;
      });
  },
});

export const {
  setLoadedFilters,
  setStatusTabs,
  setStatusesLoading,
  setStatusesError,
  clearOrders,
  resetMyOrdersState,
} = myOrdersSlice.actions;

export default myOrdersSlice.reducer;
