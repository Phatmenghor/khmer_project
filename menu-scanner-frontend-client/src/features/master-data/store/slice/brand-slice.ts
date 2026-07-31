


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


const initialState: BrandManagementState = {
  data: null,
  rollbackSnapshot: null,
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

        const updatedId = action.payload?.id || (action.meta?.arg as { id?: string })?.id;
        if (state.data && updatedId) {
          state.data.content = state.data.content.map((item) =>
            item.id === updatedId ? { ...item, ...action.payload } : item
          );
        }
      })
      .addCase(updateBrandService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteBrandService.pending, (state, action) => {
        state.operations.isDeleting = true;
        state.error = null;
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
      .addCase(deleteBrandService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deleteBrandService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
        if (state.rollbackSnapshot) {
          state.data = state.rollbackSnapshot;
          state.rollbackSnapshot = null;
        }
      });

    builder
      .addCase(toggleBrandStatusService.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleBrandStatusService.fulfilled, (state, action) => {
        state.selectedBrand = action.payload;


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
