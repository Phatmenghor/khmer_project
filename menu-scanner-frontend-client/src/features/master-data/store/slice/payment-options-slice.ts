


import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PaymentOptionsManagementState } from "../models/type/payment-options-type";
import { Status } from "@/constants/status/status";
import {
  createPaymentOptionService,
  deletePaymentOptionService,
  fetchAllPaymentOptionsService,
  fetchMyBusinessPaymentOptionsService,
  fetchPublicPaymentOptionsService,
  fetchPaymentOptionByIdService,
  updatePaymentOptionService,
} from "../thunks/payment-options-thunks";


const initialState: PaymentOptionsManagementState = {
  data: null,
  rollbackSnapshot: null,
  selectedPaymentOption: null,
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


const paymentOptionsSlice = createSlice({
  name: "payment-options",
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

    clearSelectedPaymentOption: (state) => {
      state.selectedPaymentOption = null;
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
      .addCase(fetchAllPaymentOptionsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPaymentOptionsService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllPaymentOptionsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchMyBusinessPaymentOptionsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBusinessPaymentOptionsService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchMyBusinessPaymentOptionsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchPublicPaymentOptionsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicPaymentOptionsService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPublicPaymentOptionsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchPaymentOptionByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedPaymentOption = null;
      })
      .addCase(fetchPaymentOptionByIdService.fulfilled, (state, action) => {
        state.selectedPaymentOption = action.payload;
        state.operations.isFetchingDetail = false;


        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (option) => option.id === action.payload.id
          );
          if (index !== -1) {
            state.data.content[index] = action.payload;
          }
        }
      })
      .addCase(fetchPaymentOptionByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(createPaymentOptionService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createPaymentOptionService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createPaymentOptionService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updatePaymentOptionService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePaymentOptionService.fulfilled, (state, action) => {
        state.selectedPaymentOption = action.payload;
        state.operations.isUpdating = false;


        if (state.data) {
          state.data.content = state.data.content.map((option) =>
            option.id === action.payload.id ? action.payload : option
          );
        }
      })
      .addCase(updatePaymentOptionService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deletePaymentOptionService.pending, (state, action) => {
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
      .addCase(deletePaymentOptionService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deletePaymentOptionService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
        if (state.rollbackSnapshot) {
          state.data = state.rollbackSnapshot;
          state.rollbackSnapshot = null;
        }
      });

  },
});

export const {
  setSearchFilter,
  setPageNo,
  clearError,
  setStatusFilter,
  clearSelectedPaymentOption,
  resetFilters,
  resetState,
} = paymentOptionsSlice.actions;

export default paymentOptionsSlice.reducer;
