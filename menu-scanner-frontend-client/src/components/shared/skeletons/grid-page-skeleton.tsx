import React from "react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/shared/common/page-container";

interface GridPageSkeletonProps {
  card: React.ReactNode;
  count?: number;
  gridClassName?: string;
  className?: string;
}

export function GridPageSkeleton({
  card,
  count = 8,
  gridClassName = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3",
  className,
}: GridPageSkeletonProps) {
  return (
    <PageContainer className={cn("min-h-screen flex flex-col py-3 sm:py-5", className)}>
      <div className="mb-4 space-y-1.5">
        <div className="h-4 w-28 bg-muted animate-pulse rounded" />
        <div className="h-3 w-44 bg-muted animate-pulse rounded" />
      </div>
      <div className={gridClassName}>
        {Array.from({ length: count }).map((_, i) => (
          <React.Fragment key={i}>{card}</React.Fragment>
        ))}
      </div>
    </PageContainer>
  );
}
