"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useCallback, useRef } from "react";
import { usePublicSubcategoriesState } from "@/redux/features/main/store/state/public-subcategories-state";
import { LayoutGrid, Loader2 } from "lucide-react";
import { SubcategoryCard } from "@/components/shared/card/subcategory-card";
import { SubcategoryCardSkeleton } from "@/components/shared/skeletons/subcategory-card-skeleton";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";

export default function SubcategoriesPage() {
  const isLoadingRef = useRef(false);
  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";

  const {
    data,
    pagination,
    isLoading: isInitialLoading,
    loadedFilters,
    fetchSubcategories,
    updateLoadedFilters,
    resetState,
  } = usePublicSubcategoriesState();

  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);
  const totalSubcategories = data.reduce((acc, group) => acc + group.subcategories.length, 0);
  const hasMore = pagination.hasMore;
  const isLoadingMore = false;

  useScrollRestoration({ enabled: true, restoreOnMount: true, customKey: "subcategories" });

  useEffect(() => {
    const currentFilters = JSON.stringify({ pageNo: 1, search });
    if (currentFilters !== loadedFilters) {
      resetState();
      updateLoadedFilters(currentFilters);
      fetchSubcategories({ pageNo: 1, status: "ACTIVE", search });
    }
  }, [search, loadedFilters, fetchSubcategories, updateLoadedFilters, resetState]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoadingRef.current) {
      isLoadingRef.current = true;
      fetchSubcategories({
        pageNo: pagination.currentPage + 1,
        status: "ACTIVE",
        search,
        append: true,
      }).finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [isLoadingMore, hasMore, pagination.currentPage, fetchSubcategories, search]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="py-4 sm:py-8">
        <PageHeader
          title="Subcategories"
          icon={LayoutGrid}
          count={totalSubcategories}
          subtitle={
            isInitialLoading
              ? "Loading subcategories..."
              : totalSubcategories > 0
              ? `${totalSubcategories} subcategories available`
              : "Browse all subcategories"
          }
        />

        {/* Initial Loading */}
        {isInitialLoading && (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, groupIndex) => (
              <div key={groupIndex}>
                <div className="h-6 bg-muted rounded mb-4 w-40 animate-pulse"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {Array.from({ length: skeletonCount }).map((_, i) => (
                    <SubcategoryCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isInitialLoading && totalSubcategories === 0 && (
          <EmptyState
            icon={LayoutGrid}
            title="No subcategories found"
            description="There are no subcategories available at this time"
            size="lg"
          />
        )}

        {/* Subcategories Grouped by Category */}
        {!isInitialLoading && totalSubcategories > 0 && (
          <div className="space-y-8">
            {data.map((group) => (
              <div key={group.category.id}>
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                  {group.category.name}
                  <span className="text-sm text-muted-foreground font-normal">
                    ({group.subcategories.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {group.subcategories.map((subcategory) => (
                    <SubcategoryCard
                      key={subcategory.id}
                      subcategory={subcategory}
                      categoryId={group.category.id}
                    />
                  ))}
                </div>
              </div>
            ))}

            {isLoadingMore && (
              <div className="flex items-center justify-center py-6 mt-2">
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Loading more...</span>
                </div>
              </div>
            )}

            {!hasMore && !isLoadingMore && totalSubcategories > 0 && (
              <div className="flex flex-col items-center justify-center mt-8 py-8">
                <p className="text-center text-sm text-muted-foreground">
                  Showing all {totalSubcategories} subcategories
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
