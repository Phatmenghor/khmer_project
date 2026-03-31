import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductStockDto, ProductStockListResponse } from "../models/response/stock-response";
import {
  createProductStockService,
  getProductStockHistoryService,
  updateProductStockService,
  deleteProductStockService,
} from "../thunks/stock-management-thunks";

interface StockManagementState {
  history: ProductStockListResponse | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: StockManagementState = {
  history: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  successMessage: null,
};

const stockManagementSlice = createSlice({
  name: "stock-management",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Create Product Stock
    builder
      .addCase(createProductStockService.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createProductStockService.fulfilled, (state, action) => {
        state.isCreating = false;
        state.successMessage = "Stock created successfully";
        // Add to history if available
        if (state.history) {
          state.history.content.unshift(action.payload);
          state.history.totalElements += 1;
        }
      })
      .addCase(createProductStockService.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Get Product Stock History
    builder
      .addCase(getProductStockHistoryService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProductStockHistoryService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = action.payload;
      })
      .addCase(getProductStockHistoryService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Product Stock
    builder
      .addCase(updateProductStockService.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProductStockService.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.successMessage = "Stock updated successfully";
        // Update in history if available
        if (state.history) {
          const index = state.history.content.findIndex(
            (s) => s.id === action.payload.id
          );
          if (index !== -1) {
            state.history.content[index] = action.payload;
          }
        }
      })
      .addCase(updateProductStockService.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete Product Stock
    builder
      .addCase(deleteProductStockService.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteProductStockService.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.successMessage = "Stock deleted successfully";
        // Remove from history if available
        if (state.history) {
          state.history.content = state.history.content.filter(
            (s) => s.id !== action.payload
          );
          state.history.totalElements -= 1;
        }
      })
      .addCase(deleteProductStockService.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess } = stockManagementSlice.actions;
export default stockManagementSlice.reducer;
