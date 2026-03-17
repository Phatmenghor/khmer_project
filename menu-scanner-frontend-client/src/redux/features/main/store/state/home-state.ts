/**
 * home-state.ts
 */

import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectHomeBanners,
  selectHomeCategories,
  selectHomePromotionProducts,
  selectHomeFeaturedProducts,
  selectHomeBrands,
  selectBannersSection,
  selectCategoriesSection,
  selectPromotionProductsSection,
  selectFeaturedProductsSection,
  selectBrandsSection,
  selectFeaturedPagination,
  selectScrollY,
  selectAllSectionsLoaded,
} from "../selectors/home-selector";

export const useHomeState = () => {
  const dispatch = useAppDispatch();

  return {
    dispatch,
    banners: useAppSelector(selectHomeBanners),
    categories: useAppSelector(selectHomeCategories),
    promotionProducts: useAppSelector(selectHomePromotionProducts),
    featuredProducts: useAppSelector(selectHomeFeaturedProducts),
    brands: useAppSelector(selectHomeBrands),
    bannersSection: useAppSelector(selectBannersSection),
    categoriesSection: useAppSelector(selectCategoriesSection),
    promotionProductsSection: useAppSelector(selectPromotionProductsSection),
    featuredProductsSection: useAppSelector(selectFeaturedProductsSection),
    brandsSection: useAppSelector(selectBrandsSection),
    featuredPagination: useAppSelector(selectFeaturedPagination),
    scrollY: useAppSelector(selectScrollY), // Simple!
    allSectionsLoaded: useAppSelector(selectAllSectionsLoaded),
  };
};
