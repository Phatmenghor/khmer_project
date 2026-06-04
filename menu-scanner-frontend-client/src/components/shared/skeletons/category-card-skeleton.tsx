import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const CategoryCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border">
      <CardContent className="p-3 sm:p-3.5 flex flex-col items-center justify-center space-y-2">
        {}
        <div className="relative w-11 h-11 sm:w-18 sm:h-18 bg-muted/50 rounded overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>

        {}
        <div className="w-full space-y-1.5 flex flex-col items-center">
          <div className="h-2 w-16 bg-muted/50 rounded animate-pulse" />
          <div className="h-2 w-11 bg-muted/50 rounded animate-pulse" />
        </div>

        {}
        <div className="h-1.5.5 w-14 bg-muted/50 rounded animate-pulse" />
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
