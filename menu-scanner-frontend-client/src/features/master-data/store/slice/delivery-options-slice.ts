


import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DeliveryOptionsManagementState } from "../models/type/delivery-options-type";
import { Status } from "@/constants/status/status";
import {
  createDeliveryOptionsService,
  deleteDeliveryOptionsService,
  fetchAllDeliveryOptionsService,
  fetchMyBusinessDeliveryOptionsService,
  fetchDeliveryOptionsByIdService,
  updateDeliveryOptionsService,
  toggleDeliveryOptionsStatusService,
} from "../thunks/delivery-options-thunks";


const initialState: DeliveryOptionsManagementState = {
  data: null,
  rollbackSnapshot: null,
  selectedDeliveryOptions: null,
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


const deliveryOptionsSlice = createSlice({
  name: "delivery-options",
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

    clearSelectedDeliveryOptions: (state) => {
      state.selectedDeliveryOptions = null;
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
      .addCase(fetchAllDeliveryOptionsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllDeliveryOptionsService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllDeliveryOptionsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchMyBusinessDeliveryOptionsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBusinessDeliveryOptionsService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchMyBusinessDeliveryOptionsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchDeliveryOptionsByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedDeliveryOptions = null;
      })
      .addCase(fetchDeliveryOptionsByIdService.fulfilled, (state, action) => {
        state.selectedDeliveryOptions = action.payload;
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
      .addCase(fetchDeliveryOptionsByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(createDeliveryOptionsService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createDeliveryOptionsService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createDeliveryOptionsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updateDeliveryOptionsService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateDeliveryOptionsService.fulfilled, (state, action) => {
        state.selectedDeliveryOptions = action.payload;
        state.operations.isUpdating = false;


        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user
          );
        }
      })
      .addCase(updateDeliveryOptionsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteDeliveryOptionsService.pending, (state, action) => {
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
      .addCase(deleteDeliveryOptionsService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deleteDeliveryOptionsService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
        if (state.rollbackSnapshot) {
          state.data = state.rollbackSnapshot;
          state.rollbackSnapshot = null;
        }
      });

    builder
      .addCase(toggleDeliveryOptionsStatusService.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleDeliveryOptionsStatusService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = state.data.content.map((deliveryOption) =>
            deliveryOption.id === action.payload.id ? action.payload : deliveryOption
          );
        }
      })
      .addCase(toggleDeliveryOptionsStatusService.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  clearError,
  setStatusFilter,
  clearSelectedDeliveryOptions,
  resetFilters,
  resetState,
} = deliveryOptionsSlice.actions;

export default deliveryOptionsSlice.reducer;
