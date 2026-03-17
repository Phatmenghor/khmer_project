/**
 * Public Brands Slice
 * Manages brands data for public-facing pages with caching and scroll restoration
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { fetchPublicBrands } from "../thunks/public-brands-thunks";

export interface PublicBrandsState {
  brands: BrandResponseModel[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasMore: boolean;
  };
  loading: {
    initial: boolean;
    loadMore: boolean;
  };
  error: string | null;
  loaded: boolean; // Track if data has been loaded
}

const initialState: PublicBrandsState = {
  brands: [],
  pagination: {
    currentPage: 1,
    pageSize: 12,
    totalPages: 0,
    totalElements: 0,
    hasMore: true,
  },
  loading: {
    initial: false,
    loadMore: false,
  },
  error: null,
  loaded: false,
};

const publicBrandsSlice = createSlice({
  name: "publicBrands",
  initialState,
  reducers: {
    clearBrands: (state) => {
      state.brands = [];
      state.pagination = initialState.pagination;
      state.loaded = false;
    },
    resetBrandsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch brands
      .addCase(fetchPublicBrands.pending, (state, action) => {
        const isLoadMore = action.meta.arg.append;
        if (isLoadMore) {
          state.loading.loadMore = true;
        } else {
          state.loading.initial = true;
        }
        state.error = null;
      })
      .addCase(fetchPublicBrands.fulfilled, (state, action) => {
        const { content, pageNo, pageSize, totalPages, totalElements } =
          action.payload;
        const isLoadMore = action.meta.arg.append;

        if (isLoadMore) {
          // Memory optimization: Keep only last 3 pages of data (like YouTube)
          const MAX_PAGES_IN_MEMORY = 3;
          const maxItems = MAX_PAGES_IN_MEMORY * pageSize;

          // Append new brands
          const updatedBrands = [...state.brands, ...content];

          // If we exceed the limit, remove oldest items
          if (updatedBrands.length > maxItems) {
            const itemsToRemove = updatedBrands.length - maxItems;
            state.brands = updatedBrands.slice(itemsToRemove);
          } else {
            state.brands = updatedBrands;
          }
        } else {
          // Replace brands
          state.brands = content;
        }

        state.pagination = {
          currentPage: pageNo,
          pageSize,
          totalPages,
          totalElements,
          hasMore: pageNo < totalPages,
        };

        state.loading.initial = false;
        state.loading.loadMore = false;
        state.loaded = true;
      })
      .addCase(fetchPublicBrands.rejected, (state, action) => {
        state.loading.initial = false;
        state.loading.loadMore = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBrands, resetBrandsState } = publicBrandsSlice.actions;
export default publicBrandsSlice.reducer;
