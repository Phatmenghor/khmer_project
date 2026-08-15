"use client";

import React, { useEffect, useCallback, useMemo, useRef, useState } from "react";
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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
    enabled: false,
    restoreOnMount: false,
    customKey: "home",
  });

  const getPageSize = useMemo(() => {
    return () => 15;
  }, []);

  const sectionsRef = useRef({
    bannersLoaded: bannersSection.loaded,
    categoriesLoaded: categoriesSection.loaded,
    promotionsLoaded: promotionProductsSection.loaded,
    featuredLoaded: featuredProductsSection.loaded,
  });
  sectionsRef.current = {
    bannersLoaded: bannersSection.loaded,
    categoriesLoaded: categoriesSection.loaded,
    promotionsLoaded: promotionProductsSection.loaded,
    featuredLoaded: featuredProductsSection.loaded,
  };

  // Restore snapshot or re-fetch missing sections on pageshow
  useEffect(() => {
    const handlePageShow = () => {
      const s = sectionsRef.current;
      if (s.bannersLoaded && s.categoriesLoaded && s.promotionsLoaded && s.featuredLoaded) return;

      const snapshot = loadHomeSnapshot();
      if (snapshot && (snapshot.banners.length > 0 || snapshot.categories.length > 0)) {
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
        return;
      }

      const pageSize = getPageSize();
      Promise.all([
        !s.bannersLoaded ? dispatch(fetchHomeBanners({})) : Promise.resolve(),
        !sectionsRef.current.categoriesLoaded ? dispatch(fetchHomeCategories({ pageSize: 15 })) : Promise.resolve(),
        !sectionsRef.current.promotionsLoaded ? dispatch(fetchHomePromotionProducts({ pageSize: 15 })) : Promise.resolve(),
        !sectionsRef.current.featuredLoaded ? dispatch(fetchHomeFeaturedProducts({ pageNo: 1, pageSize })) : Promise.resolve(),
      ]).then(() => {
        dispatch(setInitialLoadComplete());
      });
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [dispatch, getPageSize]);

  // Restore session snapshot on initial load
  useEffect(() => {
    const allEmpty =
      !bannersSection.loaded &&
      !categoriesSection.loaded &&
      !promotionProductsSection.loaded &&
      !featuredProductsSection.loaded;

    if (allEmpty) {
      const snapshot = loadHomeSnapshot();
      if (snapshot && (snapshot.banners.length > 0 || snapshot.categories.length > 0)) {
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
  }, []);

  // Save cache snapshot whenever home state updates
  useEffect(() => {
    if (banners.length > 0 || categories.length > 0 || featuredProducts.length > 0) {
      saveHomeSnapshot({
        banners,
        categories,
        promotionProducts,
        featuredProducts,
        brands: [],
        featuredPagination,
      });
    }
  }, [banners, categories, promotionProducts, featuredProducts, featuredPagination]);

  // Fetch all sections concurrently in parallel on mount
  useEffect(() => {
    const run = async () => {
      const pageSize = getPageSize();
      await Promise.all([
        dispatch(fetchHomeBanners({})),
        dispatch(fetchHomeCategories({ pageSize: 15 })),
        dispatch(fetchHomePromotionProducts({ pageSize: 15 })),
        dispatch(fetchHomeFeaturedProducts({ pageNo: 1, pageSize })),
      ]);
      dispatch(setInitialLoadComplete());
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save session snapshot when banners and categories load
  useEffect(() => {
    if (
      bannersSection.loaded &&
      categoriesSection.loaded &&
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
    banners,
    categories,
    promotionProducts,
    featuredProducts,
    featuredPagination,
  ]);

  const handleLoadMoreFeatured = useCallback(() => {
    if (featuredProductsSection.loading || !featuredPagination.hasMore) return;
    const nextPage = featuredPagination.currentPage + 1;
    const pageSize = getPageSize();
    dispatch(fetchHomeFeaturedProducts({ pageNo: nextPage, pageSize }));
  }, [
    dispatch,
    featuredProductsSection.loading,
    featuredPagination.hasMore,
    featuredPagination.currentPage,
    getPageSize,
  ]);

  const isInitialLoading = useMemo(() => {
    return (
      (bannersSection.loading && banners.length === 0) ||
      (categoriesSection.loading && categories.length === 0) ||
      (featuredProductsSection.loading && featuredProducts.length === 0)
    );
  }, [
    bannersSection.loading,
    banners.length,
    categoriesSection.loading,
    categories.length,
    featuredProductsSection.loading,
    featuredProducts.length,
  ]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-primary/5 blur-[160px] rounded-full opacity-60" />

      <PageContainer className="py-4 sm:py-6 lg:py-8 space-y-8 sm:space-y-12 relative z-10">
        <BannerSection
          banners={banners}
          loading={bannersSection.loading}
          error={bannersSection.error}
          isInitialLoading={isInitialLoading}
        />

        <CategoriesSection
          categories={categories}
          loading={categoriesSection.loading}
          error={categoriesSection.error}
          isInitialLoading={isInitialLoading}
        />

        <PromotionsSection
          products={promotionProducts}
          loading={promotionProductsSection.loading}
          error={promotionProductsSection.error}
          isInitialLoading={isInitialLoading}
        />

        <ProductsSection
          products={featuredProducts}
          loading={featuredProductsSection.loading}
          error={featuredProductsSection.error}
          hasMore={featuredPagination.hasMore}
          onLoadMore={handleLoadMoreFeatured}
          isInitialLoading={isInitialLoading}
          imageLoading={mounted ? "lazy" : "eager"}
          title="Featured Products"
          subtitle="Handpicked products just for you"
        />
      </PageContainer>
    </div>
  );
}
