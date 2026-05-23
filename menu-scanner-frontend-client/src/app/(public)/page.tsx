"use client";

import React, { useEffect, useCallback, useMemo, useRef } from "react";

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

  // On mount: restore sessionStorage snapshot so back-navigation shows
  // instant content instead of empty state while the API re-fetches.
  // We still always run the normal fetch — the snapshot is only an initial
  // data source, not a fetch gate. Sections won't show skeleton if they
  // already have data (banners.length > 0) even while loading.
  useEffect(() => {
    const allEmpty =
      !bannersSection.loaded &&
      !categoriesSection.loaded &&
      !promotionProductsSection.loaded &&
      !featuredProductsSection.loaded;

    console.log("[HomePage] mount effect - allEmpty:", allEmpty, {
      bannersLoaded: bannersSection.loaded,
      categoriesLoaded: categoriesSection.loaded,
      promotionsLoaded: promotionProductsSection.loaded,
      featuredLoaded: featuredProductsSection.loaded,
    });

    if (allEmpty) {
      const snapshot = loadHomeSnapshot();
      console.log("[HomePage] snapshot from sessionStorage:", snapshot
        ? { banners: snapshot.banners.length, categories: snapshot.categories.length, age: Math.round((Date.now() - snapshot.timestamp) / 1000) + "s" }
        : null);

      if (snapshot && (snapshot.banners.length > 0 || snapshot.categories.length > 0)) {
        console.log("[HomePage] restoring snapshot into Redux");
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
  }, []); // only on initial mount

  const isInitialFeaturedLoading =
    featuredProductsSection.loading &&
    featuredProducts.length === 0 &&
    !featuredProductsSection.loaded;

  useEffect(() => {
    console.log("[HomePage] fetch effect running", {
      bannersLoaded: bannersSection.loaded, bannersLoading: bannersSection.loading,
      categoriesLoaded: categoriesSection.loaded, categoriesLoading: categoriesSection.loading,
    });

    const loadData = async () => {
      const promises = [];
      const pageSize = getPageSize();

      if (!bannersSection.loaded && !bannersSection.loading) {
        console.log("[HomePage] dispatching fetchHomeBanners");
        promises.push(dispatch(fetchHomeBanners({})));
      }

      if (!categoriesSection.loaded && !categoriesSection.loading) {
        console.log("[HomePage] dispatching fetchHomeCategories");
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
        console.log("[HomePage] waiting for", promises.length, "fetch(es)");
        await Promise.allSettled(promises);
        dispatch(setInitialLoadComplete());
        console.log("[HomePage] all fetches done");
      } else {
        console.log("[HomePage] all sections already loaded or loading — no fetch needed");
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

  // Persist snapshot to sessionStorage once all sections are loaded.
  useEffect(() => {
    if (
      bannersSection.loaded &&
      categoriesSection.loaded &&
      promotionProductsSection.loaded &&
      featuredProductsSection.loaded &&
      (banners.length > 0 || categories.length > 0)
    ) {
      console.log("[HomePage] saving snapshot to sessionStorage", { banners: banners.length, categories: categories.length });
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
