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
import { Skeleton } from "@/components/ui/skeleton";
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

  // Always-current ref — readable inside event listeners without stale closure
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

  // ── pageshow / bfcache / Router-Cache handler ────────────────────────────
  // Covers two "re-show" scenarios where useEffect([]) does NOT re-run:
  //
  //  A. bfcache (persisted=true): browser froze the full document; React is
  //     NOT remounted.  Any in-flight fetch was cancelled → Redux may be empty.
  //
  //  B. Next.js Router Cache (persisted=false): the router reuses the cached
  //     React tree without remounting, so useEffect([]) is skipped too.
  //     pageshow still fires with persisted=false on every page visit.
  //
  // Strategy (same for both cases):
  //  1. All sections already populated → nothing to do.
  //  2. sessionStorage snapshot exists → restore instantly, no API call.
  //  3. No snapshot (only relevant for bfcache) → re-fetch from API.
  //     For persisted=false without a snapshot the normal fetch useEffect
  //     will handle it on a fresh mount, so we skip the API call there.
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      const s = sectionsRef.current;
      if (s.bannersLoaded && s.categoriesLoaded && s.promotionsLoaded && s.featuredLoaded) {
        return; // data already present — nothing to do
      }

      // Try snapshot for BOTH bfcache and Router-Cache restores
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
        return; // snapshot covers all sections
      }

      // No snapshot — re-fetch missing sections sequentially.
      const pageSize = getPageSize();
      (async () => {
        if (!s.bannersLoaded) await dispatch(fetchHomeBanners({}));
        if (!sectionsRef.current.categoriesLoaded) await dispatch(fetchHomeCategories({ pageSize: 12 }));
        if (!sectionsRef.current.promotionsLoaded) await dispatch(fetchHomePromotionProducts({ pageSize: 24 }));
        if (!sectionsRef.current.featuredLoaded) await dispatch(fetchHomeFeaturedProducts({ pageNo: 1, pageSize }));
        dispatch(setInitialLoadComplete());
      })();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [dispatch, getPageSize]);

  // ── sessionStorage snapshot restore ─────────────────────────────────────
  // For hard navigations (URL bar, server redirect → back), Redux is recreated
  // empty. Restore a cached snapshot before the first fetch so the page has
  // instant content rather than waiting for the API.
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
  }, []); // only on mount


  // ── sequential waterfall fetch ───────────────────────────────────────────
  // Fetch banner → categories → promotions → featured one at a time so each
  // section's skeleton appears only after the previous section has resolved.
  // sectionsRef stays current across awaits so we can skip already-loaded sections.
  useEffect(() => {
    const run = async () => {
      const pageSize = getPageSize();

      if (!sectionsRef.current.bannersLoaded) {
        await dispatch(fetchHomeBanners({}));
      }
      if (!sectionsRef.current.categoriesLoaded) {
        await dispatch(fetchHomeCategories({ pageSize: 12 }));
      }
      if (!sectionsRef.current.promotionsLoaded) {
        await dispatch(fetchHomePromotionProducts({ pageSize: 24 }));
      }
      if (!sectionsRef.current.featuredLoaded) {
        await dispatch(fetchHomeFeaturedProducts({ pageNo: 1, pageSize }));
      }
      dispatch(setInitialLoadComplete());
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount — sectionsRef provides live state across awaits

  // ── persist snapshot ─────────────────────────────────────────────────────
  // Save as soon as banners + categories are loaded — don't wait for all
  // sections, because the user may navigate away before featured products finish.
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
      {/* All sections render immediately — each shows its own skeleton until
          its data arrives. API fetches happen sequentially (banner → categories
          → promotions → featured) so data fills in top-to-bottom. */}
      <div className="relative">
        <PageContainer className="pt-2 sm:pt-4">
          {/* BannerSection uses embla Autoplay which touches `window` on init.
              Render a plain skeleton before mount to avoid SSR blank, then
              hand off to BannerSection once the client is ready. */}
          {!mounted ? (
            <div className="w-full mb-3 sm:mb-5">
              <Skeleton className="w-full h-[180px] sm:h-[280px] md:h-[320px] lg:h-[360px] rounded" />
            </div>
          ) : (
            <BannerSection
              banners={banners}
              loading={!bannersSection.loaded}
              error={bannersSection.error}
            />
          )}
        </PageContainer>
      </div>

      {/* Categories — always in DOM, skeleton until loaded */}
      <div className="relative py-4 sm:py-7 bg-muted/5">
        <PageContainer>
          <CategoriesSection
            categories={categories}
            loading={!mounted || !categoriesSection.loaded}
            error={categoriesSection.error}
            title="Shop by Category"
          />
        </PageContainer>
      </div>

      {/* Promotions — always in DOM, skeleton until loaded */}
      <div className="relative py-4 sm:py-7 bg-amber-50/30 dark:bg-amber-950/10">
        <PageContainer>
          <PromotionsSection
            products={promotionProducts}
            loading={!mounted || !promotionProductsSection.loaded}
            error={promotionProductsSection.error}
            title="Hot Deals & Promotions"
          />
        </PageContainer>
      </div>

      {/* Featured products — always in DOM, skeleton until loaded */}
      <div className="relative py-4 sm:py-7">
        <PageContainer>
          <ProductsSection
            products={featuredProducts}
            loading={featuredProductsSection.loading}
            error={featuredProductsSection.error}
            title="Featured Products"
            subtitle="Handpicked products just for you"
            hasMore={featuredPagination.hasMore}
            onLoadMore={handleLoadMoreFeatured}
            isInitialLoading={!mounted || !featuredProductsSection.loaded}
            imageLoading="eager"
          />
        </PageContainer>
      </div>
    </div>
  );
}
