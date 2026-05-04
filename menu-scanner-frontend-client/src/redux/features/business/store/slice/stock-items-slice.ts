import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductStockItemDto, ProductStockItemsListResponse } from "../models/response/stock-response";
import { getProductStockItemsService } from "../thunks/stock-management-thunks";

interface StockItemsFilterState {
  pageNo: number;
  pageSize: number;
  sortBy: "totalStock" | "productName" | "categoryName" | "brandName" | "sku" | "barcode" | "sizeName" | "status" | "stockStatus" | "createdAt" | "updatedAt";
  sortDirection: "ASC" | "DESC";
  search: string;
  status?: "ACTIVE" | "INACTIVE";
  stockStatus?: "ENABLED" | "DISABLED";
  lowStockThreshold?: number;
  hasSizes?: boolean;
}

interface StockItemsPaginationState {
  totalElements: number;
  totalPages: number;
}

interface StockItemsState {
  data: ProductStockItemsListResponse | null;
  items: ProductStockItemDto[];
  isLoading: boolean;
  error: string | null;
  filters: StockItemsFilterState;
  pagination: StockItemsPaginationState;
}

const initialFilterState: StockItemsFilterState = {
  pageNo: 1,
  pageSize: 15,
  sortBy: "totalStock",
  sortDirection: "DESC",
  search: "",
};

const initialPaginationState: StockItemsPaginationState = {
  totalElements: 0,
  totalPages: 0,
};

const initialState: StockItemsState = {
  data: null,
  items: [],
  isLoading: false,
  error: null,
  filters: initialFilterState,
  pagination: initialPaginationState,
};

const stockItemsSlice = createSlice({
  name: "stock-items",
  initialState,
  reducers: {
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.filters.pageSize = action.payload;
      state.filters.pageNo = 1;
    },
    setSortBy: (state, action: PayloadAction<StockItemsFilterState["sortBy"]>) => {
      state.filters.sortBy = action.payload;
    },
    setSortDirection: (state, action: PayloadAction<"ASC" | "DESC">) => {
      state.filters.sortDirection = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setStatusFilter: (state, action: PayloadAction<"ACTIVE" | "INACTIVE" | undefined>) => {
      state.filters.status = action.payload;
      state.filters.pageNo = 1;
    },
    setStockStatusFilter: (state, action: PayloadAction<"ENABLED" | "DISABLED" | undefined>) => {
      state.filters.stockStatus = action.payload;
      state.filters.pageNo = 1;
    },
    setLowStockThreshold: (state, action: PayloadAction<number | undefined>) => {
      state.filters.lowStockThreshold = action.payload;
      state.filters.pageNo = 1;
    },
    setHasSizesFilter: (state, action: PayloadAction<boolean | undefined>) => {
      state.filters.hasSizes = action.payload;
      state.filters.pageNo = 1;
    },
    resetFilters: (state) => {
      state.filters = initialFilterState;
    },
    resetState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Stock Items
      .addCase(getProductStockItemsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getProductStockItemsService.fulfilled,
        (state, action: PayloadAction<ProductStockItemsListResponse>) => {
          state.isLoading = false;
          state.data = action.payload;
          state.items = action.payload.content;
          state.pagination = {
            totalElements: action.payload.totalElements,
            totalPages: action.payload.totalPages,
          };
        }
      )
      .addCase(getProductStockItemsService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.items = [];
      });
  },
});

export const {
  setPageNo,
  setPageSize,
  setSortBy,
  setSortDirection,
  setSearchFilter,
  setStatusFilter,
  setStockStatusFilter,
  setLowStockThreshold,
  setHasSizesFilter,
  resetFilters,
  resetState,
} = stockItemsSlice.actions;

export default stockItemsSlice.reducer;
