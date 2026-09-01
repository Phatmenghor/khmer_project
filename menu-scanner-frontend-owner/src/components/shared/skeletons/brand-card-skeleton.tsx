import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const BrandCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border border-border/80 rounded-2xl shadow-2xs bg-card">
      <CardContent className="p-3.5 sm:p-4 flex flex-col items-center justify-center space-y-2.5">
        {/* Brand Icon Skeleton */}
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />

        {/* Brand Title Skeletons */}
        <div className="w-full space-y-1.5 flex flex-col items-center">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-2.5 w-12 rounded-md" />
        </div>

        {/* Subtitle / Counter */}
        <Skeleton className="h-2 w-14 rounded-full" />
      </CardContent>
    </Card>
  );
};

interface BrandGridSkeletonProps {
  count?: number;
  className?: string;
}

export const BrandGridSkeleton = ({
  count = 12,
  className,
}: BrandGridSkeletonProps) => {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <BrandCardSkeleton key={index} />
      ))}
    </div>
  );
};
