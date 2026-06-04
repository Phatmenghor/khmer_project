"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { usePublicBrandsState } from "@/features/main/store/state/public-brands-state";
import { Store, Loader2, CheckCircle2 } from "lucide-react";
import { BrandCard } from "@/components/shared/card/brand-card";
import { BrandCardSkeleton } from "@/components/shared/skeletons/brand-card-skeleton";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";


export default function BrandsPage() {
  const isLoadingRef = useRef(false);
  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";

  const {
    brands,
    pagination,
    fetchBrands,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    totalBrands,
  } = usePublicBrandsState();

  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);

  useScrollRestoration({ enabled: true, restoreOnMount: true, customKey: "brands" });

  useEffect(() => {
    fetchBrands({ pageNo: 1, status: "ACTIVE", search });
  }, [fetchBrands, search]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoadingRef.current) {
      isLoadingRef.current = true;
      fetchBrands({
        pageNo: pagination.currentPage + 1,
        status: "ACTIVE",
        search,
        append: true,
      }).finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [isLoadingMore, hasMore, pagination.currentPage, fetchBrands, search]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5">
        <PageHeader
          title="Brands"
          icon={Store}
          count={totalBrands}
          subtitle={
            isInitialLoading
              ? "Loading brands..."
              : totalBrands > 0
              ? `${totalBrands} brands available`
              : "Discover our brands"
          }
        />

        {}
        {isInitialLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <BrandCardSkeleton key={i} />
            ))}
          </div>
        )}

        {}
        {!isInitialLoading && brands.length === 0 && (
          <EmptyState
            icon={Store}
            title="No brands available"
            description="There are no brands available at this time"
            size="lg"
          />
        )}

        {}
        {!isInitialLoading && brands.length > 0 && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
              {isLoadingMore &&
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <BrandCardSkeleton key={`more-${i}`} />
                ))}
            </div>

            {isLoadingMore && (
              <div className="flex items-center justify-center py-4 mt-1">
                <div className="flex items-center gap-1 text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs font-medium">Loading more...</span>
                </div>
              </div>
            )}

            {!hasMore && !isLoadingMore && brands.length > 0 && (
              <div className="flex flex-col items-center justify-center mt-7 py-5 px-3">
                <div className="flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-primary/10 mb-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h3 className="text-xs sm:text-xs font-semibold mb-1 text-center">
                  You've seen all brands!
                </h3>
                <p className="text-xs sm:text-xs text-muted-foreground text-center max-w-md">
                  You've reached the end of our brand list. Check back later for new brands!
                </p>
              </div>
            )}

            {}
            {hasMore && !isLoadingMore && (
              <div ref={observerTarget} className="h-3" />
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
