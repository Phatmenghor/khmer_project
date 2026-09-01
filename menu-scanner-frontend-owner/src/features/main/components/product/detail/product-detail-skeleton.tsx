"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/shared/common/page-container";

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background relative pb-20 sm:pb-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/5 blur-[140px] rounded-full opacity-70" />

      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-4 lg:py-5 relative z-10">
        {/* Top Header Actions Bar Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-36 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>

        {/* ── Main Product Detail Card Skeleton ── */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-3.5 sm:p-5 lg:p-5 shadow-2xs mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[9fr_11fr] gap-4 sm:gap-5 lg:gap-6">
            {/* Left Column: Image Gallery Skeleton */}
            <div className="flex gap-2.5 flex-col sm:flex-row">
              {/* Vertical Thumb Strip Skeleton */}
              <div className="hidden sm:flex flex-col items-center justify-between w-[54px] sm:w-[60px] lg:w-[66px] shrink-0 h-[250px] sm:h-[290px] md:h-[310px] lg:h-[350px] space-y-2 py-1">
                <Skeleton className="w-full h-4 rounded-md" />
                <div className="flex-1 w-full space-y-2">
                  <Skeleton className="w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] lg:w-[60px] lg:h-[60px] rounded-xl" />
                  <Skeleton className="w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] lg:w-[60px] lg:h-[60px] rounded-xl" />
                  <Skeleton className="w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] lg:w-[60px] lg:h-[60px] rounded-xl" />
                  <Skeleton className="w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] lg:w-[60px] lg:h-[60px] rounded-xl" />
                </div>
                <Skeleton className="w-full h-4 rounded-md" />
              </div>

              {/* Main Cover Image Skeleton */}
              <Skeleton className="h-[250px] sm:h-[290px] md:h-[310px] lg:h-[350px] rounded-2xl flex-1" />
            </div>

            {/* Right Column: Product Detail Header & Purchasing Card Skeleton */}
            <div className="space-y-4">
              {/* Header Skeleton */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-7 sm:h-8 w-3/4 rounded-lg" />
                <div className="flex items-baseline gap-2 pt-1">
                  <Skeleton className="h-8 w-28 rounded-lg" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <Skeleton className="h-3.5 w-full rounded-md" />
                  <Skeleton className="h-3.5 w-4/5 rounded-md" />
                </div>
              </div>

              {/* Purchasing Card Skeleton */}
              <div className="bg-muted/20 border border-border/60 rounded-2xl p-3.5 sm:p-4 space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <div className="grid grid-cols-3 gap-1.5">
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-border/40">
                  <Skeleton className="h-4 w-36 rounded-md" />
                  <div className="grid grid-cols-2 gap-1.5">
                    <Skeleton className="h-9 rounded-xl" />
                    <Skeleton className="h-9 rounded-xl" />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-10 flex-1 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Similar Products Skeleton ── */}
        <div className="pt-5 sm:pt-6 border-t border-border/60 mt-6">
          <Skeleton className="h-6 w-44 rounded-md mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5 lg:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2.5 rounded-2xl border border-border/60 p-2.5 bg-card">
                <Skeleton className="h-36 sm:h-40 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-5 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
