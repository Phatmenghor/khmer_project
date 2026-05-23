"use client";

import React, { useEffect, useLayoutEffect, useCallback, useMemo, useRef } from "react";

import {
  fetchHomeBanners,
  fetchHomeCategories,
  fetchHomePromotionProducts,
  fetchHomeFeaturedProducts,
} from "@/features/main/store/thunks/home-thunks";

import {
  setInitialLoadComplete,
  restoreHomeSnapshot,
} from "@/features/main/store/slice/home-slice";

import { useHomeState } from "@/features/main/store/state/home-state";

import { BannerSection } from "@/features/main/components/home/banner-section";
import { CategoriesSection } from "@/features/main/components/home/categories-section";
import { PromotionsSection } from "@/features/main/components/home/promotions-section";
import { ProductsSection } from "@/features/main/components/home/products-section";
import { PageContainer } from "@/components/shared/common/page-container";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { saveHomeSnapshot, loadHomeSnapshot } from "@/utils/common/home-cache";

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

  useScrollRestoration({
    enabled: true,
    restoreOnMount: true,
    customKey: "home",
  });

  const getPageSize = useMemo(() => {
    return () => {
      if (typeof window === "undefined") return 20;
      const width = window.innerWidth;
      if (width >= 1280) return 36;
      if (width >= 768) return 20;
      return 15;
    };
  }, []);

  // Tracks whether we just hydrated from sessionStorage so the fetch
  // effect skips its first run (which would otherwise set loading=true
  // and replace the restored content with a skeleton).
  const justRestoredRef = useRef(false);

  // Run synchronously before the browser paints so restored content is
  // visible on the very first frame (no empty flash).
  useLayoutEffect(() => {
    const allEmpty =
      !bannersSection.loaded &&
      !categoriesSection.loaded &&
      !promotionProductsSection.loaded &&
      !featuredProductsSection.loaded;

    if (allEmpty) {
      const snapshot = loadHomeSnapshot();
      if (snapshot && (snapshot.banners.length > 0 || snapshot.categories.length > 0)) {
        justRestoredRef.current = true;
        dispatch(
          restoreHomeSnapshot({
            banners: snapshot.banners as never,
            categories: snapshot.categories as never,
            promotionProducts: snapshot.promotionProducts as never,
            featuredProducts: snapshot.featuredProducts as never,
            brands: snapshot.brands as never,
            featuredPagination: snapshot.featuredPagination,
          })
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only on mount — stale values are fine here

  const isInitialFeaturedLoading =
    featuredProductsSection.loading &&
    featuredProducts.length === 0 &&
    !featuredProductsSection.loaded;

  useEffect(() => {
    // Skip the very first run after a snapshot restore. The next run
    // (triggered by the loaded flags changing to true) will see loaded=true
    // and correctly skip all fetches.
    if (justRestoredRef.current) {
      justRestoredRef.current = false;
      return;
    }

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

  // Persist a snapshot to sessionStorage when all sections finish loading
  // so back-navigation from hard reloads can show instant content.
  useEffect(() => {
    if (
      bannersSection.loaded &&
      categoriesSection.loaded &&
      promotionProductsSection.loaded &&
      featuredProductsSection.loaded &&
      (banners.length > 0 || categories.length > 0)
    ) {
      saveHomeSnapshot({
        banners,
        categories,
        promotionProducts,
        featuredProducts,
        brands: [],
        featuredPagination,
      });
    }
  }, [
    bannersSection.loaded,
    categoriesSection.loaded,
    promotionProductsSection.loaded,
    featuredProductsSection.loaded,
    banners,
    categories,
    promotionProducts,
    featuredProducts,
    featuredPagination,
  ]);

  const handleLoadMoreFeatured = useCallback(() => {
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
      {}
      <div className="relative">
        <PageContainer className="pt-3 sm:pt-6">
          <BannerSection
            banners={banners}
            loading={bannersSection.loading}
            error={bannersSection.error}
          />
        </PageContainer>
      </div>

      {}
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

      {}
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

      {}
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
