"use client";

import React, { useEffect, useCallback } from "react";

import {
  fetchHomeBanners,
  fetchHomeCategories,
  fetchHomePromotionProducts,
  fetchHomeFeaturedProducts,
} from "@/redux/features/main/store/thunks/home-thunks";

import { setInitialLoadComplete } from "@/redux/features/main/store/slice/home-slice";

import { useHomeState } from "@/redux/features/main/store/state/home-state";

import { BannerSection } from "@/redux/features/main/components/home/banner-section";
import { CategoriesSection } from "@/redux/features/main/components/home/categories-section";
import { PromotionsSection } from "@/redux/features/main/components/home/promotions-section";
import { ProductsSection } from "@/redux/features/main/components/home/products-section";
import { PageContainer } from "@/components/shared/common/page-container";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";

export default function HomePage() {
  const {
    dispatch,
    banners,
    categories,
    promotionProducts,
    featuredProducts,
    bannersSection,
    categoriesSection,
    promotionProductsSection,
    featuredProductsSection,
    featuredPagination,
  } = useHomeState();

  // Smart scroll: Keep position on navigation, reset on browser refresh
  useScrollRestoration({
    enabled: true,
    restoreOnMount: true,
    customKey: "home",
  });

  // Calculate responsive page size based on screen width
  const getPageSize = React.useCallback(() => {
    if (typeof window === "undefined") return 20;
    const width = window.innerWidth;
    if (width >= 1280) return 36; // Large desktop
    if (width >= 768) return 20;  // Tablet
    return 15;                     // Mobile
  }, []);

  const isInitialFeaturedLoading =
    featuredProductsSection.loading &&
    featuredProducts.length === 0 &&
    !featuredProductsSection.loaded;

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      const promises = [];
      const pageSize = getPageSize();

      if (!bannersSection.loaded && !bannersSection.loading) {
        promises.push(dispatch(fetchHomeBanners({})));
      }

      if (!categoriesSection.loaded && !categoriesSection.loading) {
        promises.push(dispatch(fetchHomeCategories({ pageSize: 12 })));
      }

      if (!promotionProductsSection.loaded && !promotionProductsSection.loading) {
        promises.push(dispatch(fetchHomePromotionProducts({ pageSize: 24 })));
      }

      if (!featuredProductsSection.loaded && !featuredProductsSection.loading) {
        promises.push(
          dispatch(fetchHomeFeaturedProducts({ pageNo: 1, pageSize })),
        );
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        dispatch(setInitialLoadComplete());
      }
    };

    loadData();
  }, [
    dispatch,
    getPageSize,
    bannersSection.loaded,
    categoriesSection.loaded,
    promotionProductsSection.loaded,
    featuredProductsSection.loaded,
  ]);

  // Load more featured products - stable callback to prevent observer re-initialization
  const handleLoadMoreFeatured = useCallback(() => {
    // Check conditions inside the callback to avoid unnecessary re-renders
    if (
      featuredPagination.hasMore &&
      !featuredProductsSection.loading &&
      featuredProducts.length > 0
    ) {
      const nextPage = featuredPagination.currentPage + 1;
      const pageSize = getPageSize();
      dispatch(fetchHomeFeaturedProducts({ pageNo: nextPage, pageSize }));
    }
  }, [
    dispatch,
    getPageSize,
    featuredPagination.hasMore,
    featuredPagination.currentPage,
    featuredProductsSection.loading,
    featuredProducts.length,
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner Section */}
      <div className="relative">
        <PageContainer className="pt-3 sm:pt-6">
          <BannerSection
            banners={banners}
            loading={bannersSection.loading}
            error={bannersSection.error}
          />
        </PageContainer>
      </div>

      {/* Categories Section - With Background */}
      <div className="relative py-6 sm:py-10 bg-muted/5">
        <PageContainer>
          <CategoriesSection
            categories={categories}
            loading={categoriesSection.loading}
            error={categoriesSection.error}
            title="Shop by Category"
          />
        </PageContainer>
      </div>

      {/* Promotions Section - Highlighted Background */}
      <div className="relative py-6 sm:py-10 bg-amber-50/30 dark:bg-amber-950/10">
        <PageContainer>
          <PromotionsSection
            products={promotionProducts}
            loading={promotionProductsSection.loading}
            error={promotionProductsSection.error}
            title="Hot Deals & Promotions"
          />
        </PageContainer>
      </div>

      {/* Featured Products Section */}
      <div className="relative py-6 sm:py-10">
        <PageContainer>
          <ProductsSection
            products={featuredProducts}
            loading={featuredProductsSection.loading}
            error={featuredProductsSection.error}
            title="Featured Products"
            subtitle="Handpicked products just for you"
            hasMore={featuredPagination.hasMore}
            onLoadMore={handleLoadMoreFeatured}
            isInitialLoading={isInitialFeaturedLoading}
          />
        </PageContainer>
      </div>
    </div>
  );
}
