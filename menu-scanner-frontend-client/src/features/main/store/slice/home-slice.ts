


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
      state.categories = action.payload.content || [];
      state.sections.categories.loading = false;
      state.sections.categories.loaded = true;
    });


    addSectionPending(fetchHomePromotionProducts, "promotionProducts");
    builder.addCase(fetchHomePromotionProducts.fulfilled, (state, action) => {
      state.promotionProducts = action.payload.content || [];
      state.sections.promotionProducts.loading = false;
      state.sections.promotionProducts.loaded = true;
    });


    addSectionPending(fetchHomeFeaturedProducts, "featuredProducts");
    builder.addCase(fetchHomeFeaturedProducts.fulfilled, (state, action) => {
      const newProducts = action.payload.content || [];


      state.featuredProducts = [...state.featuredProducts, ...newProducts];


      state.featuredPagination.currentPage = action.payload.pageNo || 1;
      state.featuredPagination.totalPages = action.payload.totalPages || 1;
      state.featuredPagination.hasMore = !action.payload.last;
      state.sections.featuredProducts.loading = false;
      state.sections.featuredProducts.loaded = true;
    });


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
