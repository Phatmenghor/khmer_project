"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePublicBrandsState } from "@/redux/features/main/store/state/public-brands-state";
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
    fetchBrands({ pageNo: 1, status: "ACTIVE" });
  }, [fetchBrands]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoadingRef.current) {
      isLoadingRef.current = true;
      fetchBrands({
        pageNo: pagination.currentPage + 1,
        status: "ACTIVE",
        append: true,
      }).finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [isLoadingMore, hasMore, pagination.currentPage, fetchBrands]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="py-4 sm:py-8">
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

        {/* Initial Loading */}
        {isInitialLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <BrandCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isInitialLoading && brands.length === 0 && (
          <EmptyState
            icon={Store}
            title="No brands available"
            description="There are no brands available at this time"
            size="lg"
          />
        )}

        {/* Brands Grid */}
        {!isInitialLoading && brands.length > 0 && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
              {isLoadingMore &&
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <BrandCardSkeleton key={`more-${i}`} />
                ))}
            </div>

            {isLoadingMore && (
              <div className="flex items-center justify-center py-6 mt-2">
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Loading more...</span>
                </div>
              </div>
            )}

            {!hasMore && !isLoadingMore && brands.length > 0 && (
              <div className="flex flex-col items-center justify-center mt-8 py-8">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Showing all {totalBrands} brands
                </p>
              </div>
            )}

            {/* Sentinel div — callback ref ensures observer connects after mount */}
            {hasMore && !isLoadingMore && (
              <div ref={observerTarget} className="h-4" />
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
