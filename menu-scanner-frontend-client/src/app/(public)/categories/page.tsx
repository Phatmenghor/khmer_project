"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useCallback, useRef, useState } from "react";
import { usePublicCategoriesState } from "@/features/main/store/state/public-categories-state";
import { LayoutGrid, Loader2, CheckCircle2 } from "lucide-react";
import { CategoryCard } from "@/components/shared/card/category-card";
import { CategoryCardSkeleton } from "@/components/shared/skeletons/category-card-skeleton";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { PageState } from "@/components/shared/page-state";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";

export default function CategoriesPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isLoadingRef = useRef(false);
  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";

  const {
    categories,
    pagination,
    hasMore,
    isInitialLoading: stateIsLoading,
    isLoadingMore,
    totalCategories,
    fetchCategories,
  } = usePublicCategoriesState();

  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);

  useScrollRestoration({ enabled: true, restoreOnMount: true, customKey: "categories" });

  const isInitialLoading = !mounted || stateIsLoading;

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
  }, [isLoadingMore, hasMore, pagination.currentPage, fetchCategories, search]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5">
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

        {}
        {!isInitialLoading && categories.length === 0 && (
          <PageState
            type="empty"
            title="No categories found"
            description="There are no categories available at this time."
            size="lg"
          />
        )}

        {}
        {(categories.length > 0 || isInitialLoading) && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
              {(isInitialLoading || isLoadingMore) &&
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <CategoryCardSkeleton key={`skeleton-${i}`} />
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

            {!hasMore && !isLoadingMore && categories.length > 0 && (
              <div className="flex flex-col items-center justify-center mt-7 py-5 px-3">
                <div className="flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-primary/10 mb-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h3 className="text-xs sm:text-xs font-semibold mb-1 text-center">
                  You've seen all categories!
                </h3>
                <p className="text-xs sm:text-xs text-muted-foreground text-center max-w-md">
                  You've reached the end of our category list. Check back later for new categories!
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
