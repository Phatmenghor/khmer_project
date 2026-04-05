"use client";

import { useSearchParams } from "next/navigation";
"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { usePublicCategoriesState } from "@/redux/features/main/store/state/public-categories-state";
  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";
import { LayoutGrid, Loader2, CheckCircle2 } from "lucide-react";
import { CategoryCard } from "@/components/shared/card/category-card";
import { CategoryCardSkeleton } from "@/components/shared/skeletons/category-card-skeleton";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";

export default function CategoriesPage() {
  const isLoadingRef = useRef(false);
  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";

  const {
    categories,
    pagination,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    totalCategories,
    fetchCategories,
  } = usePublicCategoriesState();

  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);

  useScrollRestoration({ enabled: true, restoreOnMount: true, customKey: "categories" });

  useEffect(() => {
    fetchCategories({ pageNo: 1, status: "ACTIVE", search });
  }, [fetchCategories, search]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoadingRef.current) {
      isLoadingRef.current = true;
      fetchCategories({
        pageNo: pagination.currentPage + 1,
        status: "ACTIVE", search,
        append: true,
      }).finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [isLoadingMore, hasMore, pagination.currentPage, fetchCategories]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="py-4 sm:py-8">
        <PageHeader
          title="Categories"
          icon={LayoutGrid}
          count={totalCategories}
          subtitle={
            isInitialLoading
              ? "Loading categories..."
              : totalCategories > 0
              ? `${totalCategories} categories available`
              : "Browse all categories"
          }
        />

        {/* Initial Loading */}
        {isInitialLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isInitialLoading && categories.length === 0 && (
          <EmptyState
            icon={LayoutGrid}
            title="No categories found"
            description="There are no categories available at this time"
            size="lg"
          />
        )}

        {/* Categories Grid */}
        {!isInitialLoading && categories.length > 0 && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
              {isLoadingMore &&
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <CategoryCardSkeleton key={`more-${i}`} />
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

            {!hasMore && !isLoadingMore && categories.length > 0 && (
              <div className="flex flex-col items-center justify-center mt-8 py-8">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Showing all {totalCategories} categories
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
