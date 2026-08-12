


import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BannerResponseModel } from "@/features/master-data/store/models/response/banner-response";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";

import {
  fetchHomeBanners,
  fetchHomeCategories,
  fetchHomePromotionProducts,
  fetchHomeFeaturedProducts,
  fetchHomeBrands,
} from "../thunks/home-thunks";


interface SectionState {
  loading: boolean;
  loaded: boolean;
  error: string | null;
}


interface PaginationState {
  currentPage: number;
  hasMore: boolean;
  totalPages: number;
}


interface HomePageState {

  banners: BannerResponseModel[];
  categories: CategoriesResponseModel[];
  promotionProducts: ProductDetailResponseModel[];
  featuredProducts: ProductDetailResponseModel[];
  brands: BrandResponseModel[];


  sections: {
    banners: SectionState;
    categories: SectionState;
    promotionProducts: SectionState;
    featuredProducts: SectionState;
    brands: SectionState;
  };


  featuredPagination: PaginationState;


  initialLoadComplete: boolean;
  lastFetchTimestamp: number | null;
  scrollY: number;
}


const initialSectionState: SectionState = {
  loading: false,
  loaded: false,
  error: null,
};


const initialPaginationState: PaginationState = {
  currentPage: 1,
  hasMore: true,
  totalPages: 1,
};


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

    restoreHomeSnapshot: (
      state,
      action: PayloadAction<{
        banners: BannerResponseModel[];
        categories: CategoriesResponseModel[];
        promotionProducts: ProductDetailResponseModel[];
        featuredProducts: ProductDetailResponseModel[];
        brands: BrandResponseModel[];
        featuredPagination: { currentPage: number; hasMore: boolean; totalPages: number };
      }>
    ) => {
      const p = action.payload;
      // Only restore a section if it hasn't been loaded yet.
      // This prevents the pageshow handler (which fires after a fast banner
      // fetch completes) from overwriting freshly-loaded data with stale/empty
      // snapshot data, which was causing the banner to disappear on refresh.
      const tryRestore = (
        key: keyof HomePageState["sections"],
        data: unknown[],
        apply: () => void,
      ) => {
        if (state.sections[key].loaded) return; // keep live data
        apply();
        state.sections[key].loaded = data.length > 0;
        state.sections[key].loading = false;
        state.sections[key].error = null;
      };
      tryRestore("banners", p.banners, () => { state.banners = p.banners; });
      tryRestore("categories", p.categories, () => { state.categories = p.categories; });
      tryRestore("promotionProducts", p.promotionProducts, () => { state.promotionProducts = p.promotionProducts; });
      tryRestore("featuredProducts", p.featuredProducts, () => {
        const seen = new Set<string>();
        state.featuredProducts = (p.featuredProducts || []).filter((item) => {
          if (!item?.id || seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        state.featuredPagination = p.featuredPagination;
      });
      tryRestore("brands", p.brands, () => { state.brands = p.brands; });
    },
  },

  extraReducers: (builder) => {

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


    addSectionPending(fetchHomeBanners, "banners");
    builder.addCase(fetchHomeBanners.fulfilled, (state, action) => {
      state.banners = action.payload || [];
      state.sections.banners.loading = false;
      state.sections.banners.loaded = true;
    });


    addSectionPending(fetchHomeCategories, "categories");
    builder.addCase(fetchHomeCategories.fulfilled, (state, action) => {
      state.categories = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.content || [];
      state.sections.categories.loading = false;
      state.sections.categories.loaded = true;
    });


    addSectionPending(fetchHomePromotionProducts, "promotionProducts");
    builder.addCase(fetchHomePromotionProducts.fulfilled, (state, action) => {
      state.promotionProducts = action.payload?.content || [];
      state.sections.promotionProducts.loading = false;
      state.sections.promotionProducts.loaded = true;
    });


    addSectionPending(fetchHomeFeaturedProducts, "featuredProducts");
    builder.addCase(fetchHomeFeaturedProducts.fulfilled, (state, action) => {
      const newProducts = action.payload?.content || [];
      const pageNo = action.payload?.pageNo || 1;

      if (pageNo === 1) {
        state.featuredProducts = newProducts;
      } else {
        const existingIds = new Set(state.featuredProducts.map((p) => p.id));
        const uniqueNew = newProducts.filter((p: ProductDetailResponseModel) => !existingIds.has(p.id));
        state.featuredProducts = [...state.featuredProducts, ...uniqueNew];
      }

      state.featuredPagination.currentPage = pageNo;
      state.featuredPagination.totalPages = action.payload?.totalPages || 1;
      state.featuredPagination.hasMore = !action.payload?.last;
      state.sections.featuredProducts.loading = false;
      state.sections.featuredProducts.loaded = true;
    });


    addSectionPending(fetchHomeBrands, "brands");
    builder.addCase(fetchHomeBrands.fulfilled, (state, action) => {
      state.brands = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.content || [];
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
  restoreHomeSnapshot,
} = homeSlice.actions;

export default homeSlice.reducer;
