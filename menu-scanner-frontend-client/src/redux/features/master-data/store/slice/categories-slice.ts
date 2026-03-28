/**
 * Categories Management - Redux Slice
 * Manages Categories state: data, loading, errors, filters, operations
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "@/constants/status/status";
import { CategoriesManagementState } from "../models/type/categories-type";
import {
  createCategoriesService,
  deleteCategoriesService,
  fetchAllCategoriesService,
  fetchAllCategoriesWithProductCountService,
  fetchCategoriesByIdService,
  updateCategoriesService,
} from "../thunks/categories-thunks";

/**
 * Initial state
 */
const initialState: CategoriesManagementState = {
  data: null,
  dataWithProductCount: null,
  selectedCategories: null,
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
 * Categories slice
 */
const categoriesSlice = createSlice({
  name: "categories",
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

    clearSelectedCategories: (state) => {
      state.selectedCategories = null;
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
      .addCase(fetchAllCategoriesService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCategoriesService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllCategoriesService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    // Handle categories with product count (for admin page)
    builder
      .addCase(fetchAllCategoriesWithProductCountService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCategoriesWithProductCountService.fulfilled, (state, action) => {
        state.dataWithProductCount = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllCategoriesWithProductCountService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchCategoriesByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedCategories = null;
      })
      .addCase(fetchCategoriesByIdService.fulfilled, (state, action) => {
        state.selectedCategories = action.payload;
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
      .addCase(fetchCategoriesByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(createCategoriesService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createCategoriesService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createCategoriesService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updateCategoriesService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCategoriesService.fulfilled, (state, action) => {
        state.selectedCategories = action.payload;
        state.operations.isUpdating = false;

        // Update in list
        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user
          );
        }
      })
      .addCase(updateCategoriesService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteCategoriesService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCategoriesService.fulfilled, (state, action) => {
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
      .addCase(deleteCategoriesService.rejected, (state, action) => {
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
  clearSelectedCategories,
  resetFilters,
  resetState,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
