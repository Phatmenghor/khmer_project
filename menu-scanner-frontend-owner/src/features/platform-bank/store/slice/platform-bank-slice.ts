import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PlatformBankManagementState } from "../models/type/platform-bank-type";
import {
  createPlatformBankService,
  deletePlatformBankService,
  fetchAllPlatformBanksService,
  fetchPlatformBankByIdService,
  fetchPublicActivePlatformBanksService,
  updatePlatformBankService,
} from "../thunks/platform-bank-thunks";

const initialState: PlatformBankManagementState = {
  data: null,
  selectedBank: null,
  publicBanks: null,
  isFetchingPublic: false,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    status: "",
    pageNo: 1,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

const platformBankSlice = createSlice({
  name: "platform-banks",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.filters.pageNo = 1;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedBank: (state) => {
      state.selectedBank = null;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch all (admin)
    builder
      .addCase(fetchAllPlatformBanksService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPlatformBanksService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllPlatformBanksService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch by ID
    builder
      .addCase(fetchPlatformBankByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
      })
      .addCase(fetchPlatformBankByIdService.fulfilled, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.selectedBank = action.payload;
      })
      .addCase(fetchPlatformBankByIdService.rejected, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createPlatformBankService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createPlatformBankService.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        if (state.data?.content) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
        }
      })
      .addCase(createPlatformBankService.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updatePlatformBankService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePlatformBankService.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.selectedBank = action.payload;
        if (state.data?.content) {
          state.data.content = state.data.content.map((item) =>
            item.id === action.payload.id ? action.payload : item
          );
        }
      })
      .addCase(updatePlatformBankService.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete
    builder
      .addCase(deletePlatformBankService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deletePlatformBankService.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        if (state.data?.content) {
          state.data.content = state.data.content.filter(
            (item) => item.id !== action.meta.arg
          );
          state.data.totalElements = Math.max(0, state.data.totalElements - 1);
        }
      })
      .addCase(deletePlatformBankService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
      });

    // Fetch Public Banks
    builder
      .addCase(fetchPublicActivePlatformBanksService.pending, (state) => {
        state.isFetchingPublic = true;
        state.error = null;
      })
      .addCase(fetchPublicActivePlatformBanksService.fulfilled, (state, action) => {
        state.isFetchingPublic = false;
        state.publicBanks = action.payload;
      })
      .addCase(fetchPublicActivePlatformBanksService.rejected, (state, action) => {
        state.isFetchingPublic = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchFilter,
  setStatusFilter,
  setPageNo,
  clearError,
  clearSelectedBank,
  resetFilters,
  resetState,
} = platformBankSlice.actions;

export default platformBankSlice.reducer;
