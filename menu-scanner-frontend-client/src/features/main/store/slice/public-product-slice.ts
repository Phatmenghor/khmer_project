import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import {
  fetchPublicProducts,
  fetchPublicProductById,
  fetchPublicCategories,
  fetchPublicBrands,
} from "../thunks/public-product-thunks";

interface PublicProductState {
  products: ProductDetailResponseModel[];
  selectedProduct: ProductDetailResponseModel | null;
  categories: string[];
  brands: string[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasMore: boolean;
  };
  loading: {
    list: boolean;
    detail: boolean;
    filters: boolean;
  };
  error: {
    list: string | null;
    detail: string | null;
    filters: string | null;
  };
  scrollY: number;
  loadedFilters: string;
}

const initialState: PublicProductState = {
  products: [],
  selectedProduct: null,
  categories: [],
  brands: [],
  pagination: {
    currentPage: 1,
    pageSize: 30,
    totalPages: 0,
    totalElements: 0,
    hasMore: false,
  },
  loading: {
    list: false,
    detail: false,
    filters: false,
  },
  error: {
    list: null,
    detail: null,
    filters: null,
  },
  scrollY: 0,
  loadedFilters: "",
};

const publicProductSlice = createSlice({
  name: "publicProducts",
  initialState,
  reducers: {
    setScrollY: (state, action: PayloadAction<number>) => {
      state.scrollY = action.payload;
    },

    setLoadedFilters: (state, action: PayloadAction<string>) => {
      state.loadedFilters = action.payload;
    },

    clearProducts: (state) => {
      state.products = [];
      state.pagination = initialState.pagination;
      state.scrollY = 0;
      state.loadedFilters = "";
    },

    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },

    resetPublicProductState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicProducts.pending, (state) => {
        state.loading.list = true;
        state.error.list = null;
      })
      .addCase(fetchPublicProducts.fulfilled, (state, action) => {
        const newProducts = action.payload.content || [];


        const existingIds = new Set(state.products.map((p) => p.id));
        const uniqueNew = newProducts.filter((p) => !existingIds.has(p.id));


        state.products = [...state.products, ...uniqueNew];

        state.loading.list = false;
        state.pagination = {
          currentPage: action.payload.pageNo,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
          hasMore: !action.payload.last,
        };
      })
      .addCase(fetchPublicProducts.rejected, (state, action) => {
        state.loading.list = false;
        state.error.list = action.payload as string;
      });

    builder
      .addCase(fetchPublicProductById.pending, (state) => {
        state.loading.detail = true;
        state.error.detail = null;
      })
      .addCase(fetchPublicProductById.fulfilled, (state, action) => {
        state.loading.detail = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchPublicProductById.rejected, (state, action) => {
        state.loading.detail = false;
        state.error.detail = action.payload as string;
      });

    builder
      .addCase(fetchPublicCategories.pending, (state) => {
        state.loading.filters = true;
      })
      .addCase(fetchPublicCategories.fulfilled, (state, action) => {
        state.loading.filters = false;
        state.categories = action.payload;
      })
      .addCase(fetchPublicCategories.rejected, (state) => {
        state.loading.filters = false;
      });

    builder
      .addCase(fetchPublicBrands.pending, (state) => {
        state.loading.filters = true;
      })
      .addCase(fetchPublicBrands.fulfilled, (state, action) => {
        state.loading.filters = false;
        state.brands = action.payload;
      })
      .addCase(fetchPublicBrands.rejected, (state) => {
        state.loading.filters = false;
      });
  },
});

export const {
  setScrollY,
  setLoadedFilters,
  clearProducts,
  clearSelectedProduct,
  resetPublicProductState,
} = publicProductSlice.actions;

export default publicProductSlice.reducer;
