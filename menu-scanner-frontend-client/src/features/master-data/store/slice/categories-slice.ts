


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
  toggleCategoriesStatusService,
} from "../thunks/categories-thunks";


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
        if (state.dataWithProductCount) {
          state.dataWithProductCount.content = [
            { ...action.payload, totalProducts: 0, activeProducts: 0 },
            ...state.dataWithProductCount.content,
          ];
          state.dataWithProductCount.totalElements += 1;
          state.dataWithProductCount.totalPages = Math.ceil(
            state.dataWithProductCount.totalElements / state.dataWithProductCount.pageSize
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

        if (state.data) {
          state.data.content = state.data.content.map((item) =>
            item.id === action.payload.id ? action.payload : item
          );
        }
        if (state.dataWithProductCount) {
          state.dataWithProductCount.content = state.dataWithProductCount.content.map((item) =>
            item.id === action.payload.id
              ? { ...action.payload, totalProducts: item.totalProducts, activeProducts: item.activeProducts }
              : item
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

        const deletedId = typeof action.payload === 'string' ? action.payload : action.payload?.id;


        if (state.data) {
          state.data.content = state.data.content.filter(
            (user) => user.id !== deletedId
          );
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
          state.data.last = state.data.pageNo >= state.data.totalPages;
          state.data.hasNext = !state.data.last;
          state.data.hasPrevious = state.data.pageNo > 1;
        }

        if (state.dataWithProductCount) {
          state.dataWithProductCount.content = state.dataWithProductCount.content.filter(
            (user) => user.id !== deletedId
          );
          state.dataWithProductCount.totalElements -= 1;
          state.dataWithProductCount.totalPages = Math.ceil(
            state.dataWithProductCount.totalElements / state.dataWithProductCount.pageSize
          );
          state.dataWithProductCount.last = state.dataWithProductCount.pageNo >= state.dataWithProductCount.totalPages;
          state.dataWithProductCount.hasNext = !state.dataWithProductCount.last;
          state.dataWithProductCount.hasPrevious = state.dataWithProductCount.pageNo > 1;
        }
        state.operations.isDeleting = false;
      })
      .addCase(deleteCategoriesService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isDeleting = false;
      });


    builder
      .addCase(toggleCategoriesStatusService.fulfilled, (state, action) => {

        if (state.data) {
          state.data.content = state.data.content.map((category) =>
            category.id === action.payload.id ? action.payload : category
          );
        }
        if (state.dataWithProductCount) {
          state.dataWithProductCount.content = state.dataWithProductCount.content.map(
            (category) =>
              category.id === action.payload.id ? action.payload : category
          );
        }
      })
      .addCase(toggleCategoriesStatusService.rejected, (state, action) => {
        state.error = action.payload as string;
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
