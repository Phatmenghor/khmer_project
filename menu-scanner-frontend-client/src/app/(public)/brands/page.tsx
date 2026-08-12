"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePublicBrandsState } from "@/features/main/store/state/public-brands-state";
import { Award, CheckCircle2 } from "lucide-react";
import { BrandGalleryCard } from "@/components/shared/card/brand-gallery-card";
import { BrandCardSkeleton } from "@/components/shared/skeletons/brand-card-skeleton";
import { GridPageSkeleton } from "@/components/shared/skeletons/grid-page-skeleton";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { PageState } from "@/components/shared/page-state";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";

function BrandsPageInner() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";

  const {
    brands,
    fetchBrands,
    isInitialLoading: stateIsLoading,
  } = usePublicBrandsState();

  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);

  useScrollRestoration({ enabled: true, restoreOnMount: true, customKey: "brands" });

  const isInitialLoading = !mounted || stateIsLoading;

  useEffect(() => {
    fetchBrands({ pageNo: 1, status: "ACTIVE", search });
  }, [fetchBrands, search]);

  if (isInitialLoading) {
    return <GridPageSkeleton card={<BrandCardSkeleton />} count={skeletonCount} />;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-primary/5 blur-[120px] rounded-full opacity-60" />

      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5 relative z-10">
        <PageHeader
          title="All Brands"
          subtitle="Browse all available brands. Hover over any card to reveal details!"
          icon={Award}
          count={brands.length}
          countLabel="brands"
        />

        {brands.length === 0 && (
          <PageState
            type="empty"
            title="No brands available"
            description="There are no brands available at this time."
            size="lg"
          />
        )}

        {brands.length > 0 && (
          <div>
            {/* Portfolio Gallery Grid 1x1 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {brands.map((brand) => (
                <BrandGalleryCard key={brand.id} brand={brand} />
              ))}
            </div>

            <div className="flex flex-col items-center justify-center mt-8 py-6 px-4 rounded-2xl border border-border/60 bg-gradient-to-b from-muted/20 via-muted/10 to-background shadow-2xs">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 mb-2.5 shadow-2xs">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-foreground mb-1 text-center">
                All brands loaded! 🎉
              </h3>
              <p className="text-xs text-muted-foreground text-center max-w-md font-medium">
                Select any brand above to browse items!
              </p>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}

export default function BrandsPage() {
  return (
    <Suspense>
      <BrandsPageInner />
    </Suspense>
  );
}
