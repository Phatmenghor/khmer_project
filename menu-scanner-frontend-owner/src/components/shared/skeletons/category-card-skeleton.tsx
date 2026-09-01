import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const CategoryCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border border-border/80 rounded-2xl shadow-2xs bg-card">
      <CardContent className="p-3.5 sm:p-4 flex flex-col items-center justify-center space-y-2.5">
        {/* Category Icon Skeleton */}
        <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl" />

        {/* Category Title Skeletons */}
        <div className="w-full space-y-1.5 flex flex-col items-center">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-2.5 w-14 rounded-md" />
        </div>

        {/* Items Counter Skeleton */}
        <Skeleton className="h-2 w-12 rounded-full" />
      </CardContent>
    </Card>
  );
};

interface CategoryGridSkeletonProps {
  count?: number;
  className?: string;
}

export const CategoryGridSkeleton = ({
  count = 6,
  className,
}: CategoryGridSkeletonProps) => {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CategoryCardSkeleton key={index} />
      ))}
    </div>
  );
};
