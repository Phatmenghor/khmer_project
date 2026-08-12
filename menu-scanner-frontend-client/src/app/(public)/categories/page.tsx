"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { usePublicCategoriesState } from "@/features/main/store/state/public-categories-state";
import { LayoutGrid, CheckCircle2 } from "lucide-react";
import { CategoryGalleryCard } from "@/components/shared/card/category-gallery-card";
import { CategoryCardSkeleton } from "@/components/shared/skeletons/category-card-skeleton";
import { GridPageSkeleton } from "@/components/shared/skeletons/grid-page-skeleton";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { PageState } from "@/components/shared/page-state";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";

function CategoriesPageInner() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";

  const {
    categories,
    isInitialLoading: stateIsLoading,
    fetchCategories,
  } = usePublicCategoriesState();

  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);

  useScrollRestoration({ enabled: true, restoreOnMount: true, customKey: "categories" });

  const isInitialLoading = !mounted || stateIsLoading;

  useEffect(() => {
    fetchCategories({ pageNo: 1, status: "ACTIVE", search });
  }, [fetchCategories, search]);

  if (isInitialLoading) {
    return <GridPageSkeleton card={<CategoryCardSkeleton />} count={skeletonCount} />;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-primary/5 blur-[120px] rounded-full opacity-60" />

      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5 relative z-10">
        <PageHeader
          title="All Categories"
          subtitle="Explore our full catalog sorted by categories. Hover over any card to reveal details!"
          icon={LayoutGrid}
          count={categories.length}
          countLabel="categories"
        />

        {categories.length === 0 && (
          <PageState
            type="empty"
            title="No categories found"
            description="There are no categories available at this time."
            size="lg"
          />
        )}

        {categories.length > 0 && (
          <div>
            {/* Portfolio Gallery Grid 1x1 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((category) => (
                <CategoryGalleryCard key={category.id} category={category} />
              ))}
            </div>

            <div className="flex flex-col items-center justify-center mt-8 py-6 px-4 rounded-2xl border border-border/60 bg-gradient-to-b from-muted/20 via-muted/10 to-background shadow-2xs">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 mb-2.5 shadow-2xs">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-foreground mb-1 text-center">
                All categories loaded! 🎉
              </h3>
              <p className="text-xs text-muted-foreground text-center max-w-md font-medium">
                Select any category above to view items!
              </p>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense>
      <CategoriesPageInner />
    </Suspense>
  );
}
