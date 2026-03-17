import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border">
      {/* Image Skeleton - Square aspect ratio with shimmer */}
      <div className="relative aspect-square w-full bg-muted/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        {/* Badge placeholders */}
        <div className="absolute top-2 left-2">
          <div className="h-5 w-12 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="absolute top-2 right-2">
          <div className="h-5 w-14 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-3 space-y-3">
        {/* Product Name - 2 lines with shimmer */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted/50 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-muted/50 rounded animate-pulse" />
        </div>

        {/* Price Section */}
        <div className="space-y-1.5">
          <div className="h-6 w-24 bg-muted/50 rounded animate-pulse" />
          <div className="h-3 w-20 bg-muted/50 rounded animate-pulse" />
        </div>

        {/* Button */}
        <div className="h-8 w-full bg-muted/50 rounded animate-pulse" />
      </div>
    </Card>
  );
};

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export const ProductGridSkeleton = ({
  count = 8,
  className,
}: ProductGridSkeletonProps) => {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
