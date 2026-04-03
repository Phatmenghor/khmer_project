"use client";

/**
 * Home Page Component
 *
 * Features:
 * - Multiple sections: banners, categories, promotions, featured products
 * - Infinite scroll pagination for featured products with smart debounce
 * - Responsive grid layouts
 * - Scroll position restoration
 * - Performance optimized: lazy section loading, memoization, debounced pagination
 */

import React, { useEffect, useCallback, useMemo } from "react";

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
import { VirtualizedProductsSection } from "@/redux/features/main/components/home/virtualized-products-section";
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

  /**
   * Calculate responsive page size based on screen width
   * Adjusts API request size to match device capabilities:
   * - Large desktop (≥ 1280px): 36 items (6 cols × 6 rows)
   * - Tablet (≥ 768px): 20 items (4-5 cols)
   * - Mobile (< 768px): 15 items (2-3 cols)
   *
   * Memoized to prevent recreation on every render
   */
  const getPageSize = useMemo(() => {
    return () => {
      if (typeof window === "undefined") return 20;
      const width = window.innerWidth;
      if (width >= 1280) return 36; // Large desktop
      if (width >= 768) return 20;  // Tablet
      return 15;                     // Mobile
    };
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

  /**
   * Load more featured products callback
   *
   * Design:
   * - Memoized to prevent unnecessary observer re-initialization
   * - Only depends on dispatch (thunk dispatch is stable)
   * - All condition checks happen inside callback for latest values
   * - Calculates pageSize dynamically to match current screen size
   *
   * Note: We intentionally don't include pagination/loading in dependencies
   * because those are checked inside the callback. This prevents observer
   * from being re-created on every pagination update.
   */
  const handleLoadMoreFeatured = useCallback(() => {
    // Check current state inside callback to get latest values
    if (
      featuredPagination.hasMore &&
      !featuredProductsSection.loading &&
      featuredProducts.length > 0
    ) {
      const nextPage = featuredPagination.currentPage + 1;
      const pageSize = getPageSize();
      dispatch(fetchHomeFeaturedProducts({ pageNo: nextPage, pageSize }));
    }
  }, [dispatch, getPageSize, featuredPagination, featuredProductsSection.loading, featuredProducts.length]);

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

      {/* Featured Products Section - Virtualized for Performance */}
      <div className="relative py-6 sm:py-10">
        <PageContainer>
          <VirtualizedProductsSection
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
