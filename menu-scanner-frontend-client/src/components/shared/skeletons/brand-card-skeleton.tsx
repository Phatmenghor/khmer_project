import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const BrandCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border">
      <CardContent className="p-4 sm:p-5 flex flex-col items-center justify-center space-y-3">
        {/* Logo skeleton */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-muted/50 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>

        {/* Brand Name skeleton */}
        <div className="w-full space-y-1.5 flex flex-col items-center">
          <div className="h-3 w-24 bg-muted/50 rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted/50 rounded animate-pulse" />
        </div>

        {/* Product Count skeleton */}
        <div className="h-2.5 w-20 bg-muted/50 rounded animate-pulse" />
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
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <BrandCardSkeleton key={index} />
      ))}
    </div>
  );
};
