/**
 * home-slice.ts
 * Redux store for home page data and pagination
 * Handles: banners, categories, promotions, featured products, brands
 * Features: infinite scroll pagination, scroll position restoration, section loading states
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BannerResponseModel } from "@/redux/features/master-data/store/models/response/banner-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";

import {
  fetchHomeBanners,
  fetchHomeCategories,
  fetchHomePromotionProducts,
  fetchHomeFeaturedProducts,
  fetchHomeBrands,
} from "../thunks/home-thunks";

/** State for individual sections (loading, loaded, error) */
interface SectionState {
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

/** Pagination info for paginated sections (featured products) */
interface PaginationState {
  currentPage: number;
  hasMore: boolean;
  totalPages: number;
}

/** Complete home page Redux state */
interface HomePageState {
  // Data
  banners: BannerResponseModel[];
  categories: CategoriesResponseModel[];
  promotionProducts: ProductDetailResponseModel[];
  featuredProducts: ProductDetailResponseModel[];
  brands: BrandResponseModel[];

  // Section loading/error states
  sections: {
    banners: SectionState;
    categories: SectionState;
    promotionProducts: SectionState;
    featuredProducts: SectionState;
    brands: SectionState;
  };

  // Pagination for featured products (infinite scroll)
  featuredPagination: PaginationState;

  // Page metadata
  initialLoadComplete: boolean;
  lastFetchTimestamp: number | null;
  scrollY: number;
}

/** Default section state - loading: false, loaded: false, error: null */
const initialSectionState: SectionState = {
  loading: false,
  loaded: false,
  error: null,
};

/** Default pagination state - page 1, has more data */
const initialPaginationState: PaginationState = {
  currentPage: 1,
  hasMore: true,
  totalPages: 1,
};

/** Initial home page state */
const initialState: HomePageState = {
  banners: [],
  categories: [],
  promotionProducts: [],
  featuredProducts: [],
  brands: [],
  sections: {
    banners: { ...initialSectionState },
    categories: { ...initialSectionState },
    promotionProducts: { ...initialSectionState },
    featuredProducts: { ...initialSectionState },
    brands: { ...initialSectionState },
  },
  featuredPagination: { ...initialPaginationState },
  initialLoadComplete: false,
  lastFetchTimestamp: null,
  scrollY: 0,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    // Simple action - just save the number
    setScrollY: (state, action: PayloadAction<number>) => {
      state.scrollY = action.payload;
    },

    setInitialLoadComplete: (state) => {
      state.initialLoadComplete = true;
      state.lastFetchTimestamp = Date.now();
    },

    resetFeaturedPagination: (state) => {
      state.featuredPagination = {
        currentPage: 1,
        hasMore: true,
        totalPages: 1,
      };
      state.featuredProducts = [];
      state.sections.featuredProducts.loaded = false;
    },

    forceRefresh: (state) => {
      // Reset all data and states for full page refresh
      state.banners = [];
      state.categories = [];
      state.promotionProducts = [];
      state.featuredProducts = [];
      state.brands = [];
      state.sections = {
        banners: { ...initialSectionState },
        categories: { ...initialSectionState },
        promotionProducts: { ...initialSectionState },
        featuredProducts: { ...initialSectionState },
        brands: { ...initialSectionState },
      };
      state.featuredPagination = { ...initialPaginationState };
      state.initialLoadComplete = false;
      state.lastFetchTimestamp = null;
      state.scrollY = 0;
    },

    resetHomeState: () => initialState,
  },

  extraReducers: (builder) => {
    // Helper: Handle standard section loading (pending/rejected)
    const addSectionPending = (action: any, sectionKey: keyof HomePageState["sections"]) => {
      builder.addCase(action.pending, (state) => {
        state.sections[sectionKey].loading = true;
        state.sections[sectionKey].error = null;
      });
      builder.addCase(action.rejected, (state, { payload }) => {
        state.sections[sectionKey].loading = false;
        state.sections[sectionKey].error = payload as string;
      });
    };

    // Banners
    addSectionPending(fetchHomeBanners, "banners");
    builder.addCase(fetchHomeBanners.fulfilled, (state, action) => {
      state.banners = action.payload || [];
      state.sections.banners.loading = false;
      state.sections.banners.loaded = true;
    });

    // Categories
    addSectionPending(fetchHomeCategories, "categories");
    builder.addCase(fetchHomeCategories.fulfilled, (state, action) => {
      state.categories = action.payload.content || [];
      state.sections.categories.loading = false;
      state.sections.categories.loaded = true;
    });

    // Promotion Products
    addSectionPending(fetchHomePromotionProducts, "promotionProducts");
    builder.addCase(fetchHomePromotionProducts.fulfilled, (state, action) => {
      state.promotionProducts = action.payload.content || [];
      state.sections.promotionProducts.loading = false;
      state.sections.promotionProducts.loaded = true;
    });

    // Featured Products (Paginated with infinite scroll)
    addSectionPending(fetchHomeFeaturedProducts, "featuredProducts");
    builder.addCase(fetchHomeFeaturedProducts.fulfilled, (state, action) => {
      const newProducts = action.payload.content || [];

      // Append new products to existing (Facebook-style infinite scroll)
      // Backend handles pagination, no deduplication needed
      state.featuredProducts = [...state.featuredProducts, ...newProducts];

      // Update pagination info
      state.featuredPagination.currentPage = action.payload.pageNo || 1;
      state.featuredPagination.totalPages = action.payload.totalPages || 1;
      state.featuredPagination.hasMore = !action.payload.last;
      state.sections.featuredProducts.loading = false;
      state.sections.featuredProducts.loaded = true;
    });

    // Brands
    addSectionPending(fetchHomeBrands, "brands");
    builder.addCase(fetchHomeBrands.fulfilled, (state, action) => {
      state.brands = action.payload.content || [];
      state.sections.brands.loading = false;
      state.sections.brands.loaded = true;
    });
  },
});

export const {
  setScrollY,
  setInitialLoadComplete,
  resetFeaturedPagination,
  forceRefresh,
  resetHomeState,
} = homeSlice.actions;

export default homeSlice.reducer;
