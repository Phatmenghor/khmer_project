"use client";

import { useEffect } from "react";
import { usePublicSubcategoriesState } from "@/redux/features/main/store/state/public-subcategories-state";
import { LayoutGrid } from "lucide-react";
import { SubcategoryCard } from "@/components/shared/card/subcategory-card";
import { SubcategoryCardSkeleton } from "@/components/shared/skeletons/subcategory-card-skeleton";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";

export default function SubcategoriesPage() {
  const {
    data,
    isLoading,
    error,
    fetchSubcategories,
  } = usePublicSubcategoriesState();

  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);
  const totalSubcategories = (data || []).reduce((acc, group) => acc + group.subcategories.length, 0);

  useScrollRestoration({ enabled: true, restoreOnMount: true, customKey: "subcategories" });

  useEffect(() => {
    console.log("[SubcategoriesPage] Mounted, fetching data...");
    fetchSubcategories({ status: "ACTIVE" });
  }, [fetchSubcategories]);

  useEffect(() => {
    console.log("[SubcategoriesPage] State updated - isLoading:", isLoading, "data length:", data?.length, "error:", error);
  }, [isLoading, data, error]);

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="py-4 sm:py-8">
        <PageHeader
          title="Subcategories"
          icon={LayoutGrid}
          count={totalSubcategories}
          subtitle={
            isLoading
              ? "Loading subcategories..."
              : totalSubcategories > 0
              ? `${totalSubcategories} subcategories available`
              : "Browse all subcategories"
          }
        />

        {/* Loading State */}
        {isLoading && (
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

        {/* Error State */}
        {error && (
          <EmptyState
            icon={LayoutGrid}
            title="Error loading subcategories"
            description={error}
            size="lg"
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && totalSubcategories === 0 && (
          <EmptyState
            icon={LayoutGrid}
            title="No subcategories found"
            description="There are no subcategories available at this time"
            size="lg"
          />
        )}

        {/* Subcategories Grouped by Category */}
        {!isLoading && totalSubcategories > 0 && (
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
          </div>
        )}
      </PageContainer>
    </div>
  );
}
