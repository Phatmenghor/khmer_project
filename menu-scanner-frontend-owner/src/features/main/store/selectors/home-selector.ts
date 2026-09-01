


import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectHomeState = (state: RootState) => state.home;


export const selectHomeBanners = (state: RootState) => state.home.banners;
export const selectHomeCategories = (state: RootState) => state.home.categories;
export const selectHomePromotionProducts = (state: RootState) =>
  state.home.promotionProducts;
export const selectHomeFeaturedProducts = (state: RootState) =>
  state.home.featuredProducts;
export const selectHomeBrands = (state: RootState) => state.home.brands;


export const selectSections = (state: RootState) => state.home.sections;
export const selectBannersSection = (state: RootState) =>
  state.home.sections.banners;
export const selectCategoriesSection = (state: RootState) =>
  state.home.sections.categories;
export const selectPromotionProductsSection = (state: RootState) =>
  state.home.sections.promotionProducts;
export const selectFeaturedProductsSection = (state: RootState) =>
  state.home.sections.featuredProducts;
export const selectBrandsSection = (state: RootState) =>
  state.home.sections.brands;


export const selectFeaturedPagination = (state: RootState) =>
  state.home.featuredPagination;


export const selectScrollY = (state: RootState) => state.home.scrollY;


export const selectAllSectionsLoaded = createSelector(
  [selectSections],
  (sections) =>
    sections.banners.loaded &&
    sections.categories.loaded &&
    sections.promotionProducts.loaded &&
    sections.featuredProducts.loaded &&
    sections.brands.loaded
);
