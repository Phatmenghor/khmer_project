


import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BannerManagementState } from "../models/type/banner-type";
import { Status } from "@/constants/status/status";
import {
  createBannerService,
  deleteBannerService,
  fetchAllBannerService,
  fetchBannerByIdService,
  updateBannerService,
  toggleBannerStatusService,
} from "../thunks/banner-thunks";


const initialState: BannerManagementState = {
  data: null,
  rollbackSnapshot: null,
  selectedBanner: null,
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


const bannerSlice = createSlice({
  name: "banners",
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

    clearSelectedBanner: (state) => {
      state.selectedBanner = null;
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
      .addCase(fetchAllBannerService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBannerService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllBannerService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchBannerByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedBanner = null;
      })
      .addCase(fetchBannerByIdService.fulfilled, (state, action) => {
        state.selectedBanner = action.payload;
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
      .addCase(fetchBannerByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(createBannerService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createBannerService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createBannerService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updateBannerService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBannerService.fulfilled, (state, action) => {
        state.selectedBanner = action.payload;
        state.operations.isUpdating = false;


        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user
          );
        }
      })
      .addCase(updateBannerService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteBannerService.pending, (state, action) => {
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
      .addCase(deleteBannerService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deleteBannerService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
        if (state.rollbackSnapshot) {
          state.data = state.rollbackSnapshot;
          state.rollbackSnapshot = null;
        }
      });

    builder
      .addCase(toggleBannerStatusService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(toggleBannerStatusService.fulfilled, (state, action) => {
        state.operations.isUpdating = false;


        if (state.data) {
          state.data.content = state.data.content.map((banner) =>
            banner.id === action.payload.id ? action.payload : banner
          );
        }
      })
      .addCase(toggleBannerStatusService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  clearError,
  setStatusFilter,
  clearSelectedBanner,
  resetFilters,
  resetState,
} = bannerSlice.actions;

export default bannerSlice.reducer;
