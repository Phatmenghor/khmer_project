/**
 * Brand Management - Redux Slice
 * Manages Brand state: data, loading, errors, filters, operations
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BrandManagementState } from "../models/type/brand-type";
import { Status } from "@/constants/status/status";
import {
  createBrandService,
  deleteBrandService,
  fetchAllBrandService,
  fetchAllBrandWithProductCountService,
  fetchBrandByIdService,
  updateBrandService,
  toggleBrandStatusService,
} from "../thunks/brand-thunks";

/**
 * Initial state
 */
const initialState: BrandManagementState = {
  data: null,
  selectedBrand: null,
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
 * Brand slice
 */
const brandSlice = createSlice({
  name: "brands",
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

    clearSelectedBrand: (state) => {
      state.selectedBrand = null;
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
      .addCase(fetchAllBrandService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBrandService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllBrandService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchAllBrandWithProductCountService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBrandWithProductCountService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllBrandWithProductCountService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchBrandByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedBrand = null;
      })
      .addCase(fetchBrandByIdService.fulfilled, (state, action) => {
        state.selectedBrand = action.payload;
        state.operations.isFetchingDetail = false;

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
      .addCase(fetchBrandByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(createBrandService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createBrandService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createBrandService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updateBrandService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBrandService.fulfilled, (state, action) => {
        state.selectedBrand = action.payload;
        state.operations.isUpdating = false;

        // Update in list
        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user
          );
        }
      })
      .addCase(updateBrandService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteBrandService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBrandService.fulfilled, (state, action) => {
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
        state.operations.isDeleting = false;
      })
      .addCase(deleteBrandService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isDeleting = false;
      });

    builder
      .addCase(toggleBrandStatusService.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleBrandStatusService.fulfilled, (state, action) => {
        state.selectedBrand = action.payload;

        // Update in list
        if (state.data) {
          state.data.content = state.data.content.map((brand) =>
            brand.id === action.payload.id ? action.payload : brand
          );
        }
      })
      .addCase(toggleBrandStatusService.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  clearError,
  setStatusFilter,
  clearSelectedBrand,
  resetFilters,
  resetState,
} = brandSlice.actions;

export default brandSlice.reducer;
